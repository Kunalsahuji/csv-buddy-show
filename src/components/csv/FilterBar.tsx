import { CalendarDays, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CsvData } from "@/lib/csv";
import type { DateRangeFilter } from "@/lib/csv-dates";

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
  dateColumns: string[];
  dateRange: DateRangeFilter;
  onDateRangeChange: (filter: DateRangeFilter) => void;
  onApplyDateRange: () => void;
  onClearDateRange: () => void;
  onClearAll: () => void;
}

export function FilterBar({
  data,
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  distinctValues,
  dateColumns,
  dateRange,
  onDateRangeChange,
  onApplyDateRange,
  onClearDateRange,
  onClearAll,
}: FilterBarProps) {
  const setFilter = (column: string, value: string) => {
    const next = filters.filter((f) => f.column !== column);
    if (value) next.push({ column, value });
    onFiltersChange(next);
  };

  const dateFilterActive = Boolean(dateRange.start || dateRange.end);
  const activeCount = filters.length + Number(Boolean(search)) + Number(dateFilterActive);
  const invalidDateRange = Boolean(dateRange.start && dateRange.end && dateRange.start > dateRange.end);

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
          <Button type="button" variant="outline" size="sm" onClick={onClearAll} className="h-8 gap-1 text-xs text-muted-foreground">
            <X className="h-3.5 w-3.5" />
            Clear all ({activeCount})
          </Button>
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

      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />
          Date range
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(180px,1.2fr)_repeat(2,minmax(150px,1fr))_auto_auto] lg:items-end">
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            Date column
            <select
              value={dateRange.column}
              onChange={(event) => onDateRangeChange({ ...dateRange, column: event.target.value })}
              disabled={dateColumns.length === 0}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Date column"
            >
              {dateColumns.length === 0 ? (
                <option value="">No date columns detected</option>
              ) : (
                dateColumns.map((column) => <option key={column} value={column}>{column}</option>)
              )}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            Start Date
            <input
              type="date"
              value={dateRange.start}
              onChange={(event) => onDateRangeChange({ ...dateRange, start: event.target.value })}
              disabled={dateColumns.length === 0}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            End Date
            <input
              type="date"
              value={dateRange.end}
              onChange={(event) => onDateRangeChange({ ...dateRange, end: event.target.value })}
              disabled={dateColumns.length === 0}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>
          <Button
            type="button"
            onClick={onApplyDateRange}
            disabled={dateColumns.length === 0 || invalidDateRange || (!dateRange.start && !dateRange.end)}
            className="h-10 w-full sm:col-span-2 lg:col-span-1"
            aria-label="Apply Date Filter"
          >
            Apply Date Filter
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClearDateRange}
            disabled={!dateFilterActive}
            className="h-10 w-full sm:col-span-2 lg:col-span-1"
          >
            Clear Date Filter
          </Button>
        </div>
        {dateColumns.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">No date columns were found in this CSV.</p>
        ) : invalidDateRange ? (
          <p className="mt-2 text-xs text-destructive" role="alert">Start date must be on or before the end date.</p>
        ) : null}
      </div>
    </div>
  );
}
