"use client";

import { useActionState } from "react";
import { crearEquipo } from "@/lib/actions/equipos";

function autoCalcProximo() {
  const ultimo = (document.getElementById("nuevo_fecha_ultimo_mantenimiento") as HTMLInputElement)?.value;
  const periodicidad = (document.getElementById("nuevo_periodicidad_mantenimiento") as HTMLSelectElement)?.value;
  const proximoInput = document.getElementById("nuevo_fecha_proximo_mantenimiento") as HTMLInputElement;
  if (ultimo && periodicidad && periodicidad !== "0") {
    const d = new Date(ultimo);
    d.setMonth(d.getMonth() + parseInt(periodicidad));
    proximoInput.value = d.toISOString().split("T")[0];
  }
}

export function EquipoForm({
  clientes,
}: {
  clientes: { id: string; nombre: string }[];
}) {
  const [state, formAction, pending] = useActionState(crearEquipo, undefined);

  return (
    <form action={formAction} className="space-y-5 rounded-xl bg-white p-6 shadow-card">
      {state?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-zinc-600">Cliente</label>
            <a
              href="/clientes/nuevo"
              className="text-xs font-medium text-brand-primary hover:text-brand-primary-dark"
            >
              + Crear nuevo cliente
            </a>
          </div>
          <select
            name="cliente_id"
            required
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="">Seleccionar cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            Nombre / Descripción del equipo
          </label>
          <input
            name="nombre"
            required
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="Monitor de signos vitales"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            ID del equipo (cliente)
          </label>
          <input
            name="id_cliente"
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="EQ-001"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">Tipo</label>
          <input
            name="tipo"
            required
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="Monitor"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">Marca</label>
          <input
            name="marca"
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="Mindray"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">Modelo</label>
          <input
            name="modelo"
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="uMEC12"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            Número de serie
          </label>
          <input
            name="serie"
            required
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="SN-2024-001"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            Accesorios
          </label>
          <textarea
            name="accesorios"
            rows={2}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="Cables, sensores, batería, cargador..."
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-600">Ubicación</label>
          <input
            name="ubicacion"
            required
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            placeholder="Hospital Central - Piso 3 - Sala 301"
          />
        </div>

        <div className="sm:col-span-2 border-t border-zinc-100 pt-4">
          <p className="mb-3 text-sm font-medium text-zinc-500">Fechas de mantenimiento</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            Último mantenimiento
          </label>
          <input
            id="nuevo_fecha_ultimo_mantenimiento"
            name="fecha_ultimo_mantenimiento"
            type="date"
            onChange={autoCalcProximo}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            Próximo mantenimiento
          </label>
          <input
            id="nuevo_fecha_proximo_mantenimiento"
            name="fecha_proximo_mantenimiento"
            type="date"
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            Periodicidad mantenimiento
          </label>
          <select
            id="nuevo_periodicidad_mantenimiento"
            name="periodicidad_mantenimiento"
            onChange={autoCalcProximo}
            defaultValue="0"
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="0">No recurrente</option>
            <option value="1">Cada 1 mes</option>
            <option value="2">Cada 2 meses</option>
            <option value="3">Cada 3 meses</option>
            <option value="6">Cada 6 meses</option>
            <option value="12">Cada 12 meses</option>
            <option value="24">Cada 24 meses</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            Última calibración
          </label>
          <input
            name="fecha_ultima_calibracion"
            type="date"
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            Próxima calibración
          </label>
          <input
            name="fecha_proxima_calibracion"
            type="date"
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <a
          href="/equipos"
          className="rounded-xl border border-zinc-200 px-5 py-2.5 font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand-primary px-5 py-2.5 font-medium text-white shadow-soft transition-all hover:bg-brand-primary-dark disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar equipo"}
        </button>
      </div>
    </form>
  );
}
