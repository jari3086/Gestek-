"use client";

import { useActionState, useState } from "react";
import { enviarFacturaEmail } from "@/lib/actions/facturas";

export function EnviarFacturaEmailButton({ facturaId }: { facturaId: string }) {
  const [state, action, pending] = useActionState(
    async () => enviarFacturaEmail(facturaId),
    undefined,
  );

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending || state?.success === true}
        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-50"
      >
        {pending ? "Enviando..." : state?.success ? "✓ Enviado" : state?.error ? "Error" : "Enviar email"}
      </button>
    </form>
  );
}
