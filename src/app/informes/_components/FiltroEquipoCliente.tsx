"use client";

import { useRouter } from "next/navigation";

export function FiltroEquipoCliente({
  defaultValue,
  equipos,
}: {
  defaultValue: string;
  equipos: { id: string; nombre: string; marca: string | null }[];
}) {
  const router = useRouter();

  return (
    <select
      defaultValue={defaultValue}
      onChange={(e) => {
        const params = new URLSearchParams(window.location.search);
        if (e.target.value) {
          params.set("equipo_id", e.target.value);
        } else {
          params.delete("equipo_id");
        }
        router.push(`/informes?${params.toString()}`);
      }}
      className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
    >
      <option value="">Todos los equipos</option>
      {equipos.map((eq) => (
        <option key={eq.id} value={eq.id}>
          {eq.nombre}
          {eq.marca ? ` (${eq.marca})` : ""}
        </option>
      ))}
    </select>
  );
}
