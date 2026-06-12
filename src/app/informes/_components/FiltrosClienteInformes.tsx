"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function FiltrosClienteInformes({
  defaultValue,
  equipos,
  sedes,
}: {
  defaultValue: string;
  equipos: { id: string; nombre: string; marca: string | null }[];
  sedes: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`/informes?${params.toString()}`);
  }, [router, searchParams]);

  const sedeId = searchParams.get("sede_id") || "";
  const equipoId = searchParams.get("equipo_id") || "";
  const fechaInicio = searchParams.get("fecha_inicio") || "";
  const fechaFin = searchParams.get("fecha_fin") || "";

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={sedeId}
        onChange={(e) => navigate({ sede_id: e.target.value })}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
      >
        <option value="">Todas las sedes</option>
        {sedes.map((s) => (
          <option key={s.id} value={s.id}>{s.nombre}</option>
        ))}
      </select>
      <select
        value={equipoId || defaultValue}
        onChange={(e) => navigate({ equipo_id: e.target.value })}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
      >
        <option value="">Todos los equipos</option>
        {equipos.map((eq) => (
          <option key={eq.id} value={eq.id}>
            {eq.nombre}
            {eq.marca ? ` (${eq.marca})` : ""}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={fechaInicio}
        onChange={(e) => navigate({ fecha_inicio: e.target.value })}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
        title="Fecha desde"
      />
      <input
        type="date"
        value={fechaFin}
        onChange={(e) => navigate({ fecha_fin: e.target.value })}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
        title="Fecha hasta"
      />
    </div>
  );
}
