import { useCallback, useRef, useState } from "react";
import { FileSpreadsheet, UploadCloud, XCircle } from "lucide-react";
import { formatBytes, validateCsvFile } from "@/lib/csv";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  loading: boolean;
  error: string | null;
}

export function UploadZone({ onFileSelected, loading, error }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      const validationError = validateCsvFile(file);
      if (validationError) {
        setLocalError(validationError);
        return;
      }
      setLocalError(null);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const shownError = localError ?? error;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        disabled={loading}
        className={`group flex w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-card px-6 py-16 text-center transition-all duration-200 ${
          dragOver
            ? "border-primary bg-accent scale-[1.01]"
            : "border-border hover:border-primary/60 hover:bg-accent/50"
        } ${loading ? "cursor-wait opacity-70" : "cursor-pointer"}`}
      >
        <span
          className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${
            dragOver ? "bg-primary text-primary-foreground" : "bg-accent text-primary"
          }`}
        >
          {loading ? (
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <UploadCloud className="h-8 w-8" />
          )}
        </span>
        <span>
          <span className="block text-lg font-semibold text-foreground">
            {loading
              ? "Parsing your file…"
              : dragOver
                ? "Drop your CSV here"
                : "Drag & drop your CSV file"}
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            or <span className="font-medium text-primary underline underline-offset-2">browse from your computer</span>
          </span>
        </span>
        <span className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          .csv files only · up to {formatBytes(10 * 1024 * 1024)}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {shownError && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <XCircle className="h-4 w-4 shrink-0" />
          {shownError}
        </div>
      )}
    </div>
  );
}
