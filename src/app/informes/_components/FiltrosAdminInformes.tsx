"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface FilterOption {
  id: string;
  nombre: string;
}

export function FiltrosAdminInformes({
  tecnicos,
  clientes,
  equipos,
  ubicaciones,
}: {
  tecnicos: FilterOption[];
  clientes: FilterOption[];
  equipos: FilterOption[];
  ubicaciones: string[];
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

  const tecnicoId = searchParams.get("tecnico_id") || "";
  const clienteId = searchParams.get("cliente_id") || "";
  const equipoId = searchParams.get("equipo_id") || "";
  const ubicacion = searchParams.get("ubicacion") || "";

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={tecnicoId}
        onChange={(e) => navigate({ tecnico_id: e.target.value })}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
      >
        <option value="">Todos los técnicos</option>
        {tecnicos.map((t) => (
          <option key={t.id} value={t.id}>{t.nombre}</option>
        ))}
      </select>
      <select
        value={clienteId}
        onChange={(e) => navigate({ cliente_id: e.target.value, equipo_id: "" })}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
      >
        <option value="">Todos los clientes</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>
      <select
        value={equipoId}
        onChange={(e) => navigate({ equipo_id: e.target.value })}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
      >
        <option value="">Todos los equipos</option>
        {equipos.map((eq) => (
          <option key={eq.id} value={eq.id}>{eq.nombre}</option>
        ))}
      </select>
      {ubicaciones.length > 0 && (
        <select
          value={ubicacion}
          onChange={(e) => navigate({ ubicacion: e.target.value })}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
        >
          <option value="">Todas las ubicaciones</option>
          {ubicaciones.map((ub) => (
            <option key={ub} value={ub}>{ub}</option>
          ))}
        </select>
      )}
    </div>
  );
}
