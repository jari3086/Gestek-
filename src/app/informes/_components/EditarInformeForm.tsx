"use client";

import { useActionState, useRef, useState } from "react";
import { actualizarInforme } from "@/lib/actions/informes";
import { SignaturePad } from "@/components/SignaturePad";
import Image from "next/image";
import type { SeccionResultado } from "@/lib/checklist";

const TIPOS_SERVICIO = [
  "Mantenimiento preventivo",
  "Mantenimiento correctivo",
  "Calibración",
  "Encendido",
  "Instalación",
  "Visita diagnóstica",
  "Otro",
];

export function EditarInformeForm({
  id,
  tipo,
  fecha,
  observaciones,
  conclusion,
  orden_servicio,
  numero_informe,
  tecnico_nombre,
  aprobador_nombre,
  firma_tecnico,
  firma_aprobador,
  firma_recibe,
  proximo_mantenimiento,
  proxima_calibracion,
  secciones: initialSecciones,
  fotos: initialFotos,
  tecnicoFirmaUrl,
  tecnicoNombre,
}: {
  id: string;
  tipo: string;
  fecha: string;
  observaciones: string;
  conclusion: string;
  orden_servicio: string;
  numero_informe: string;
  tecnico_nombre: string;
  aprobador_nombre: string;
  firma_tecnico?: string;
  firma_aprobador?: string;
  firma_recibe?: string;
  proximo_mantenimiento?: string;
  proxima_calibracion?: string;
  secciones?: SeccionResultado[];
  fotos?: string[];
  tecnicoFirmaUrl?: string;
  tecnicoNombre?: string;
}) {
  const [success, setSuccess] = useState(false);
  const [secciones, setSecciones] = useState<SeccionResultado[]>(initialSecciones || []);
  const [photos, setPhotos] = useState<string[]>(initialFotos || []);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const fotos_actuales = formData.get("_fotos_actuales") as string;
      const fotosActualesArr: string[] = fotos_actuales ? JSON.parse(fotos_actuales) : [];
      const fotos_nuevas = fotosActualesArr.filter(
        (url) => !(initialFotos || []).includes(url),
      );
      const fotos_eliminar = (initialFotos || []).filter(
        (url) => !fotosActualesArr.includes(url),
      );

      const result = await actualizarInforme(id, {
        tipo: formData.get("tipo") as string,
        fecha: formData.get("fecha") as string,
        observaciones: formData.get("observaciones") as string,
        conclusion: formData.get("conclusion") as string,
        orden_servicio: formData.get("orden_servicio") as string,
        numero_informe: formData.get("numero_informe") as string,
        tecnico_nombre: formData.get("tecnico_nombre") as string,
        aprobador_nombre: formData.get("aprobador_nombre") as string,
        firma_tecnico: formData.get("firma_tecnico") as string,
        firma_aprobador: formData.get("firma_aprobador") as string,
        firma_recibe: formData.get("firma_recibe") as string,
        proximo_mantenimiento: formData.get("proximo_mantenimiento") as string,
        proxima_calibracion: formData.get("proxima_calibracion") as string,
        checklist: secciones.length > 0 ? { secciones } : undefined,
        fotos_nuevas: fotos_nuevas.length > 0 ? fotos_nuevas : undefined,
        fotos_eliminar: fotos_eliminar.length > 0 ? fotos_eliminar : undefined,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
      return result;
    },
    undefined,
  );

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError("");
    setUploading(true);
    setUploadProgress("");

    const MAX_SIZE = 5 * 1024 * 1024;
    let uploaded = 0;
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Subiendo ${i + 1} de ${files.length}...`);

      if (file.size > MAX_SIZE) {
        errors.push(`"${file.name}" supera los 5 MB`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok || data.error) {
          errors.push(data.error || `Error al subir "${file.name}"`);
        } else if (data.url) {
          setPhotos((prev) => [...prev, data.url]);
          uploaded++;
        }
      } catch {
        errors.push(`Error de conexión al subir "${file.name}"`);
      }
    }

    setUploading(false);
    setUploadProgress(uploaded > 0 ? `Subidas ${uploaded} foto${uploaded !== 1 ? "s" : ""}` : "");
    if (errors.length > 0) setUploadError(errors.join(". "));
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
  };

  const setCumple = (secIdx: number, itemIdx: number, cumple: boolean) => {
    setSecciones((prev) => {
      const next = [...prev];
      const sec = next[secIdx];
      if (sec.tipo === "checklist") {
        next[secIdx] = {
          ...sec,
          items: sec.items.map((it, i) =>
            i === itemIdx ? { ...it, cumple } : it,
          ),
        };
      }
      return next;
    });
  };

  const setObservacion = (secIdx: number, itemIdx: number, observacion: string) => {
    setSecciones((prev) => {
      const next = [...prev];
      const sec = next[secIdx];
      if (sec.tipo === "checklist") {
        next[secIdx] = {
          ...sec,
          items: sec.items.map((it, i) =>
            i === itemIdx ? { ...it, observacion } : it,
          ),
        };
      }
      return next;
    });
  };

  const setValorMedicion = (secIdx: number, grupoIdx: number, campoIdx: number, valor: string) => {
    setSecciones((prev) => {
      const next = [...prev];
      const sec = next[secIdx];
      if (sec.tipo === "mediciones") {
        next[secIdx] = {
          ...sec,
          grupos: sec.grupos.map((g, gi) =>
            gi === grupoIdx
              ? {
                  ...g,
                  campos: g.campos.map((c, ci) =>
                    ci === campoIdx ? { ...c, valor } : c,
                  ),
                }
              : g,
          ),
        };
      }
      return next;
    });
  };

  const renderSeccion = (sec: SeccionResultado, secIdx: number) => {
    if (sec.tipo === "checklist") {
      return (
        <div key={sec.id} className="rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
          <h4 className="mb-3 text-sm font-semibold text-brand-secondary">
            {sec.titulo || "Lista de verificación"}
          </h4>
          <div className="space-y-3">
            {sec.items.map((item, index) => (
              <div key={item.itemId} className="rounded-lg border border-zinc-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.cumple}
                    onChange={(e) => setCumple(secIdx, index, e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-secondary">{item.nombre}</p>
                    <span className={`text-xs ${item.cumple ? "text-green-600" : "text-red-600"}`}>
                      {item.cumple ? "Cumple" : "No cumple"}
                    </span>
                  </div>
                </div>
                <input
                  placeholder="Observación (opcional)"
                  value={item.observacion || ""}
                  onChange={(e) => setObservacion(secIdx, index, e.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={sec.id} className="rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
        <h4 className="mb-3 text-sm font-semibold text-brand-secondary">
          {sec.titulo || "Mediciones"}
        </h4>
        {sec.grupos.map((grupo, gi) => (
          <div key={gi} className="mb-4 last:mb-0">
            {grupo.titulo && (
              <p className="mb-2 text-xs font-semibold text-zinc-500">{grupo.titulo}</p>
            )}
            <div className="overflow-hidden rounded-lg border border-zinc-200">
              <div className="grid grid-cols-3 bg-zinc-100 text-xs font-semibold text-zinc-600">
                <div className="px-3 py-2">Parámetro</div>
                <div className="border-l border-zinc-200 px-3 py-2">Unidad</div>
                <div className="border-l border-zinc-200 px-3 py-2">Valor medido</div>
              </div>
              {grupo.campos.map((m, index) => (
                <div key={m.medicionId} className="grid grid-cols-3 border-t border-zinc-200 bg-white text-sm">
                  <div className="px-3 py-2 text-zinc-700">{m.nombre}</div>
                  <div className="border-l border-zinc-200 px-3 py-2 text-zinc-500">{m.unidad || "—"}</div>
                  <div className="border-l border-zinc-200 px-2 py-1.5">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Valor"
                      value={m.valor || ""}
                      onChange={(e) => setValorMedicion(secIdx, gi, index, e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <form action={action} className="space-y-4">
      {/* Hidden fields to track current photos and preserve existing signature for recibe */}
      <input type="hidden" name="_fotos_actuales" value={JSON.stringify(photos)} />
      <input type="hidden" name="firma_recibe" value={firma_recibe || ""} />

      {/* Datos del servicio */}
      <div className="rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
        <h4 className="mb-3 text-sm font-semibold text-brand-secondary">Datos del servicio</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-600">Tipo de servicio *</label>
            <select
              name="tipo"
              required
              defaultValue={tipo}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="">Seleccionar...</option>
              {TIPOS_SERVICIO.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-600">Fecha</label>
            <input
              type="date"
              name="fecha"
              defaultValue={fecha}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-600">N° de informe</label>
            <input
              name="numero_informe"
              defaultValue={numero_informe}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-600">Orden de servicio</label>
            <input
              name="orden_servicio"
              defaultValue={orden_servicio}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-600">Profesional que ejecuta</label>
            <input
              name="tecnico_nombre"
              defaultValue={tecnico_nombre}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-600">Profesional que aprueba</label>
            <input
              name="aprobador_nombre"
              defaultValue={aprobador_nombre}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-600">Próximo mantenimiento</label>
            <input
              type="date"
              name="proximo_mantenimiento"
              defaultValue={proximo_mantenimiento}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-600">Próxima calibración</label>
            <input
              type="date"
              name="proxima_calibracion"
              defaultValue={proxima_calibracion}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div className="rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
        <h4 className="mb-3 text-sm font-semibold text-brand-secondary">Observaciones / Hallazgos</h4>
        <textarea
          name="observaciones"
          rows={4}
          defaultValue={observaciones}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
      </div>

      {/* Secciones de verificación */}
      {secciones.length > 0 && (
        <div className="space-y-4">
          {secciones.map((sec, i) => renderSeccion(sec, i))}
        </div>
      )}

      {/* Conclusiones */}
      <div className="rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
        <h4 className="mb-3 text-sm font-semibold text-brand-secondary">Conclusiones</h4>
        <textarea
          name="conclusion"
          rows={3}
          defaultValue={conclusion}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
      </div>

      {/* Anexo fotográfico */}
      <div className="rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
        <h4 className="mb-3 text-sm font-semibold text-brand-secondary">Anexo fotográfico</h4>
        <div className="mb-4 flex flex-wrap gap-3">
          {photos.map((url) => (
            <div key={url} className="relative h-24 w-24 overflow-hidden rounded-lg border border-zinc-200">
              <Image src={url} alt="Evidencia" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" multiple accept="image/*,.heic,.heif,.heics,.heifs,.dng" onChange={uploadPhoto} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 shadow-soft transition-colors hover:bg-zinc-50 disabled:opacity-50"
          >
            {uploading ? uploadProgress || "Subiendo..." : "+ Agregar fotos"}
          </button>
          <span className="text-xs text-zinc-400">
            {photos.length} foto{photos.length !== 1 ? "s" : ""}
          </span>
        </div>
        {uploadError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {uploadError}
          </div>
        )}
      </div>

      {/* Firmas */}
      <div className="rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
        <h4 className="mb-3 text-sm font-semibold text-brand-secondary">Firmas</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <SignaturePad label="Firma del profesional que ejecuta" name="firma_tecnico" defaultValue={firma_tecnico} />
          <SignaturePad label="Firma de quien aprueba" name="firma_aprobador" defaultValue={firma_aprobador} firmaUrl={tecnicoFirmaUrl} firmaNombre={tecnicoNombre} />
          {/* Firma recibe — solo lectura */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-600">Firma de quien recibe a satisfacción</label>
            {firma_recibe ? (
              <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-2">
                <Image src={firma_recibe} alt="Firma de quien recibe" width={200} height={60} className="h-auto w-auto max-h-[60px] object-contain" />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <span className="text-sm text-zinc-400">Sin firmar</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-primary/90 disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
        {success && (
          <span className="text-sm text-green-600">✓ Guardado</span>
        )}
        {state?.error && (
          <span className="text-sm text-red-600">{state.error}</span>
        )}
      </div>
    </form>
  );
}
