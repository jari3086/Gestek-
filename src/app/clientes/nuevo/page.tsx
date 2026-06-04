"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { crearCliente } from "@/lib/actions/clientes";

export default function NuevoClientePage() {
  const [state, formAction, pending] = useActionState(crearCliente, undefined);
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("El logo no puede superar los 2 MB"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "logos");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setLogoUrl(data.url);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-zinc-200/60 bg-white shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
          <a href="/clientes" className="text-sm text-zinc-500 hover:text-brand-primary">
            &larr; Volver a clientes
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-bold text-brand-secondary">Nuevo cliente</h2>

        <form action={formAction} className="space-y-5 rounded-xl bg-white p-6 shadow-card">
          <input type="hidden" name="logo_url" value={logoUrl} />

          {state?.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Nombre / Razón social
              </label>
              <input
                name="nombre"
                required
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="Hospital Central SAS"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">NIT</label>
              <input
                name="nit"
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="123456789-0"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">Teléfono</label>
              <input
                name="telefono"
                type="tel"
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="+57 300 123 4567"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-600">Dirección</label>
              <input
                name="direccion"
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="Carrera 45 # 23-15"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">Ciudad</label>
              <input
                name="ciudad"
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="Bogotá"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">Departamento</label>
              <input
                name="departamento"
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="Cundinamarca"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">Código postal</label>
              <input
                name="codigo_postal"
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="110111"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">Régimen</label>
              <select
                name="regimen"
                defaultValue="comun"
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="comun">Común</option>
                <option value="simplificado">Simplificado</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">Tipo persona</label>
              <select
                name="tipo_persona"
                defaultValue="juridica"
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="juridica">Jurídica</option>
                <option value="natural">Natural</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-600">Logo del cliente</label>
              <div className="flex items-center gap-4">
                <input ref={fileRef} type="file" accept="image/*,.heic,.heif,.heics,.heifs,.dng" onChange={uploadLogo} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                >
                  {uploading ? "Subiendo..." : "Subir logo"}
                </button>
                {logoUrl && (
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-zinc-200">
                    <Image src={logoUrl} alt="Logo" fill className="object-contain" />
                  </div>
                )}
              </div>
            </div>

            <div className="sm:col-span-2 border-t border-zinc-100 pt-4">
              <p className="mb-3 text-sm font-medium text-zinc-500">
                Credenciales de acceso
              </p>
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
                placeholder="cliente@hospital.com"
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
          </div>

          <div className="flex gap-3 pt-2">
            <a
              href="/clientes"
              className="rounded-xl border border-zinc-200 px-5 py-2.5 font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              Cancelar
            </a>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-brand-primary px-5 py-2.5 font-medium text-white shadow-soft hover:bg-brand-primary-dark disabled:opacity-50"
            >
              {pending ? "Creando..." : "Crear cliente"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
