"use client";

import { useState, useCallback, useRef } from "react";
import { bulkImportClients } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileUp, X, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const VALID_PLAN_TYPES = ["401k", "403b", "defined_benefit", "457b", "profit_sharing", "other"];

const CSV_HEADERS = [
  "name",
  "plan_type",
  "plan_year_end",
  "participant_count",
  "has_safe_harbor",
  "has_auto_enrollment",
  "has_rmd",
  "contact_name",
  "contact_email",
];

const SAMPLE_CSV = `name,plan_type,plan_year_end,participant_count,has_safe_harbor,has_auto_enrollment,has_rmd,contact_name,contact_email
Acme Corp,401k,2026-12-31,150,true,true,false,Jane Smith,jane@acme.com
Beta LLC,403b,2026-06-30,45,false,false,true,John Doe,john@beta.com
Gamma Inc,defined_benefit,2026-12-31,,false,false,false,,`;

type ParsedRow = {
  name: string;
  plan_type: string;
  plan_year_end: string;
  participant_count: number | null;
  has_safe_harbor: boolean;
  has_auto_enrollment: boolean;
  has_rmd: boolean;
  contact_name: string | null;
  contact_email: string | null;
};

type RowValidation = {
  row: ParsedRow;
  errors: string[];
};

type ImportResult = {
  name: string;
  success: boolean;
  error?: string;
};

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseBool(value: string): boolean {
  return ["true", "1", "yes", "on"].includes(value.toLowerCase().trim());
}

function validateRow(row: ParsedRow, index: number): RowValidation {
  const errors: string[] = [];

  if (!row.name || row.name.trim() === "") {
    errors.push("Name is required");
  }

  if (!VALID_PLAN_TYPES.includes(row.plan_type)) {
    errors.push(`Invalid plan_type "${row.plan_type}". Must be one of: ${VALID_PLAN_TYPES.join(", ")}`);
  }

  if (!row.plan_year_end || !/^\d{4}-\d{2}-\d{2}$/.test(row.plan_year_end)) {
    errors.push("plan_year_end must be in YYYY-MM-DD format");
  }

  if (row.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.contact_email)) {
    errors.push("Invalid contact_email format");
  }

  return { row, errors };
}

function parseCSV(text: string): RowValidation[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

  const headerMap: Record<string, number> = {};
  headers.forEach((h, i) => {
    headerMap[h] = i;
  });

  const results: RowValidation[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.every((f) => f === "")) continue;

    const get = (key: string) => {
      const idx = headerMap[key];
      return idx !== undefined && idx < fields.length ? fields[idx] : "";
    };

    const participantStr = get("participant_count");
    const row: ParsedRow = {
      name: get("name"),
      plan_type: get("plan_type"),
      plan_year_end: get("plan_year_end"),
      participant_count: participantStr ? parseInt(participantStr, 10) || null : null,
      has_safe_harbor: parseBool(get("has_safe_harbor")),
      has_auto_enrollment: parseBool(get("has_auto_enrollment")),
      has_rmd: parseBool(get("has_rmd")),
      contact_name: get("contact_name") || null,
      contact_email: get("contact_email") || null,
    };

    results.push(validateRow(row, i));
  }

  return results;
}

export function CSVImport() {
  const [rows, setRows] = useState<RowValidation[]>([]);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    setResults([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
    };
    reader.readAsText(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "client-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    setRows([]);
    setResults([]);
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImport = async () => {
    const validRows = rows.filter((r) => r.errors.length === 0).map((r) => r.row);
    if (validRows.length === 0) return;

    setImporting(true);
    try {
      const res = await bulkImportClients(validRows);
      setResults(res);
    } catch {
      setResults(
        validRows.map((r) => ({ name: r.name, success: false, error: "Import failed" }))
      );
    } finally {
      setImporting(false);
    }
  };

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const errorCount = rows.filter((r) => r.errors.length > 0).length;
  const hasResults = results.length > 0;

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
        {rows.length > 0 && (
          <Button variant="ghost" onClick={clearData}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Drop zone */}
      {rows.length === 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onClick={() => fileRef.current?.click()}
        >
          <FileUp className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium">Drop your CSV file here</p>
          <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
          <p className="text-xs text-muted-foreground mt-3">
            Expected columns: {CSV_HEADERS.join(", ")}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Preview */}
      {rows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="font-medium">
                {fileName} &mdash; {rows.length} row{rows.length !== 1 ? "s" : ""} parsed
              </p>
              {validCount > 0 && (
                <Badge variant="default">{validCount} valid</Badge>
              )}
              {errorCount > 0 && (
                <Badge variant="destructive">{errorCount} with errors</Badge>
              )}
            </div>
            <Button onClick={handleImport} disabled={importing || validCount === 0 || hasResults}>
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import All ({validCount})
                </>
              )}
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Plan Type</TableHead>
                  <TableHead>Year End</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Safe Harbor</TableHead>
                  <TableHead>Auto Enroll</TableHead>
                  <TableHead>RMD</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((rv, i) => {
                  const result = results.find((r) => r.name === rv.row.name);
                  return (
                    <TableRow
                      key={i}
                      className={
                        rv.errors.length > 0
                          ? "bg-destructive/5"
                          : result?.success === false
                          ? "bg-destructive/5"
                          : result?.success === true
                          ? "bg-green-50 dark:bg-green-950/20"
                          : ""
                      }
                    >
                      <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                      <TableCell className="font-medium">{rv.row.name || <span className="text-destructive italic">missing</span>}</TableCell>
                      <TableCell>
                        {VALID_PLAN_TYPES.includes(rv.row.plan_type) ? (
                          <Badge variant="outline">{rv.row.plan_type}</Badge>
                        ) : (
                          <Badge variant="destructive">{rv.row.plan_type || "missing"}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{rv.row.plan_year_end}</TableCell>
                      <TableCell>{rv.row.participant_count ?? "—"}</TableCell>
                      <TableCell>{rv.row.has_safe_harbor ? "Yes" : "No"}</TableCell>
                      <TableCell>{rv.row.has_auto_enrollment ? "Yes" : "No"}</TableCell>
                      <TableCell>{rv.row.has_rmd ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {rv.row.contact_name && <p>{rv.row.contact_name}</p>}
                          {rv.row.contact_email && (
                            <p className="text-muted-foreground text-xs">{rv.row.contact_email}</p>
                          )}
                          {!rv.row.contact_name && !rv.row.contact_email && "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {rv.errors.length > 0 ? (
                          <div className="text-xs text-destructive space-y-0.5">
                            {rv.errors.map((err, j) => (
                              <p key={j}>{err}</p>
                            ))}
                          </div>
                        ) : result ? (
                          result.success ? (
                            <span className="flex items-center text-green-600 text-xs">
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Imported
                            </span>
                          ) : (
                            <span className="flex items-center text-destructive text-xs">
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              {result.error || "Failed"}
                            </span>
                          )
                        ) : (
                          <Badge variant="secondary">Ready</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
