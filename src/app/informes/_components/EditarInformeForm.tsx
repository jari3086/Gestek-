"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import { actualizarInforme } from "@/lib/actions/informes";
import { SignaturePad } from "@/components/SignaturePad";
import Image from "next/image";

const TIPOS_SERVICIO = [
  "Mantenimiento preventivo",
  "Mantenimiento correctivo",
  "Calibración",
  "Verificación metrológica",
  "Instalación",
  "Reparación",
  "Otro",
];

type CheckItem = {
  nombre: string;
  categoria: string;
  resultado: "ok" | "falla" | "na";
  observacion: string;
};

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
  checklist: initialChecklist,
  fotos: initialFotos,
  equipoNombre,
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
  checklist?: CheckItem[];
  fotos?: string[];
  equipoNombre?: string;
}) {
  const [success, setSuccess] = useState(false);
  const [checklist, setChecklist] = useState<CheckItem[]>(initialChecklist || []);
  const [photos, setPhotos] = useState<string[]>(initialFotos || []);
  const [uploading, setUploading] = useState(false);
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
        checklist: checklist.length > 0 ? checklist : undefined,
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
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploading(true);

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La foto no puede superar los 5 MB");
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) {
        setUploadError(data.error || "Error al subir la foto");
      } else if (data.url) {
        setPhotos((prev) => [...prev, data.url]);
      }
    } catch {
      setUploadError("Error de conexión al subir la foto");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
  };

  const setResultado = (index: number, resultado: "ok" | "falla" | "na") => {
    setChecklist((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], resultado };
      return next;
    });
  };

  const setObservacion = (index: number, observacion: string) => {
    setChecklist((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], observacion };
      return next;
    });
  };

  return (
    <form action={action} className="space-y-4">
      {/* Hidden field to track current photos */}
      <input type="hidden" name="_fotos_actuales" value={JSON.stringify(photos)} />

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

      {/* Lista de chequeo */}
      {checklist.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
          <h4 className="mb-3 text-sm font-semibold text-brand-secondary">Lista de chequeo</h4>
          <div className="space-y-3">
            {checklist.map((item, index) => (
              <div key={index} className="rounded-lg border border-zinc-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-secondary">{item.nombre}</p>
                    <span className="mt-0.5 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">
                      {item.categoria}
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {(["ok", "falla", "na"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setResultado(index, r)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                          item.resultado === r
                            ? r === "ok"
                              ? "border-green-300 bg-green-50 text-green-700"
                              : r === "falla"
                              ? "border-red-300 bg-red-50 text-red-700"
                              : "border-zinc-300 bg-zinc-100 text-zinc-500"
                            : "border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50"
                        }`}
                      >
                        {r === "ok" ? "OK" : r === "falla" ? "FALLA" : "N/A"}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  placeholder="Observación (opcional)"
                  value={item.observacion || ""}
                  onChange={(e) => setObservacion(index, e.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            ))}
          </div>
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
          <input ref={fileRef} type="file" accept="image/*,.heic,.heif,.heics,.heifs,.dng" onChange={uploadPhoto} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 shadow-soft transition-colors hover:bg-zinc-50 disabled:opacity-50"
          >
            {uploading ? "Subiendo..." : "+ Agregar foto"}
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
          <SignaturePad label="Firma de quien aprueba" name="firma_aprobador" defaultValue={firma_aprobador} />
          <SignaturePad label="Firma de quien recibe a satisfacción" name="firma_recibe" defaultValue={firma_recibe} />
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
