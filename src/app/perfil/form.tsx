"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { actualizarPerfil } from "@/lib/actions/clientes";

export function PerfilForm({ profile }: { profile: { id: string; nombre: string; email: string; role: string; firma_url?: string | null } }) {
  const router = useRouter();
  const [nombre, setNombre] = useState(profile.nombre);
  const [firmaUrl, setFirmaUrl] = useState(profile.firma_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const fd = new FormData();
    fd.append("nombre", nombre);
    fd.append("firma_url", firmaUrl);

    const result = await actualizarPerfil(fd);
    if (result?.error) {
      setError(result.error);
    } else {
      setMessage("Perfil actualizado correctamente");
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white p-6 shadow-card">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      {message && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-600">Nombre</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-600">Correo electrónico</label>
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-600">
          {profile.email}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-600">Rol</label>
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm capitalize text-zinc-600">
          {profile.role === "administrador" ? "Administrador" : profile.role === "tecnico" ? "Técnico" : "Cliente"}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-600">Firma digital</label>
        <p className="mb-3 text-xs text-zinc-400">
          Esta firma estará disponible al generar o editar informes de servicio.
        </p>
        <div className="flex items-center gap-4">
          <input ref={fileRef} type="file" accept="image/*" onChange={uploadFirma} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
          >
            {uploading ? "Subiendo..." : firmaUrl ? "Cambiar firma" : "Subir firma"}
          </button>
          {firmaUrl && (
            <button
              type="button"
              onClick={() => setFirmaUrl("")}
              className="text-xs text-red-500 hover:underline"
            >
              Eliminar
            </button>
          )}
        </div>
        {firmaUrl && (
          <div className="mt-3 relative h-20 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <Image src={firmaUrl} alt="Firma" fill className="object-contain" />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <a
          href="/dashboard"
          className="rounded-xl border border-zinc-200 px-5 py-2.5 font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-brand-primary px-5 py-2.5 font-medium text-white shadow-soft hover:bg-brand-primary-dark disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
