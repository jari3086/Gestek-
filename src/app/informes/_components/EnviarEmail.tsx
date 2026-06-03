"use client";

import { useActionState } from "react";
import { enviarEmailManual } from "@/lib/actions/informes";

export function EnviarEmail({ id }: { id: string }) {
  const [state, action, pending] = useActionState(
    async (_prev: unknown) => {
      return enviarEmailManual(id);
    },
    undefined,
  );

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-600 shadow-soft transition-colors hover:bg-zinc-50 disabled:opacity-50"
      >
        {pending ? "Enviando..." : state?.success ? "✓ Enviado" : "Enviar por email"}
      </button>
      {state?.error && (
        <p className="mt-2 text-xs text-red-600">{state.error}</p>
      )}
    </form>
  );
}
