"use client";

import { useActionState } from "react";
import { enviarRecordatoriosMantenimiento } from "@/lib/actions/informes";

export function RecordatoriosButton() {
  const [state, action, pending] = useActionState(enviarRecordatoriosMantenimiento, undefined);

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending || state?.success === true}
        className="block w-full rounded-xl border border-zinc-200/60 bg-white p-4 shadow-soft text-left transition-all hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-card disabled:opacity-50"
      >
        <h4 className="font-medium text-brand-secondary">Enviar recordatorios</h4>
        <p className="mt-1 text-xs text-zinc-400">
          {pending ? "Enviando..." : state?.success
            ? `✓ ${state.message || "Recordatorios enviados"}`
            : state?.error
            ? `✗ ${state.error}`
            : "Notificar a clientes con mantenimiento próximo"}
        </p>
      </button>
    </form>
  );
}
