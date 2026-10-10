import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { toCsvString, type CsvData } from "@/lib/csv";
import type { ColumnFilter } from "./FilterBar";

const PAGE_SIZE = 15;

type SortDirection = "asc" | "desc" | null;

interface DataTableProps {
  data: CsvData;
  search: string;
  filters: ColumnFilter[];
}

function isNumericColumn(rows: Record<string, string>[], column: string): boolean {
  let checked = 0;
  for (const row of rows) {
    const v = row[column];
    if (v === undefined || v === "") continue;
    if (Number.isNaN(Number(v))) return false;
    if (++checked >= 25) break;
  }
  return checked > 0;
}

export function DataTable({ data, search, filters }: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [page, setPage] = useState(0);

  const numericColumns = useMemo(() => {
    const set = new Set<string>();
    for (const column of data.columns) {
      if (isNumericColumn(data.rows, column)) set.add(column);
    }
    return set;
  }, [data]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.rows.filter((row) => {
      for (const filter of filters) {
        const cell = (row[filter.column] ?? "").toLowerCase();
        if (!cell.includes(filter.value.toLowerCase())) return false;
      }
      if (query) {
        const match = data.columns.some((c) => (row[c] ?? "").toLowerCase().includes(query));
        if (!match) return false;
      }
      return true;
    });
  }, [data, search, filters]);

  const sortedRows = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredRows;
    const numeric = numericColumns.has(sortColumn);
    const dir = sortDirection === "asc" ? 1 : -1;
    return [...filteredRows].sort((a, b) => {
      const av = a[sortColumn] ?? "";
      const bv = b[sortColumn] ?? "";
      if (numeric) return (Number(av) - Number(bv)) * dir;
      return av.localeCompare(bv) * dir;
    });
  }, [filteredRows, sortColumn, sortDirection, numericColumns]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = sortedRows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const toggleSort = (column: string) => {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else {
      setSortColumn(null);
      setSortDirection(null);
    }
  };

  const downloadFiltered = () => {
    const csv = toCsvString(data.columns, sortedRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `filtered-${data.fileName}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {sortedRows.length === 0 ? 0 : safePage * PAGE_SIZE + 1}–
            {Math.min((safePage + 1) * PAGE_SIZE, sortedRows.length)}
          </span>{" "}
          of <span className="font-semibold text-foreground">{sortedRows.length}</span> rows
          {sortedRows.length !== data.rows.length && (
            <> (filtered from {data.rows.length})</>
          )}
        </p>
        <button
          type="button"
          onClick={downloadFiltered}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Download className="h-3.5 w-3.5" />
          Download filtered CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60">
              {data.columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort(column)}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {column.replaceAll("_", " ")}
                    {sortColumn === column && sortDirection === "asc" ? (
                      <ArrowUp className="h-3.5 w-3.5 text-primary" />
                    ) : sortColumn === column && sortDirection === "desc" ? (
                      <ArrowDown className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={data.columns.length}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No rows match your filters. Try clearing some filters.
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => (
                <tr
                  key={safePage * PAGE_SIZE + i}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-accent/40"
                >
                  {data.columns.map((column) => (
                    <td
                      key={column}
                      className={`max-w-56 truncate whitespace-nowrap px-4 py-2.5 text-foreground/90 ${
                        numericColumns.has(column) ? "text-right font-mono text-xs" : ""
                      }`}
                      title={row[column]}
                    >
                      {row[column] || <span className="text-muted-foreground/50">—</span>}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Page <span className="font-semibold text-foreground">{safePage + 1}</span> of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
