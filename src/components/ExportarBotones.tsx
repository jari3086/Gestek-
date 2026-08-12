"use client";

import { descargarCsv, descargarXlsx } from "@/lib/export";

type Fila = Record<string, string | number | null | undefined>;

export function ExportarBotones({
  rows,
  filename,
}: {
  rows: Fila[];
  filename: string;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => descargarCsv(rows, filename)}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 shadow-soft transition-colors hover:bg-zinc-50"
      >
        Exportar CSV
      </button>
      <button
        type="button"
        onClick={() => descargarXlsx(rows, filename)}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 shadow-soft transition-colors hover:bg-zinc-50"
      >
        Exportar Excel
      </button>
    </div>
  );
}