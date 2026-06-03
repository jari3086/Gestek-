"use client";

import { useRef } from "react";
import { cambiarEstadoFactura } from "@/lib/actions/facturas";

export default function CambiarEstadoFactura({
  facturaId,
  estadoActual,
}: {
  facturaId: string;
  estadoActual: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form action={cambiarEstadoFactura} ref={formRef}>
      <input type="hidden" name="id" value={facturaId} />
      <select
        name="estado"
        defaultValue={estadoActual}
        onChange={() => formRef.current?.requestSubmit()}
        className={`rounded-full px-3 py-1 text-xs font-medium border-0 cursor-pointer ${
          estadoActual === "pagada" ? "bg-green-100 text-green-700"
          : estadoActual === "anulada" ? "bg-red-100 text-red-700"
          : "bg-yellow-100 text-yellow-700"
        }`}
      >
        <option value="emitida">emitida</option>
        <option value="pagada">pagada</option>
        <option value="anulada">anulada</option>
      </select>
    </form>
  );
}
