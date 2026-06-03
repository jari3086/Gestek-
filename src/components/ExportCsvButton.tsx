"use client";

import { downloadCsv } from "@/lib/csv";

export function ExportCsvButton<T extends Record<string, string | number | null | undefined>>({
  rows,
  filename,
  label = "Exportar CSV",
}: {
  rows: T[];
  filename: string;
  label?: string;
}) {
  if (rows.length === 0) return null;
  return (
    <button
      type="button"
      onClick={() => downloadCsv(rows as any, filename)}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 shadow-soft transition-colors hover:bg-zinc-50"
    >
      {label}
    </button>
  );
}
