"use client";

import { useActionState, useState } from "react";
import { actualizarEquipo } from "@/lib/actions/equipos";

function autoCalcProximo() {
  const ultimo = (document.getElementById("fecha_ultimo_mantenimiento") as HTMLInputElement)?.value;
  const periodicidad = (document.getElementById("periodicidad_mantenimiento") as HTMLSelectElement)?.value;
  const proximoInput = document.getElementById("fecha_proximo_mantenimiento") as HTMLInputElement;
  if (ultimo && periodicidad && periodicidad !== "0") {
    const d = new Date(ultimo);
    d.setMonth(d.getMonth() + parseInt(periodicidad));
    proximoInput.value = d.toISOString().split("T")[0];
  }
}

export function EditarEquipoForm({
  equipo,
  clientes,
  sedes,
}: {
  equipo: any;
  clientes: { id: string; nombre: string }[];
  sedes: { id: string; cliente_id: string; nombre: string }[];
}) {
  const [state, formAction, pending] = useActionState(actualizarEquipo, undefined);
  const [clienteId, setClienteId] = useState(equipo.cliente_id || "");

  const sedesFiltradas = sedes.filter((s) => s.cliente_id === clienteId);

  return (
    <form action={formAction} className="space-y-5 rounded-xl bg-white p-6 shadow-card">
      <input type="hidden" name="id" value={equipo.id} />

      {state?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-600">Cliente</label>
          <select
            name="cliente_id"
            required
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="">Seleccionar</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {clienteId && sedesFiltradas.length > 0 && (
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-zinc-600">Sede / Sucursal</label>
            <select
              name="sede_id"
              defaultValue={equipo.sede_id || ""}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            >
              <option value="">Sin sede</option>
              {sedesFiltradas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            Nombre / Descripción
          </label>
          <input
            name="nombre"
            required
            defaultValue={equipo.nombre}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            ID del equipo (cliente)
          </label>
          <input
            name="id_cliente"
            defaultValue={equipo.id_cliente ?? ""}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">Tipo</label>
          <input
            name="tipo"
            required
            defaultValue={equipo.tipo}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">Marca</label>
          <input
            name="marca"
            defaultValue={equipo.marca ?? ""}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">Modelo</label>
          <input
            name="modelo"
            defaultValue={equipo.modelo ?? ""}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">Serie</label>
          <input
            name="serie"
            required
            defaultValue={equipo.serie}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-600">Accesorios</label>
          <textarea
            name="accesorios"
            rows={2}
            defaultValue={equipo.accesorios ?? ""}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-600">Ubicación</label>
          <input
            name="ubicacion"
            required
            defaultValue={equipo.ubicacion}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
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
            id="fecha_ultimo_mantenimiento"
            name="fecha_ultimo_mantenimiento"
            type="date"
            defaultValue={equipo.fecha_ultimo_mantenimiento ?? ""}
            onChange={autoCalcProximo}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            Próximo mantenimiento
          </label>
          <input
            id="fecha_proximo_mantenimiento"
            name="fecha_proximo_mantenimiento"
            type="date"
            defaultValue={equipo.fecha_proximo_mantenimiento ?? ""}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600">
            Periodicidad mantenimiento
          </label>
          <select
            id="periodicidad_mantenimiento"
            name="periodicidad_mantenimiento"
            defaultValue={equipo.periodicidad_mantenimiento ?? "0"}
            onChange={autoCalcProximo}
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
            defaultValue={equipo.fecha_ultima_calibracion ?? ""}
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
            defaultValue={equipo.fecha_proxima_calibracion ?? ""}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <a
          href={`/equipos/${equipo.id}`}
          className="rounded-xl border border-zinc-200 px-5 py-2.5 font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand-primary px-5 py-2.5 font-medium text-white shadow-soft transition-all hover:bg-brand-primary-dark disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
