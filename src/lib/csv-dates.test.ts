import { describe, expect, it } from "vitest";
import { detectDateColumns, isWithinDateRange, parseDateKey } from "@/lib/csv-dates";
import type { CsvData } from "@/lib/csv";

describe("CSV date helpers", () => {
  it("parses common date formats and rejects invalid or empty dates", () => {
    expect(parseDateKey("2024-02-29")).toBe("2024-02-29");
    expect(parseDateKey("2/29/2024")).toBe("2024-02-29");
    expect(parseDateKey("29.02.2024")).toBe("2024-02-29");
    expect(parseDateKey("February 29, 2024")).toBe("2024-02-29");
    expect(parseDateKey("2023-02-29")).toBeNull();
    expect(parseDateKey(" ")).toBeNull();
  });

  it("detects date columns from names or consistent date values", () => {
    const data: CsvData = {
      columns: ["created_at", "When", "quantity", "empty_date"],
      rows: [
        { created_at: "2024-01-01T10:30:00Z", When: "01/02/2024", quantity: "12", empty_date: "" },
        { created_at: "", When: "2024-01-03", quantity: "14", empty_date: "" },
      ],
      fileName: "test.csv",
      fileSize: 10,
    };
    expect(detectDateColumns(data)).toEqual(["created_at", "When", "empty_date"]);
  });

  it("includes both range boundaries and excludes invalid or out-of-range values", () => {
    const range = { column: "date", start: "2024-02-01", end: "2024-02-29" };
    expect(isWithinDateRange("2024-02-01", range)).toBe(true);
    expect(isWithinDateRange("2024-02-29", range)).toBe(true);
    expect(isWithinDateRange("2024-01-31", range)).toBe(false);
    expect(isWithinDateRange("not a date", range)).toBe(false);
    expect(isWithinDateRange(undefined, range)).toBe(false);
  });
});