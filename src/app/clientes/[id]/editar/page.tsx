"use client";

import Image from "next/image";
import { use, useActionState, useEffect, useRef, useState } from "react";
import { actualizarCliente } from "@/lib/actions/clientes";

export default function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [state, formAction, pending] = useActionState(actualizarCliente, undefined);
  const [cliente, setCliente] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/clientes?id=${id}`)
      .then(r => r.json())
      .then(data => {
        const c = Array.isArray(data) ? data[0] : data;
        setCliente(c);
        setLogoUrl(c?.logo_url || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

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
          <a href={`/clientes/${id}`} className="text-sm text-zinc-500 hover:text-brand-primary">
            &larr; Volver
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-bold text-brand-secondary">Editar cliente</h2>

        {loading ? (
          <div className="text-center text-zinc-400 py-12">Cargando datos del cliente...</div>
        ) : (
          <form action={formAction} className="space-y-5 rounded-xl bg-white p-6 shadow-card">
            <input type="hidden" name="id" value={id} />
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
                  id="nombre"
                  required
                  defaultValue={cliente?.nombre || ""}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-600">NIT</label>
                <input
                  name="nit"
                  id="nit"
                  defaultValue={cliente?.nit || ""}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-600">Teléfono</label>
                <input
                  name="telefono"
                  id="telefono"
                  type="tel"
                  defaultValue={cliente?.telefono || ""}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-600">Dirección</label>
                <input
                  name="direccion"
                  id="direccion"
                  defaultValue={cliente?.direccion || ""}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-600">Ciudad</label>
                <input
                  name="ciudad"
                  id="ciudad"
                  defaultValue={cliente?.ciudad || ""}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-600">Logo del cliente</label>
                <div className="flex items-center gap-4">
                  <input ref={fileRef} type="file" accept="image/*" onChange={uploadLogo} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                  >
                    {uploading ? "Subiendo..." : "Cambiar logo"}
                  </button>
                  {logoUrl && (
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-zinc-200">
                      <Image src={logoUrl} alt="Logo" fill className="object-contain" />
                    </div>
                  )}
                  {logoUrl && (
                    <button type="button" onClick={() => setLogoUrl("")} className="text-xs text-red-500 hover:underline">
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={`/clientes/${id}`}
                className="rounded-xl border border-zinc-200 px-5 py-2.5 font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                Cancelar
              </a>
              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-brand-primary px-5 py-2.5 font-medium text-white shadow-soft hover:bg-brand-primary-dark disabled:opacity-50"
              >
                {pending ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
