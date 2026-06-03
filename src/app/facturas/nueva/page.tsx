"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { crearFactura } from "@/lib/actions/facturas";
import { useEffect, useState } from "react";
import { hoyBogota } from "@/lib/date";

interface ClienteOption {
  id: string;
  nombre: string;
}

export default function NuevaFacturaPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(crearFactura, undefined);
  const [clientes, setClientes] = useState<ClienteOption[]>([]);

  useEffect(() => {
    fetch("/api/clientes")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setClientes(data);
        else if (data?.length) setClientes(data);
        else if (data?.profiles) setClientes(data.profiles);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f7fa] p-8">
      <div className="mx-auto max-w-xl">
        <button onClick={() => router.back()} className="mb-6 text-sm text-zinc-500 hover:text-brand-primary transition-colors">
          &larr; Volver
        </button>
        <h2 className="mb-6 text-2xl font-bold text-brand-secondary">Nueva factura</h2>
        <form action={formAction} className="space-y-4 rounded-xl border border-zinc-200/60 bg-white p-6 shadow-card">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600">Cliente</label>
            <select
              name="cliente_id"
              required
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">Subtotal ($)</label>
              <input
                type="number"
                name="subtotal"
                step="0.01"
                min="0"
                defaultValue="0"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">IVA ($)</label>
              <input
                type="number"
                name="total_iva"
                step="0.01"
                min="0"
                defaultValue="0"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">Total ($)</label>
              <input
                type="number"
                name="total"
                step="0.01"
                min="0"
                defaultValue="0"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          <details className="rounded-lg border border-zinc-200/60 p-3">
            <summary className="cursor-pointer text-sm font-medium text-zinc-500 hover:text-zinc-700">
              Más opciones fiscales
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-600">Tipo documento</label>
                <select name="tipo_documento" defaultValue="factura" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
                  <option value="factura">Factura</option>
                  <option value="nota_credito">Nota Crédito</option>
                  <option value="nota_debito">Nota Débito</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-600">Forma de pago</label>
                <select name="forma_pago" defaultValue="contado" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
                  <option value="contado">Contado</option>
                  <option value="credito">Crédito</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-600">Prefijo</label>
                <input name="prefijo" placeholder="FE1" maxLength={10} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-600">Consecutivo</label>
                <input type="number" name="numero_consecutivo" min="1" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-600">Fecha emisión</label>
                <input type="datetime-local" name="fecha_emision" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-600">Fecha vencimiento</label>
                <input type="date" name="fecha_vencimiento" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-600">Medio de pago</label>
                <select name="medio_pago" defaultValue="" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
                  <option value="">Seleccionar</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-600">Moneda</label>
                <select name="moneda" defaultValue="COP" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
                  <option value="COP">COP</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </details>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">Ret. fuente ($)</label>
              <input type="number" name="retencion_fuente" step="0.01" min="0" defaultValue="0" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">Ret. IVA ($)</label>
              <input type="number" name="retencion_iva" step="0.01" min="0" defaultValue="0" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">Ret. ICA ($)</label>
              <input type="number" name="retencion_ica" step="0.01" min="0" defaultValue="0" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600">Monto ($)</label>
            <input
              type="number"
              name="monto"
              step="0.01"
              required
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600">Fecha</label>
            <input
              type="date"
              name="fecha"
              defaultValue={hoyBogota()}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600">Estado</label>
            <select
              name="estado"
              defaultValue="emitida"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            >
              <option value="emitida">Emitida</option>
              <option value="pagada">Pagada</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>
          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-brand-primary px-4 py-3 font-medium text-white transition-all hover:bg-brand-primary-dark disabled:opacity-50"
          >
            {pending ? "Creando..." : "Crear factura"}
          </button>
        </form>
      </div>
    </div>
  );
}
