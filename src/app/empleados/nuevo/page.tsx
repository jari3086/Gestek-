"use client";

import { useActionState } from "react";
import { crearTecnico } from "@/lib/actions/clientes";

export default function NuevoEmpleadoPage() {
  const [state, formAction, pending] = useActionState(crearTecnico, undefined);

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-zinc-200/60 bg-white shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
          <a href="/clientes" className="text-sm text-zinc-500 hover:text-brand-primary">
            &larr; Volver a clientes
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-bold text-brand-secondary">Nuevo empleado técnico</h2>

        <form action={formAction} className="space-y-5 rounded-xl bg-white p-6 shadow-card">
          {state?.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Nombre completo
              </label>
              <input
                name="nombre"
                required
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="Nombre del técnico"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="tecnico@gestek.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
            El técnico podrá generar informes de mantenimiento pero no gestionar clientes, equipos ni plantillas.
          </div>

          <div className="flex gap-3 pt-2">
            <a
              href="/clientes"
              className="rounded-xl border border-zinc-200 px-5 py-2.5 font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              Cancelar
            </a>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-brand-primary px-5 py-2.5 font-medium text-white shadow-soft hover:bg-brand-primary-dark disabled:opacity-50"
            >
              {pending ? "Creando..." : "Crear técnico"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
