import { Search, SlidersHorizontal, X } from "lucide-react";
import type { CsvData } from "@/lib/csv";

export interface ColumnFilter {
  column: string;
  value: string;
}

interface FilterBarProps {
  data: CsvData;
  search: string;
  onSearchChange: (value: string) => void;
  filters: ColumnFilter[];
  onFiltersChange: (filters: ColumnFilter[]) => void;
  distinctValues: Map<string, string[]>;
}

export function FilterBar({
  data,
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  distinctValues,
}: FilterBarProps) {
  const setFilter = (column: string, value: string) => {
    const next = filters.filter((f) => f.column !== column);
    if (value) next.push({ column, value });
    onFiltersChange(next);
  };

  const activeCount = filters.length + (search ? 1 : 0);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search across all columns…"
            className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          Column filters
        </span>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              onFiltersChange([]);
            }}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {data.columns.map((column) => {
          const values = distinctValues.get(column) ?? [];
          const active = filters.find((f) => f.column === column)?.value ?? "";
          // Text input for high-cardinality columns, dropdown otherwise
          const useDropdown = values.length > 1 && values.length <= 50;
          return (
            <div key={column} className="flex items-center">
              {useDropdown ? (
                <select
                  value={active}
                  onChange={(e) => setFilter(column, e.target.value)}
                  className={`h-9 max-w-48 rounded-lg border px-2.5 text-xs font-medium outline-none transition-colors focus:ring-2 focus:ring-ring/30 ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-background text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <option value="">{column}: All</option>
                  {values.map((v) => (
                    <option key={v} value={v}>
                      {v || "(empty)"}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={active}
                  onChange={(e) => setFilter(column, e.target.value)}
                  placeholder={`${column}…`}
                  className={`h-9 w-36 rounded-lg border px-2.5 text-xs font-medium outline-none transition-colors placeholder:font-normal focus:ring-2 focus:ring-ring/30 ${
                    active
                      ? "border-primary bg-primary/10 text-primary placeholder:text-primary/60"
                      : "border-input bg-background text-foreground placeholder:text-muted-foreground hover:border-primary/50"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
