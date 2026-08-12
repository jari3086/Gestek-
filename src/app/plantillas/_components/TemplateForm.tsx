"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { crearPlantilla, actualizarPlantilla } from "@/lib/actions/plantillas";
import { generarId, type Seccion, type PlantillaMedicion } from "@/lib/checklist";
import Link from "next/link";

type Props = {
  plantilla?: {
    id: string;
    nombre: string;
    descripcion: string;
    secciones: Seccion[];
  };
};

function nuevaSeccionChecklist(): Seccion {
  return {
    id: generarId(),
    titulo: "",
    tipo: "checklist",
    items: [{ id: generarId(), nombre: "", obligatorio: true }],
  };
}

function nuevaSeccionMediciones(): Seccion {
  return {
    id: generarId(),
    titulo: "",
    tipo: "mediciones",
    grupos: [{ titulo: "", campos: [{ id: generarId(), nombre: "", unidad: "", tipoCampo: "numero" }] }],
  };
}

export default function TemplateForm({ plantilla }: Props) {
  const action = plantilla ? actualizarPlantilla : crearPlantilla;
  const [state, formAction, pending] = useActionState(action, undefined);
  const [secciones, setSecciones] = useState<Seccion[]>(plantilla?.secciones || []);
  const [nombre, setNombre] = useState(plantilla?.nombre || "");
  const [descripcion, setDescripcion] = useState(plantilla?.descripcion || "");

  // ---------- Secciones ----------
  const agregarSeccion = (tipo: "checklist" | "mediciones") => {
    setSecciones((prev) => [
      ...prev,
      tipo === "checklist" ? nuevaSeccionChecklist() : nuevaSeccionMediciones(),
    ]);
  };

  const eliminarSeccion = (id: string) => {
    setSecciones((prev) => prev.filter((s) => s.id !== id));
  };

  const actualizarTitulo = (id: string, titulo: string) => {
    setSecciones((prev) => prev.map((s) => (s.id === id ? { ...s, titulo } : s)));
  };

  const subirSeccion = (idx: number) => {
    if (idx === 0) return;
    setSecciones((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const bajarSeccion = (idx: number) => {
    setSecciones((prev) => {
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  // ---------- Checklist ----------
  const agregarItem = (secId: string) => {
    setSecciones((prev) =>
      prev.map((s) =>
        s.id === secId && s.tipo === "checklist"
          ? { ...s, items: [...s.items, { id: generarId(), nombre: "", obligatorio: true }] }
          : s,
      ),
    );
  };

  const eliminarItem = (secId: string, itemId: string) => {
    setSecciones((prev) =>
      prev.map((s) =>
        s.id === secId && s.tipo === "checklist"
          ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
          : s,
      ),
    );
  };

  const actualizarItem = (secId: string, itemId: string, campo: "nombre" | "obligatorio", valor: string | boolean) => {
    setSecciones((prev) =>
      prev.map((s) =>
        s.id === secId && s.tipo === "checklist"
          ? {
              ...s,
              items: s.items.map((i) => (i.id === itemId ? { ...i, [campo]: valor } : i)),
            }
          : s,
      ),
    );
  };

  const moverItem = (secId: string, idx: number, dir: -1 | 1) => {
    setSecciones((prev) =>
      prev.map((s) => {
        if (s.id !== secId || s.tipo !== "checklist") return s;
        const next = [...s.items];
        const target = idx + dir;
        if (target < 0 || target >= next.length) return s;
        [next[idx], next[target]] = [next[target], next[idx]];
        return { ...s, items: next };
      }),
    );
  };

  // ---------- Mediciones ----------
  const agregarGrupo = (secId: string) => {
    setSecciones((prev) =>
      prev.map((s) =>
        s.id === secId && s.tipo === "mediciones"
          ? { ...s, grupos: [...s.grupos, { titulo: "", campos: [{ id: generarId(), nombre: "", unidad: "", tipoCampo: "numero" }] }] }
          : s,
      ),
    );
  };

  const eliminarGrupo = (secId: string, gi: number) => {
    setSecciones((prev) =>
      prev.map((s) =>
        s.id === secId && s.tipo === "mediciones"
          ? { ...s, grupos: s.grupos.filter((_, i) => i !== gi) }
          : s,
      ),
    );
  };

  const actualizarGrupoTitulo = (secId: string, gi: number, titulo: string) => {
    setSecciones((prev) =>
      prev.map((s) =>
        s.id === secId && s.tipo === "mediciones"
          ? { ...s, grupos: s.grupos.map((g, i) => (i === gi ? { ...g, titulo } : g)) }
          : s,
      ),
    );
  };

  const agregarCampo = (secId: string, gi: number) => {
    setSecciones((prev) =>
      prev.map((s) =>
        s.id === secId && s.tipo === "mediciones"
          ? {
              ...s,
              grupos: s.grupos.map((g, i) =>
                i === gi
                  ? { ...g, campos: [...g.campos, { id: generarId(), nombre: "", unidad: "", tipoCampo: "numero" }] }
                  : g,
              ),
            }
          : s,
      ),
    );
  };

  const eliminarCampo = (secId: string, gi: number, campoId: string) => {
    setSecciones((prev) =>
      prev.map((s) =>
        s.id === secId && s.tipo === "mediciones"
          ? {
              ...s,
              grupos: s.grupos.map((g, i) =>
                i === gi ? { ...g, campos: g.campos.filter((c) => c.id !== campoId) } : g,
              ),
            }
          : s,
      ),
    );
  };

  const actualizarCampo = (secId: string, gi: number, campoId: string, campo: keyof PlantillaMedicion, valor: string) => {
    setSecciones((prev) =>
      prev.map((s) =>
        s.id === secId && s.tipo === "mediciones"
          ? {
              ...s,
              grupos: s.grupos.map((g, i) =>
                i === gi
                  ? { ...g, campos: g.campos.map((c) => (c.id === campoId ? { ...c, [campo]: valor } : c)) }
                  : g,
              ),
            }
          : s,
      ),
    );
  };

  const inputCls =
    "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary";

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-zinc-200/60 bg-white shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image src="/logo gestek.png" alt="Gestek" width={36} height={36} className="h-9 w-auto" />
            <span className="text-lg font-bold text-brand-secondary">GESTEK</span>
          </div>
          <nav className="flex items-center gap-5">
            <Link href="/dashboard" className="text-sm font-medium text-zinc-500 hover:text-brand-primary transition-colors">Inicio</Link>
            <Link href="/plantillas" className="text-sm font-medium text-zinc-500 hover:text-brand-primary transition-colors">Plantillas</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-brand-secondary">
          {plantilla ? "Editar plantilla" : "Nueva plantilla"}
        </h2>

        {state?.error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form action={formAction} className="rounded-xl border border-zinc-200/60 bg-white p-6 shadow-card">
          {plantilla && (
            <input type="hidden" name="id" value={plantilla.id} />
          )}

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-zinc-600">Nombre de la plantilla *</label>
            <input
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className={inputCls}
              placeholder="Ej: Refrigerador, Monitor de signos, Centrífuga..."
            />
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-zinc-600">Descripción (opcional)</label>
            <input
              name="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={inputCls}
              placeholder="Breve descripción del tipo de equipo"
            />
          </div>

          {/* Secciones */}
          <div className="mb-6">
            <div className="mb-3">
              <h3 className="font-semibold text-brand-secondary">Secciones</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Cada sección puede ser una lista de verificación o un bloque de mediciones. Se muestran en orden dentro del informe.
              </p>
            </div>

            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => agregarSeccion("checklist")}
                className="rounded-lg bg-brand-primary px-4 py-2 text-xs font-medium text-white transition-all hover:bg-brand-primary/90"
              >
                + Sección checklist
              </button>
              <button
                type="button"
                onClick={() => agregarSeccion("mediciones")}
                className="rounded-lg border border-brand-primary px-4 py-2 text-xs font-medium text-brand-primary transition-colors hover:bg-brand-primary/5"
              >
                + Sección mediciones
              </button>
            </div>

            {secciones.length === 0 && (
              <p className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-400">
                No hay secciones. Agregue al menos una sección para crear la plantilla.
              </p>
            )}

            <div className="space-y-4">
              {secciones.map((sec, idx) => (
                <div key={sec.id} className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                      {sec.tipo === "checklist" ? "Checklist" : "Mediciones"}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => subirSeccion(idx)}
                        disabled={idx === 0}
                        className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-200 disabled:opacity-30"
                        title="Subir"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => bajarSeccion(idx)}
                        disabled={idx === secciones.length - 1}
                        className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-200 disabled:opacity-30"
                        title="Bajar"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarSeccion(sec.id)}
                        className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-50"
                        title="Eliminar sección"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="mb-1 block text-xs text-zinc-500">Título de la sección (opcional)</label>
                    <input
                      value={sec.titulo || ""}
                      onChange={(e) => actualizarTitulo(sec.id, e.target.value)}
                      className={inputCls}
                      placeholder="Ej: Verificación visual, Pruebas eléctricas..."
                    />
                  </div>

                  {sec.tipo === "checklist" ? (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-400">Ítems de verificación</span>
                        <button
                          type="button"
                          onClick={() => agregarItem(sec.id)}
                          className="rounded bg-brand-primary px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-brand-primary/90"
                        >
                          + Agregar ítem
                        </button>
                      </div>
                      {sec.items.length === 0 && (
                        <p className="rounded-lg bg-white p-3 text-xs text-zinc-400">
                          Sin ítems. Agregue al menos uno.
                        </p>
                      )}
                      <div className="space-y-3">
                        {sec.items.map((item, itemIdx) => (
                          <div key={item.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-medium text-zinc-400">Ítem #{itemIdx + 1}</span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => moverItem(sec.id, itemIdx, -1)}
                                  disabled={itemIdx === 0}
                                  className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-200 disabled:opacity-30"
                                  title="Subir"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moverItem(sec.id, itemIdx, 1)}
                                  disabled={itemIdx === sec.items.length - 1}
                                  className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-200 disabled:opacity-30"
                                  title="Bajar"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => eliminarItem(sec.id, item.id)}
                                  className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-50"
                                  title="Eliminar"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                            <input
                              value={item.nombre}
                              onChange={(e) => actualizarItem(sec.id, item.id, "nombre", e.target.value)}
                              className={inputCls}
                              placeholder="Ej: Verificar termostato"
                            />
                            <label className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                              <input
                                type="checkbox"
                                checked={item.obligatorio}
                                onChange={(e) => actualizarItem(sec.id, item.id, "obligatorio", e.target.checked)}
                                className="rounded border-zinc-300 text-brand-primary focus:ring-brand-primary"
                              />
                              Obligatorio
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {sec.grupos.length > 0 && (
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-zinc-400">Grupos de mediciones</span>
                          <button
                            type="button"
                            onClick={() => agregarGrupo(sec.id)}
                            className="rounded bg-brand-primary px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-brand-primary/90"
                          >
                            + Agregar grupo
                          </button>
                        </div>
                      )}
                      {sec.grupos.length === 0 && (
                        <div className="flex flex-col items-start gap-2">
                          <p className="rounded-lg bg-white p-3 text-xs text-zinc-400">
                            Sin grupos. Agregue un grupo para iniciar.
                          </p>
                          <button
                            type="button"
                            onClick={() => agregarGrupo(sec.id)}
                            className="rounded bg-brand-primary px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-brand-primary/90"
                          >
                            + Agregar grupo
                          </button>
                        </div>
                      )}

                      <div className="space-y-3">
                        {sec.grupos.map((grupo, gi) => (
                          <div key={gi} className="rounded-lg border border-zinc-200 bg-white p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-medium text-zinc-400">Grupo #{gi + 1}</span>
                              <button
                                type="button"
                                onClick={() => eliminarGrupo(sec.id, gi)}
                                className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-50"
                                title="Eliminar grupo"
                              >
                                ✕
                              </button>
                            </div>

                            <div className="mb-3">
                              <label className="mb-1 block text-xs text-zinc-500">Título del grupo (opcional)</label>
                              <input
                                value={grupo.titulo || ""}
                                onChange={(e) => actualizarGrupoTitulo(sec.id, gi, e.target.value)}
                                className={inputCls}
                                placeholder="Ej: Fuente de energía, Temperatura..."
                              />
                            </div>

                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-medium text-zinc-400">Campos</span>
                              <button
                                type="button"
                                onClick={() => agregarCampo(sec.id, gi)}
                                className="rounded bg-brand-primary px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-brand-primary/90"
                              >
                                + Agregar campo
                              </button>
                            </div>

                            {grupo.campos.length === 0 && (
                              <p className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-400">
                                Sin campos. Agregue al menos uno.
                              </p>
                            )}

                            <div className="space-y-3">
                              {grupo.campos.map((campo, ci) => (
                                <div key={campo.id} className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3">
                                  <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs font-medium text-zinc-400">Campo #{ci + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => eliminarCampo(sec.id, gi, campo.id)}
                                      className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-50"
                                      title="Eliminar campo"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                      <label className="mb-1 block text-xs text-zinc-500">Parámetro</label>
                                      <input
                                        value={campo.nombre}
                                        onChange={(e) => actualizarCampo(sec.id, gi, campo.id, "nombre", e.target.value)}
                                        className={inputCls}
                                        placeholder="Ej: Voltaje Línea A"
                                      />
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-xs text-zinc-500">Unidad</label>
                                      <input
                                        value={campo.unidad}
                                        onChange={(e) => actualizarCampo(sec.id, gi, campo.id, "unidad", e.target.value)}
                                        className={inputCls}
                                        placeholder="Ej: VAC, A, °C, h"
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <div>
                                      <label className="mb-1 block text-xs text-zinc-500">Tipo de valor</label>
                                      <select
                                        value={campo.tipoCampo || "numero"}
                                        onChange={(e) => actualizarCampo(sec.id, gi, campo.id, "tipoCampo", e.target.value)}
                                        className={inputCls}
                                      >
                                        <option value="numero">Número</option>
                                        <option value="texto">Texto</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-xs text-zinc-500">Referencia / límites (opcional)</label>
                                      <input
                                        value={campo.referencia || ""}
                                        onChange={(e) => actualizarCampo(sec.id, gi, campo.id, "referencia", e.target.value)}
                                        className={inputCls}
                                        placeholder="Ej: 110–120 VAC"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <input type="hidden" name="secciones" value={JSON.stringify(secciones)} />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending || secciones.length === 0 || !nombre}
              className="rounded-lg bg-brand-primary px-6 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Guardando..." : plantilla ? "Actualizar plantilla" : "Crear plantilla"}
            </button>
            <Link
              href="/plantillas"
              className="rounded-lg border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-600 shadow-soft transition-colors hover:bg-zinc-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
