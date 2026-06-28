"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { SignaturePad } from "@/components/SignaturePad";

type PlantillaItem = {
  id: string;
  nombre: string;
  categoria: string;
  obligatorio: boolean;
};

type Plantilla = {
  id: string;
  nombre: string;
  descripcion: string;
  items: PlantillaItem[];
};

type CheckResult = {
  itemId: string;
  resultado: "ok" | "falla" | "na";
  observacion: string;
};

const TIPOS_SERVICIO = [
  "Mantenimiento preventivo",
  "Mantenimiento correctivo",
  "Calibración",
  "Verificación metrológica",
  "Instalación",
  "Reparación",
  "Otro",
];

export default function NuevoInformePage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [selectedEquipo, setSelectedEquipo] = useState<any>(null);
  const [sedes, setSedes] = useState<any[]>([]);
  const [selectedSede, setSelectedSede] = useState<any>(null);
  const [loadingSedes, setLoadingSedes] = useState(false);
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [plantillaId, setPlantillaId] = useState("");
  const [selectedPlantilla, setSelectedPlantilla] = useState<Plantilla | null>(null);
  const [checkResults, setCheckResults] = useState<Record<string, CheckResult>>({});
  const [loading, setLoading] = useState(true);
  const [loadingEquipos, setLoadingEquipos] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [profile, setProfile] = useState<{ role: string; nombre: string; firma_url?: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/clientes").then((r) => r.json()),
      fetch("/api/plantillas").then((r) => r.json()),
      fetch("/api/perfil").then((r) => r.json()),
    ]).then(([clientesData, plantillasData, perfilData]) => {
      setClientes(Array.isArray(clientesData) ? clientesData : []);
      setPlantillas(Array.isArray(plantillasData) ? plantillasData : []);
      setProfile(perfilData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleClienteChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const cl = clientes.find((c: any) => c.id === id);
    setSelectedCliente(cl || null);
    setSelectedSede(null);
    setSelectedEquipo(null);
    setSedes([]);
    setEquipos([]);

    if (!id) return;

    setLoadingSedes(true);
    try {
      const res = await fetch(`/api/sedes?cliente_id=${id}`);
      const data = await res.json();
      setSedes(Array.isArray(data) ? data : []);
    } catch {
      setSedes([]);
    }
    setLoadingSedes(false);
  };

  const handleSedeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const sd = sedes.find((s: any) => s.id === id);
    setSelectedSede(sd || null);
    setSelectedEquipo(null);
    setEquipos([]);

    if (!id || !selectedCliente) return;

    setLoadingEquipos(true);
    try {
      const res = await fetch(`/api/equipos?cliente_id=${selectedCliente.id}&sede_id=${id}`);
      const data = await res.json();
      setEquipos(Array.isArray(data) ? data : []);
    } catch {
      setEquipos([]);
    }
    setLoadingEquipos(false);
  };

  const handleEquipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const eq = equipos.find((eq: any) => eq.id === id);
    setSelectedEquipo(eq || null);
  };

  const handlePlantillaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setPlantillaId(id);
    const plantilla = plantillas.find((p) => p.id === id) || null;
    setSelectedPlantilla(plantilla);
    // Initialize check results
    if (plantilla) {
      const initial: Record<string, CheckResult> = {};
      plantilla.items.forEach((item) => {
        initial[item.id] = { itemId: item.id, resultado: "ok", observacion: "" };
      });
      setCheckResults(initial);
    } else {
      setCheckResults({});
    }
  };

  const setResultado = (itemId: string, resultado: "ok" | "falla" | "na") => {
    setCheckResults((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], resultado },
    }));
  };

  const setObservacion = (itemId: string, observacion: string) => {
    setCheckResults((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], observacion },
    }));
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError("");
    setUploading(true);
    setUploadProgress("");

    const MAX_SIZE = 5 * 1024 * 1024;
    let uploaded = 0;
    let errors: string[] = [];

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

  const [generando, setGenerando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const generarYDescargar = async (descargar: boolean) => {
    if (!formRef.current) return;
    setGenerando(true);
    setUploadError("");
    try {
      const formData = new FormData(formRef.current);

      const equipoId = formData.get("equipo_id") as string;
      const observaciones = formData.get("observaciones") as string;
      const tipo = formData.get("tipo") as string;
      const conclusion = formData.get("conclusion") as string;
      const ordenServicio = formData.get("orden_servicio") as string;
      const numeroInforme = formData.get("numero_informe") as string;
      const fecha = formData.get("fecha") as string;
      const profesional = formData.get("profesional") as string;
      const aprobador = formData.get("aprobador") as string;
      const proximoMantenimiento = formData.get("proximo_mantenimiento") as string;
      const proximaCalibracion = formData.get("proxima_calibracion") as string;
      const firmaTecnico = formData.get("firma_tecnico") as string;
      const firmaAprobador = formData.get("firma_aprobador") as string;
      const firmaRecibe = formData.get("firma_recibe") as string;
      const eq = equipos.find((eq: any) => eq.id === equipoId);
      if (!eq || !eq.cliente_id) {
        setUploadError("Equipo no válido");
        setGenerando(false);
        return;
      }

      const res = await fetch(`/api/equipos/${equipoId}`);
      if (!res.ok) {
        setUploadError("Error al obtener datos del equipo");
        setGenerando(false);
        return;
      }
      const equipoFull = await res.json();

      const payload = {
        equipoId,
        plantillaId,
        logo: "/logo gestek.png",
        equipo: {
          nombre: equipoFull.nombre,
          id_cliente: equipoFull.id_cliente,
          tipo: equipoFull.tipo,
          marca: equipoFull.marca,
          modelo: equipoFull.modelo,
          serie: equipoFull.serie,
          accesorios: equipoFull.accesorios,
          ubicacion: equipoFull.ubicacion,
          fecha_proximo_mantenimiento: proximoMantenimiento || equipoFull.fecha_proximo_mantenimiento,
          fecha_proxima_calibracion: proximaCalibracion || equipoFull.fecha_proxima_calibracion,
        },
        proximo_mantenimiento: proximoMantenimiento,
        proxima_calibracion: proximaCalibracion,
        cliente: {
          nombre: equipoFull.cliente?.nombre || "",
          nit: equipoFull.cliente?.nit,
          direccion: equipoFull.cliente?.direccion,
          ciudad: equipoFull.cliente?.ciudad,
          email: equipoFull.cliente?.email || "",
          logo_url: equipoFull.cliente?.logo_url || "",
        },
        sede: equipoFull.sede
          ? {
              nombre: equipoFull.sede.nombre || "",
              ciudad: equipoFull.sede.ciudad || null,
              direccion: equipoFull.sede.direccion || null,
            }
          : null,
        mantenimiento: {
          tipo,
          fecha: fecha || new Date().toLocaleDateString("es-ES"),
          orden_servicio: ordenServicio || undefined,
          numero_informe: numeroInforme || undefined,
          observaciones,
          conclusion,
          tecnico_nombre: profesional || "Técnico",
          aprobador_nombre: aprobador || undefined,
          checklist: Object.values(checkResults).map((cr) => {
            const item = selectedPlantilla?.items.find((i) => i.id === cr.itemId);
            return {
              nombre: item?.nombre || "",
              categoria: item?.categoria || "",
              resultado: cr.resultado,
              observacion: cr.observacion,
            };
          }),
          fotos: photos,
          firma_tecnico: firmaTecnico || undefined,
          firma_aprobador: firmaAprobador || undefined,
          firma_recibe: firmaRecibe || undefined,
        },
      };

      const pdfRes = await fetch("/api/informes/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!pdfRes.ok) {
        const err = await pdfRes.json().catch(() => ({ error: "Error al generar el informe" }));
        setUploadError(err.error || "Error al generar el informe");
        setGenerando(false);
        return;
      }

      const mantenimientoId = pdfRes.headers.get("X-Mantenimiento-Id");

      if (descargar) {
        const blob = await pdfRes.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `informe-${(payload.equipo.nombre || "equipo").replace(/\s+/g, "-").toLowerCase()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }

      if (mantenimientoId) {
        window.location.href = `/informes/${mantenimientoId}`;
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Error generando informe:", err);
      setUploadError("Error inesperado al generar el informe");
      setGenerando(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="rounded-xl border border-zinc-200/60 bg-white p-10 shadow-card text-center max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-brand-secondary">Informe generado</h2>
          <p className="mt-2 text-sm text-zinc-500">El informe se ha generado correctamente.</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link href="/informes/nuevo" className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-600 shadow-soft transition-colors hover:bg-zinc-50">
              Nuevo informe
            </Link>
            <Link href="/informes" className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-primary/90">
              Ver informes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <AppHeader
        links={[
          { href: "/dashboard", label: "Inicio" },
          { href: "/informes", label: "Informes" },
        ]}
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-brand-secondary">Generar informe de servicio</h2>

        <form ref={formRef} className="space-y-6">
          {/* Step 1: Datos del cliente */}
          <div className="rounded-xl border border-zinc-200/60 bg-white p-6 shadow-card">
            <h3 className="mb-4 font-semibold text-brand-secondary">1. Datos del cliente</h3>
            <select
              value={selectedCliente?.id || ""}
              onChange={handleClienteChange}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((cl: any) => (
                <option key={cl.id} value={cl.id}>
                  {cl.nombre} {cl.ciudad ? `(${cl.ciudad})` : ""}
                </option>
              ))}
            </select>
            {selectedCliente && (
              <div className="mt-3 rounded-lg bg-[#f8fafc] p-4 text-sm">
                <p className="font-medium text-brand-secondary">{selectedCliente.nombre}</p>
                <p className="mt-1 text-zinc-500">{selectedCliente.nit || "—"} · {selectedCliente.ciudad || "—"}</p>
              </div>
            )}
          </div>

          {/* Step 2: Sede */}
          {selectedCliente && (
            <div className="rounded-xl border border-zinc-200/60 bg-white p-6 shadow-card">
              <h3 className="mb-4 font-semibold text-brand-secondary">2. Sede</h3>
              <select
                value={selectedSede?.id || ""}
                onChange={handleSedeChange}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="">Seleccionar sede...</option>
                {loadingSedes ? (
                  <option disabled>Cargando sedes...</option>
                ) : sedes.length === 0 ? (
                  <option disabled>No hay sedes para este cliente</option>
                ) : sedes.map((sd: any) => (
                  <option key={sd.id} value={sd.id}>
                    {sd.nombre}{sd.ciudad ? ` (${sd.ciudad})` : ""}
                  </option>
                ))}
              </select>
              {selectedSede && (
                <div className="mt-3 rounded-lg bg-[#f8fafc] p-4 text-sm">
                  <p className="font-medium text-brand-secondary">{selectedSede.nombre}</p>
                  <p className="mt-1 text-zinc-500">{selectedSede.direccion || "—"} · {selectedSede.ciudad || "—"}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Datos del equipo */}
          {selectedSede && (
            <div className="rounded-xl border border-zinc-200/60 bg-white p-6 shadow-card">
              <h3 className="mb-4 font-semibold text-brand-secondary">3. Datos del equipo</h3>
              <select
                name="equipo_id"
                required
                onChange={handleEquipoChange}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="">Seleccionar equipo...</option>
                {loadingEquipos ? (
                  <option disabled>Cargando equipos...</option>
                ) : equipos.length === 0 ? (
                  <option disabled>No hay equipos para este cliente</option>
                ) : equipos.map((eq: any) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nombre} ({eq.marca || "—"} · {eq.serie || eq.id || eq.ubicacion})
                  </option>
                ))}
              </select>
              {selectedEquipo && (
                <div className="mt-3 rounded-lg bg-[#f8fafc] p-4 text-sm">
                  <p className="font-medium text-brand-secondary">{selectedEquipo.nombre}</p>
                  <p className="mt-1 text-zinc-500">
                    {selectedEquipo.marca || "—"} / {selectedEquipo.modelo || "—"} · Serie: {selectedEquipo.serie || "—"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Datos del servicio */}
          {selectedEquipo && (
            <div className="rounded-xl border border-zinc-200/60 bg-white p-6 shadow-card">
              <h3 className="mb-4 font-semibold text-brand-secondary">4. Datos del servicio</h3>

              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-zinc-600">Tipo de servicio *</label>
                <select
                  name="tipo"
                  required
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="">Seleccionar...</option>
                  {TIPOS_SERVICIO.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600">N° de informe</label>
                  <input
                    name="numero_informe"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    placeholder="N° interno de informe"
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600">Orden de servicio</label>
                  <input
                    name="orden_servicio"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    placeholder="N° de orden del cliente"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600">Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600">Profesional que ejecuta</label>
                  <input
                    name="profesional"
                    defaultValue={profile?.nombre || ""}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    placeholder="Nombre del técnico o profesional"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600">Próximo mantenimiento</label>
                  <input
                    type="date"
                    name="proximo_mantenimiento"
                    defaultValue={selectedEquipo?.fecha_proximo_mantenimiento || ""}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-zinc-600">Próxima calibración</label>
                  <input
                    type="date"
                    name="proxima_calibracion"
                    defaultValue={selectedEquipo?.fecha_proxima_calibracion || ""}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Observaciones iniciales */}
          {selectedEquipo && (
            <div className="rounded-xl border border-zinc-200/60 bg-white p-6 shadow-card">
              <h3 className="mb-4 font-semibold text-brand-secondary">5. Observaciones iniciales</h3>
              <textarea
                name="observaciones"
                rows={4}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                placeholder="Observaciones generales del servicio..."
              />
            </div>
          )}

          {/* Step 6: Lista de chequeo */}
          {selectedEquipo && (
            <div className="rounded-xl border border-zinc-200/60 bg-white p-6 shadow-card">
              <h3 className="mb-4 font-semibold text-brand-secondary">6. Lista de chequeo</h3>

              <select
                value={plantillaId}
                onChange={handlePlantillaChange}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="">Seleccionar plantilla...</option>
                {plantillas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-right">
                <Link href="/plantillas" className="text-xs text-brand-primary hover:underline">
                  Gestionar plantillas
                </Link>
              </div>

              {selectedPlantilla && (
                <div className="mt-4">
                  <p className="mb-4 text-xs text-zinc-400">
                    {selectedPlantilla.nombre}{selectedPlantilla.descripcion ? ` — ${selectedPlantilla.descripcion}` : ""}
                  </p>

                  <div className="space-y-3">
                    {selectedPlantilla.items.map((item) => {
                      const result = checkResults[item.id];
                      return (
                        <div key={item.id} className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-brand-secondary">
                                {item.nombre}
                                {item.obligatorio && <span className="ml-1 text-red-400">*</span>}
                              </p>
                              <span className="mt-0.5 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">
                                {item.categoria}
                              </span>
                            </div>
                            <div className="flex shrink-0 gap-2">
                              {(["ok", "falla", "na"] as const).map((r) => (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => setResultado(item.id, r)}
                                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                    result?.resultado === r
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
                            value={result?.observacion || ""}
                            onChange={(e) => setObservacion(item.id, e.target.value)}
                            className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 7: Conclusiones */}
          {selectedEquipo && (
            <div className="rounded-xl border border-zinc-200/60 bg-white p-6 shadow-card">
              <h3 className="mb-4 font-semibold text-brand-secondary">7. Conclusiones</h3>
              <textarea
                name="conclusion"
                rows={3}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                placeholder="Estado final del equipo, recomendaciones..."
              />
            </div>
          )}

          {/* Step 8: Anexo fotográfico */}
          {selectedEquipo && (
            <div className="rounded-xl border border-zinc-200/60 bg-white p-6 shadow-card">
              <h3 className="mb-4 font-semibold text-brand-secondary">8. Anexo fotográfico</h3>

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
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*,.heic,.heif,.heics,.heifs,.dng"
                  onChange={uploadPhoto}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 shadow-soft transition-colors hover:bg-zinc-50 disabled:opacity-50"
                >
                  {uploading ? uploadProgress || "Subiendo..." : "+ Agregar fotos"}
                </button>
                <span className="text-xs text-zinc-400">
                  {photos.length} foto{photos.length !== 1 ? "s" : ""} agregada{photos.length !== 1 ? "s" : ""}
                </span>
              </div>
              {uploadError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {uploadError}
                </div>
              )}
            </div>
          )}

          {/* Step 9: Firmas */}
          {selectedEquipo && (
            <div className="rounded-xl border border-zinc-200/60 bg-white p-6 shadow-card">
              <h3 className="mb-4 font-semibold text-brand-secondary">9. Firmas</h3>

              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-zinc-600">Profesional que aprueba</label>
                <input
                  name="aprobador"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="Nombre de quien aprueba el servicio"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <SignaturePad label="Firma del profesional que ejecuta" name="firma_tecnico" firmaUrl={profile?.firma_url} firmaNombre={profile?.nombre} />
                <SignaturePad label="Firma de quien aprueba" name="firma_aprobador" firmaUrl={profile?.role === "administrador" ? profile?.firma_url : undefined} firmaNombre={profile?.role === "administrador" ? profile?.nombre : undefined} />
                <SignaturePad label="Firma de quien recibe a satisfacción" name="firma_recibe" />
              </div>
            </div>
          )}

          {/* Step 10: Vista previa */}
          {selectedEquipo && !preview && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const fd = new FormData(formRef.current!);
                  setPreviewData({
                    orden_servicio: fd.get("orden_servicio"),
                    numero_informe: fd.get("numero_informe"),
                    profesional: fd.get("profesional"),
                    aprobador: fd.get("aprobador"),
                    tipo: fd.get("tipo"),
                    observaciones: fd.get("observaciones"),
                    conclusion: fd.get("conclusion"),
                    fecha: fd.get("fecha"),
                  });
                  setPreview(true);
                  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                }}
                className="rounded-xl border border-brand-primary bg-white px-8 py-3 text-sm font-medium text-brand-primary shadow-soft transition-all hover:bg-brand-primary/5"
              >
                Vista previa del informe
              </button>
            </div>
          )}

          {selectedEquipo && preview && previewData && (
            <div className="rounded-xl border border-zinc-200/60 bg-white p-6 shadow-card">
              <h3 className="mb-4 font-semibold text-brand-secondary">10. Vista previa del informe</h3>
              <p className="mb-4 text-xs text-zinc-400">Revisa los datos antes de generar el informe. Puedes volver arriba para editar cualquier sección.</p>

              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Cliente</h4>
                  {selectedCliente ? (
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-brand-secondary">{selectedCliente.nombre}</p>
                      <p className="text-zinc-500">NIT: {selectedCliente.nit || "—"} · {selectedCliente.ciudad || "—"}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400">No seleccionado</p>
                  )}
                </div>
                <div className="rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Equipo</h4>
                  {selectedEquipo ? (
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-brand-secondary">{selectedEquipo.nombre}</p>
                      <p className="text-zinc-500">{selectedEquipo.marca || "—"} / {selectedEquipo.modelo || "—"} · Serie: {selectedEquipo.serie || "—"}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400">No seleccionado</p>
                  )}
                </div>
              </div>

              {selectedPlantilla && Object.keys(checkResults).length > 0 && (
                <div className="mb-4 rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Checklist: {selectedPlantilla.nombre}</h4>
                  <div className="space-y-1">
                    {selectedPlantilla.items.map((item) => {
                      const r = checkResults[item.id];
                      return (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${
                            r?.resultado === "ok" ? "bg-green-500" : r?.resultado === "falla" ? "bg-red-500" : "bg-zinc-300"
                          }`} />
                          <span className="flex-1 text-zinc-700">{item.nombre}</span>
                          <span className={`text-xs font-medium ${
                            r?.resultado === "ok" ? "text-green-600" : r?.resultado === "falla" ? "text-red-600" : "text-zinc-400"
                          }`}>
                            {r?.resultado === "ok" ? "OK" : r?.resultado === "falla" ? "FALLA" : "N/A"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Servicio</h4>
                  <div className="space-y-1 text-sm">
                    {previewData.tipo && <p><span className="text-zinc-400">Tipo:</span> <span className="text-zinc-700">{previewData.tipo}</span></p>}
                    {previewData.orden_servicio && <p><span className="text-zinc-400">Orden:</span> <span className="text-zinc-700">{previewData.orden_servicio}</span></p>}
                    {previewData.numero_informe && <p><span className="text-zinc-400">N° Informe:</span> <span className="text-zinc-700">{previewData.numero_informe}</span></p>}
                    {previewData.fecha && <p><span className="text-zinc-400">Fecha:</span> <span className="text-zinc-700">{previewData.fecha}</span></p>}
                    {previewData.profesional && <p><span className="text-zinc-400">Profesional:</span> <span className="text-zinc-700">{previewData.profesional}</span></p>}
                    {previewData.aprobador && <p><span className="text-zinc-400">Aprueba:</span> <span className="text-zinc-700">{previewData.aprobador}</span></p>}
                    {!previewData.tipo && !previewData.orden_servicio && !previewData.numero_informe && !previewData.profesional && (
                      <p className="text-zinc-400">Sin datos de servicio</p>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Fotos</h4>
                  {photos.length > 0 ? (
                    <p className="text-sm text-zinc-600">{photos.length} foto{photos.length !== 1 ? "s" : ""} agregada{photos.length !== 1 ? "s" : ""}</p>
                  ) : (
                    <p className="text-sm text-zinc-400">Sin fotos</p>
                  )}
                </div>
              </div>

              {previewData.observaciones && (
                <div className="mb-4 rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Observaciones</h4>
                  <p className="whitespace-pre-wrap text-sm text-zinc-700">{previewData.observaciones}</p>
                </div>
              )}

              {previewData.conclusion && (
                <div className="mb-4 rounded-lg border border-zinc-200 bg-[#f8fafc] p-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Conclusión</h4>
                  <p className="whitespace-pre-wrap text-sm text-zinc-700">{previewData.conclusion}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPreview(false)}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-soft hover:bg-zinc-50"
                >
                  Editar datos
                </button>
                <button
                  type="button"
                  onClick={() => generarYDescargar(false)}
                  disabled={generando}
                  className="rounded-lg bg-brand-primary px-6 py-2 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-primary/90 disabled:opacity-50"
                >
                  {generando ? "Generando..." : "Generar informe"}
                </button>
                {profile?.role === "administrador" && (
                  <button
                    type="button"
                    onClick={() => generarYDescargar(true)}
                    disabled={generando}
                    className="rounded-lg border border-brand-primary bg-white px-6 py-2 text-sm font-medium text-brand-primary shadow-soft transition-all hover:bg-brand-primary/5 disabled:opacity-50"
                  >
                    {generando ? "Generando..." : "Descargar PDF"}
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
