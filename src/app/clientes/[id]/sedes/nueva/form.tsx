"use client";

import { useActionState } from "react";
import { crearSede, actualizarSede } from "@/lib/actions/sedes";

export function SedeForm({ clienteId, sede }: { clienteId: string; sede?: any }) {
  const action = sede ? actualizarSede : crearSede;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5 rounded-xl bg-white p-6 shadow-card">
      <input type="hidden" name="cliente_id" value={clienteId} />
      {sede && <input type="hidden" name="id" value={sede.id} />}

      {state?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-600">Nombre de la sede</label>
          <input
            name="nombre"
            required
            defaultValue={sede?.nombre || ""}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="Sede principal"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-600">Dirección</label>
          <input
            name="direccion"
            defaultValue={sede?.direccion || ""}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="Cra 10 #20-30"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">Ciudad</label>
          <input
            name="ciudad"
            defaultValue={sede?.ciudad || ""}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="Bogotá"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">Departamento</label>
          <input
            name="departamento"
            defaultValue={sede?.departamento || ""}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="Cundinamarca"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">Teléfono</label>
          <input
            name="telefono"
            defaultValue={sede?.telefono || ""}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="601 123 4567"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={sede?.email || ""}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="sede@cliente.com"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <a
          href={`/clientes/${clienteId}/sedes`}
          className="rounded-xl border border-zinc-200 px-5 py-2.5 font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand-primary px-5 py-2.5 font-medium text-white shadow-soft transition-all hover:bg-brand-primary-dark disabled:opacity-50"
        >
          {pending ? "Guardando..." : sede ? "Guardar cambios" : "Guardar sede"}
        </button>
      </div>
    </form>
  );
}
