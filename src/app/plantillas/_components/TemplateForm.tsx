"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { crearPlantilla, actualizarPlantilla, type PlantillaItem } from "@/lib/actions/plantillas";
import Link from "next/link";

const CATEGORIAS = [
  "Eléctrico", "Mecánico", "Limpieza", "Inspección",
  "Medición", "Calibración", "Accesorios", "Visual",
  "Seguridad", "Radiación", "Digital", "Otro",
];

type Props = {
  plantilla?: {
    id: string;
    nombre: string;
    descripcion: string;
    items: PlantillaItem[];
  };
};

function generarId() {
  return Math.random().toString(36).slice(2, 8);
}

export default function TemplateForm({ plantilla }: Props) {
  const action = plantilla ? actualizarPlantilla : crearPlantilla;
  const [state, formAction, pending] = useActionState(action, undefined);
  const [items, setItems] = useState<PlantillaItem[]>(plantilla?.items || []);
  const [nombre, setNombre] = useState(plantilla?.nombre || "");
  const [descripcion, setDescripcion] = useState(plantilla?.descripcion || "");

  const agregarItem = () => {
    setItems((prev) => [
      ...prev,
      { id: generarId(), nombre: "", categoria: "Otro", obligatorio: true },
    ]);
  };

  const eliminarItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const actualizarItem = (id: string, campo: keyof PlantillaItem, valor: string | boolean) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)),
    );
  };

  const subirItem = (idx: number) => {
    if (idx === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const bajarItem = (idx: number) => {
    if (idx === items.length - 1) return;
    setItems((prev) => {
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-zinc-200/60 bg-white shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image src="/logo gestek.png" alt="Gestek" width={36} height={36} className="h-9 w-auto" />
            <span className="text-lg font-bold text-brand-secondary">GESTEK</span>
          </div>
          <nav className="flex items-center gap-5">
            <a href="/dashboard" className="text-sm font-medium text-zinc-500 hover:text-brand-primary transition-colors">Inicio</a>
            <a href="/plantillas" className="text-sm font-medium text-zinc-500 hover:text-brand-primary transition-colors">Plantillas</a>
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
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              placeholder="Ej: Refrigerador, Monitor de signos, Centrífuga..."
            />
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-zinc-600">Descripción (opcional)</label>
            <input
              name="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              placeholder="Breve descripción del tipo de equipo"
            />
          </div>

          {/* Items */}
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-brand-secondary">Ítems de la lista de chequeo</h3>
              <button
                type="button"
                onClick={agregarItem}
                className="rounded-lg bg-brand-primary px-4 py-2 text-xs font-medium text-white transition-all hover:bg-brand-primary/90"
              >
                + Agregar ítem
              </button>
            </div>

            {items.length === 0 && (
              <p className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-400">
                No hay ítems. Agregue al menos uno.
              </p>
            )}

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-400">Ítem #{idx + 1}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => subirItem(idx)}
                        disabled={idx === 0}
                        className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-200 disabled:opacity-30"
                        title="Subir"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => bajarItem(idx)}
                        disabled={idx === items.length - 1}
                        className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-200 disabled:opacity-30"
                        title="Bajar"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarItem(item.id)}
                        className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-50"
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs text-zinc-500">Nombre del ítem</label>
                      <input
                        value={item.nombre}
                        onChange={(e) => actualizarItem(item.id, "nombre", e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        placeholder="Ej: Verificar termostato"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-500">Categoría</label>
                      <select
                        value={item.categoria}
                        onChange={(e) => actualizarItem(item.id, "categoria", e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      >
                        {CATEGORIAS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                    <input
                      type="checkbox"
                      checked={item.obligatorio}
                      onChange={(e) => actualizarItem(item.id, "obligatorio", e.target.checked)}
                      className="rounded border-zinc-300 text-brand-primary focus:ring-brand-primary"
                    />
                    Obligatorio
                  </label>
                </div>
              ))}
            </div>
          </div>

          <input type="hidden" name="items" value={JSON.stringify(items)} />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending || items.length === 0 || !nombre}
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
