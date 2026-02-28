"use client";

import React, { useState } from"react";

/* ─── Icons ─────────────────────────────────────────────── */
const DownloadIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
 </svg>
);
const SpinnerIcon = () => (
 <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
 </svg>
);

/* ─── Types ─────────────────────────────────────────────── */
type ExportFormat ="csv" |"json" |"xlsx";

interface ExportColumn {
 key: string;
 label: string;
 format?: (value: any) => string;
}

interface Props {
 /** Data array to export */
 data: Record<string, any>[];
 /** Column definitions — controls order and formatting */
 columns: ExportColumn[];
 /** Base filename (without extension) */
 filename?: string;
 /** Available formats */
 formats?: ExportFormat[];
 /** Optional callback after export */
 onExport?: (format: ExportFormat, count: number) => void;
 /** Button variant */
 variant?:"default" |"compact";
}

/* ─── CSV helper ────────────────────────────────────────── */
function toCSV(data: Record<string, any>[], columns: ExportColumn[]): string {
 const header = columns.map((c) => `"${c.label.replace(/"/g,'""')}"`).join(",");
 const rows = data.map((row) =>
 columns
 .map((col) => {
 const raw = row[col.key];
 const val = col.format ? col.format(raw) : String(raw ??"");
 return `"${val.replace(/"/g,'""')}"`;
 })
 .join(",")
 );
 return [header, ...rows].join("\n");
}

/* ─── Download trigger ──────────────────────────────────── */
function downloadBlob(content: string, filename: string, mime: string) {
 const blob = new Blob([content], { type: mime });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = filename;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
}

/* ─── Component ─────────────────────────────────────────── */
export default function DataExport({
 data,
 columns,
 filename ="export",
 formats = ["csv","json"],
 onExport,
 variant ="default",
}: Props) {
 const [open, setOpen] = useState(false);
 const [exporting, setExporting] = useState(false);

 const handleExport = async (format: ExportFormat) => {
 setExporting(true);
 try {
 const ts = new Date().toISOString().slice(0, 10);
 const name = `${filename}-${ts}`;

 if (format ==="csv") {
 downloadBlob(toCSV(data, columns), `${name}.csv`,"text/csv;charset=utf-8;");
 } else if (format ==="json") {
 const shaped = data.map((row) => {
 const obj: Record<string, any> = {};
 for (const col of columns) {
 obj[col.key] = col.format ? col.format(row[col.key]) : row[col.key];
 }
 return obj;
 });
 downloadBlob(JSON.stringify(shaped, null, 2), `${name}.json`,"application/json");
 }

 onExport?.(format, data.length);
 } finally {
 setExporting(false);
 setOpen(false);
 }
 };

 const FORMAT_LABELS: Record<ExportFormat, { label: string; desc: string }> = {
 csv: { label:"CSV", desc:"Spreadsheet compatible" },
 json: { label:"JSON", desc:"Structured data format" },
 xlsx: { label:"XLSX", desc:"Excel workbook" },
 };

 if (variant ==="compact") {
 return (
 <div className="relative">
 <button
 onClick={() => setOpen(!open)}
 disabled={data.length === 0}
 className="inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-2.5 py-1.5 text-xs font-medium text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:border-[rgb(var(--muted))]/40 transition-colors disabled:opacity-40"
 >
 {exporting ? <SpinnerIcon /> : <DownloadIcon />}
 Export
 </button>
 {open && (
 <div className="absolute right-0 top-full mt-1 z-50 w-44 overflow-hidden rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-lg animate-in fade-in slide-in-from-top-1 duration-100">
 {formats.map((f) => (
 <button
 key={f}
 onClick={() => handleExport(f)}
 className="flex w-full items-center justify-between px-3 py-2 text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]/10 transition-colors"
 >
 <span>{FORMAT_LABELS[f].label}</span>
 <span className="text-[10px] text-[rgb(var(--muted-foreground))]">{data.length} rows</span>
 </button>
 ))}
 </div>
 )}
 </div>
 );
 }

 return (
 <div className="relative">
 <button
 onClick={() => setOpen(!open)}
 disabled={data.length === 0}
 className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3.5 py-2 text-sm font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]/10 transition-colors disabled:opacity-40 shadow-sm"
 >
 {exporting ? <SpinnerIcon /> : <DownloadIcon />}
 Export Data
 <span className="ml-1 rounded-md bg-[rgb(var(--muted))]/10 px-1.5 py-0.5 text-[10px] tabular-nums text-[rgb(var(--muted-foreground))]">
 {data.length}
 </span>
 </button>

 {open && (
 <div className="absolute right-0 top-full mt-2 z-50 w-56 overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
 <div className="border-b border-[rgb(var(--border))] px-3 py-2">
 <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--muted-foreground))]/60">Export Format</p>
 </div>
 {formats.map((f) => (
 <button
 key={f}
 onClick={() => handleExport(f)}
 className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[rgb(var(--muted))]/10 transition-colors"
 >
 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgb(var(--muted))]/10 text-[11px] font-bold text-[rgb(var(--muted-foreground))]">
 {FORMAT_LABELS[f].label.charAt(0)}
 </span>
 <div>
 <p className="text-sm font-medium text-[rgb(var(--foreground))]">{FORMAT_LABELS[f].label}</p>
 <p className="text-[11px] text-[rgb(var(--muted-foreground))]">{FORMAT_LABELS[f].desc}</p>
 </div>
 </button>
 ))}
 <div className="border-t border-[rgb(var(--border))] px-3 py-2 text-center">
 <span className="text-[10px] tabular-nums text-[rgb(var(--muted-foreground))]/40">
 {data.length} {data.length === 1 ?"record" :"records"} to export
 </span>
 </div>
 </div>
 )}
 </div>
 );
}

export type { ExportColumn, ExportFormat };
