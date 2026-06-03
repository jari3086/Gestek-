"use client";

import { useFormStatus } from "react-dom";
import { toggleVisibilidad } from "@/lib/actions/informes";
import { useActionState } from "react";

export function ToggleVisibilidad({ id, visible }: { id: string; visible: boolean }) {
  const [state, action] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const v = formData.get("visible") === "true";
      return toggleVisibilidad(id, v);
    },
    undefined,
  );

  return (
    <form action={action} className="flex items-center gap-3">
      <input type="hidden" name="visible" value={visible ? "false" : "true"} />
      <SubmitButton active={visible} />
      <span className="text-sm text-zinc-500">
        {visible ? "Visible para el cliente" : "Oculto para el cliente"}
      </span>
      {state?.success && (
        <span className="text-xs text-green-600">✓ Actualizado</span>
      )}
      {state?.error && (
        <span className="text-xs text-red-600">{state.error}</span>
      )}
    </form>
  );
}

function SubmitButton({ active }: { active: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${
        active ? "bg-green-500" : "bg-zinc-300"
      } ${pending ? "opacity-50" : ""}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          active ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
