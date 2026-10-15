import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { Columns3, FileSpreadsheet, Rows3, Sparkles, Trash2 } from "lucide-react";
import { parseCsvFile, formatBytes, type CsvData } from "@/lib/csv";
import { UploadZone } from "@/components/csv/UploadZone";
import { FilterBar, type ColumnFilter } from "@/components/csv/FilterBar";
import { DataTable } from "@/components/csv/DataTable";
import { detectDateColumns, type DateRangeFilter } from "@/lib/csv-dates";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CSV Insight — Upload, Explore & Filter CSV Data" },
      {
        name: "description",
        content:
          "Upload any CSV file and instantly explore it in your browser: search, filter by column, sort, and export the filtered results. 100% client-side — your data never leaves your device.",
      },
      { property: "og:title", content: "CSV Insight — Upload, Explore & Filter CSV Data" },
      {
        property: "og:description",
        content:
          "Upload any CSV file and instantly explore it in your browser: search, filter by column, sort, and export the filtered results.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ColumnFilter[]>([]);
  const [dateRange, setDateRange] = useState<DateRangeFilter>({ column: "", start: "", end: "" });
  const [appliedDateRange, setAppliedDateRange] = useState<DateRangeFilter | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const parsed = await parseCsvFile(file);
      setCsvData(parsed);
      setSearch("");
      setFilters([]);
      setDateRange({ column: "", start: "", end: "" });
      setAppliedDateRange(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this file.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSample = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/data/sample.csv");
      if (!res.ok) throw new Error("Sample file not found.");
      const blob = await res.blob();
      const file = new File([blob], "shampoo_share_of_shelf_1.csv", { type: "text/csv" });
      const parsed = await parseCsvFile(file);
      setCsvData(parsed);
      setSearch("");
      setFilters([]);
      setDateRange({ column: "", start: "", end: "" });
      setAppliedDateRange(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the sample file.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => {
    setCsvData(null);
    setSearch("");
    setFilters([]);
    setDateRange({ column: "", start: "", end: "" });
    setAppliedDateRange(null);
    setError(null);
  };

  const distinctValues = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!csvData) return map;
    for (const column of csvData.columns) {
      const values = new Set<string>();
      for (const row of csvData.rows) {
        values.add(row[column] ?? "");
        if (values.size > 50) break;
      }
      map.set(
        column,
        [...values].sort((a, b) => a.localeCompare(b))
      );
    }
    return map;
  }, [csvData]);

  const dateColumns = useMemo(() => (csvData ? detectDateColumns(csvData) : []), [csvData]);

  const updateDateRange = (next: DateRangeFilter) => {
    setDateRange(next);
    setAppliedDateRange((current) =>
      current && current.column === next.column && current.start === next.start && current.end === next.end
        ? current
        : current
    );
  };

  const applyDateRange = () => {
    if (!dateRange.column || (!dateRange.start && !dateRange.end)) return;
    if (dateRange.start && dateRange.end && dateRange.start > dateRange.end) return;
    setAppliedDateRange({ ...dateRange });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-base font-bold leading-tight text-foreground">CSV Insight</h1>
              <p className="text-xs text-muted-foreground">Upload · Filter · Explore</p>
            </div>
          </div>
          {csvData && (
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Upload a different file
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {!csvData ? (
          <div className="flex flex-col items-center gap-8 py-10">
            <div className="max-w-xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Explore your CSV data in seconds
              </h2>
              <p className="mt-3 text-muted-foreground">
                Drop any CSV file to view it as an interactive table. Search everything, filter by
                any column, sort, and export — all in your browser. Your data never leaves your
                device.
              </p>
            </div>
            <UploadZone onFileSelected={handleFile} loading={loading} error={error} />
            <button
              type="button"
              onClick={loadSample}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Try with sample data
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* File summary */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                  <FileSpreadsheet className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground" title={csvData.fileName}>
                    {csvData.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatBytes(csvData.fileSize)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                  <Rows3 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {csvData.rows.length.toLocaleString()} rows
                  </p>
                  <p className="text-xs text-muted-foreground">Total records</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                  <Columns3 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{csvData.columns.length} columns</p>
                  <p className="text-xs text-muted-foreground">All filterable</p>
                </div>
              </div>
            </div>

            <FilterBar
              data={csvData}
              search={search}
              onSearchChange={(v) => {
                setSearch(v);
              }}
              filters={filters}
              onFiltersChange={setFilters}
              distinctValues={distinctValues}
              dateColumns={dateColumns}
              dateRange={dateRange}
              onDateRangeChange={updateDateRange}
              onApplyDateRange={applyDateRange}
              onClearDateRange={() => {
                const cleared = { column: dateColumns[0] ?? "", start: "", end: "" };
                setDateRange(cleared);
                setAppliedDateRange(null);
              }}
              onClearAll={() => {
                setSearch("");
                setFilters([]);
                setDateRange({ column: dateColumns[0] ?? "", start: "", end: "" });
                setAppliedDateRange(null);
              }}
            />

            <DataTable data={csvData} search={search} filters={filters} dateRange={appliedDateRange} />
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-center text-xs text-muted-foreground">
          CSV Insight — 100% client-side processing. Your files are never uploaded to any server.
        </p>
      </footer>
    </div>
  );
}
