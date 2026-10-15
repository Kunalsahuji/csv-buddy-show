import type { CsvData } from "@/lib/csv";

export interface DateRangeFilter {
  column: string;
  start: string;
  end: string;
}

const DATE_HEADER_PATTERN = /\b(date|day|time|timestamp|created|updated|modified|birth|dob|expiry|expiration|start|end)\b/i;

function makeDateKey(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Converts common CSV date values into sortable YYYY-MM-DD calendar dates. */
export function parseDateKey(value: string | undefined): string | null {
  const input = value?.trim();
  if (!input) return null;

  const yearFirst = input.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:$|[T\s])/);
  if (yearFirst) {
    return makeDateKey(Number(yearFirst[1]), Number(yearFirst[2]), Number(yearFirst[3]));
  }

  const yearLast = input.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (yearLast) {
    const first = Number(yearLast[1]);
    const second = Number(yearLast[2]);
    const year = Number(yearLast[3]);
    // Resolve ambiguous slash dates as month-first, while recognizing unambiguous D/M dates.
    const month = first > 12 ? second : first;
    const day = first > 12 ? first : second;
    return makeDateKey(year, month, day);
  }

  // Month-name dates and standard timestamps are handled by the platform parser.
  if (!/[a-z]/i.test(input)) return null;
  const timestamp = Date.parse(input);
  if (Number.isNaN(timestamp)) return null;
  const date = new Date(timestamp);
  return makeDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/** Detects likely date fields from their headings and the values they contain. */
export function detectDateColumns(data: CsvData): string[] {
  return data.columns.filter((column) => {
    const normalizedHeading = column.replace(/[^a-z0-9]+/gi, " ");
    const dateNamed = DATE_HEADER_PATTERN.test(normalizedHeading);
    const values = data.rows
      .map((row) => row[column]?.trim() ?? "")
      .filter((value) => value.length > 0);
    if (values.length === 0) return dateNamed;

    const validCount = values.reduce((count, value) => count + Number(parseDateKey(value) !== null), 0);
    if (validCount === 0) return dateNamed;
    return dateNamed || validCount / values.length >= 0.6;
  });
}

export function isWithinDateRange(value: string | undefined, filter: DateRangeFilter): boolean {
  const date = parseDateKey(value);
  if (!date) return false;
  return (!filter.start || date >= filter.start) && (!filter.end || date <= filter.end);
}