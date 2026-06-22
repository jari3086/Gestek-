"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { crearTecnico } from "@/lib/actions/clientes";

export default function NuevoEmpleadoPage() {
  const [state, formAction, pending] = useActionState(crearTecnico, undefined);
  const [firmaUrl, setFirmaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFirma = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("La firma no puede superar los 2 MB"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "firmas");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setFirmaUrl(data.url);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-zinc-200/60 bg-white shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
          <a href="/empleados" className="text-sm text-zinc-500 hover:text-brand-primary">
            &larr; Volver a empleados
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-bold text-brand-secondary">Nuevo empleado técnico</h2>

        <form action={formAction} className="space-y-5 rounded-xl bg-white p-6 shadow-card">
          <input type="hidden" name="firma_url" value={firmaUrl} />

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

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-600">Firma del técnico</label>
              <div className="flex items-center gap-4">
                <input ref={fileRef} type="file" accept="image/*" onChange={uploadFirma} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                >
                  {uploading ? "Subiendo..." : "Subir firma"}
                </button>
                {firmaUrl && (
                  <div className="relative h-12 w-32 overflow-hidden rounded-lg border border-zinc-200">
                    <Image src={firmaUrl} alt="Firma" fill className="object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
            El técnico podrá generar informes de mantenimiento pero no gestionar clientes, equipos ni plantillas.
          </div>

          <div className="flex gap-3 pt-2">
            <a
              href="/empleados"
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
