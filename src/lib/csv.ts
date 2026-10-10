import Papa from "papaparse";

export interface CsvData {
  columns: string[];
  rows: Record<string, string>[];
  fileName: string;
  fileSize: number;
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function validateCsvFile(file: File): string | null {
  const isCsv =
    file.type === "text/csv" ||
    file.type === "application/vnd.ms-excel" ||
    file.name.toLowerCase().endsWith(".csv");
  if (!isCsv) return "Only .csv files are supported.";
  if (file.size > MAX_FILE_SIZE) return "File is too large. Maximum size is 10 MB.";
  if (file.size === 0) return "The file is empty.";
  return null;
}

export function parseCsvFile(file: File): Promise<CsvData> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const columns = (results.meta.fields ?? []).filter(Boolean);
        if (columns.length === 0) {
          reject(new Error("No columns found. Make sure the CSV has a header row."));
          return;
        }
        resolve({
          columns,
          rows: results.data,
          fileName: file.name,
          fileSize: file.size,
        });
      },
      error: (error) => reject(new Error(`Failed to parse CSV: ${error.message}`)),
    });
  });
}

export function toCsvString(columns: string[], rows: Record<string, string>[]): string {
  return Papa.unparse({
    fields: columns,
    data: rows.map((row) => columns.map((c) => row[c] ?? "")),
  });
}
