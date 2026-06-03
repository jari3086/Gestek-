"use client";

import { useActionState } from "react";
import { actualizarInforme } from "@/lib/actions/informes";
import { SignaturePad } from "@/components/SignaturePad";

export function EditarInformeForm({
  id,
  observaciones,
  conclusion,
  orden_servicio,
  numero_informe,
  tecnico_nombre,
  firmaAprobador,
}: {
  id: string;
  observaciones: string;
  conclusion: string;
  orden_servicio: string;
  numero_informe: string;
  tecnico_nombre: string;
  firmaAprobador?: string;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return actualizarInforme(id, {
        observaciones: formData.get("observaciones") as string,
        conclusion: formData.get("conclusion") as string,
        orden_servicio: formData.get("orden_servicio") as string,
        numero_informe: formData.get("numero_informe") as string,
        tecnico_nombre: formData.get("tecnico_nombre") as string,
        firma_aprobador: formData.get("firma_aprobador") as string,
      });
    },
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-600">Orden de servicio</label>
          <input
            name="orden_servicio"
            defaultValue={orden_servicio}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-600">N° de informe</label>
          <input
            name="numero_informe"
            defaultValue={numero_informe}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-600">Profesional que ejecuta</label>
        <input
          name="tecnico_nombre"
          defaultValue={tecnico_nombre}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-600">Observaciones / Hallazgos</label>
        <textarea
          name="observaciones"
          rows={4}
          defaultValue={observaciones}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-600">Conclusión</label>
        <textarea
          name="conclusion"
          rows={3}
          defaultValue={conclusion}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
      </div>
      <SignaturePad label="Firma del profesional que aprueba" name="firma_aprobador" defaultValue={firmaAprobador} />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-primary/90 disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
        {state?.success && (
          <span className="text-sm text-green-600">✓ Guardado</span>
        )}
        {state?.error && (
          <span className="text-sm text-red-600">{state.error}</span>
        )}
      </div>
    </form>
  );
}
