"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { actualizarTecnico } from "@/lib/actions/clientes";

export function EditarEmpleadoForm({ empleado }: { empleado: { id: string; nombre: string; email: string; firma_url?: string | null } }) {
  const router = useRouter();
  const [firmaUrl, setFirmaUrl] = useState(empleado.firma_url || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
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

    const fd = new FormData();
    fd.append("id", empleado.id);
    fd.append("nombre", empleado.nombre);
    fd.append("firma_url", firmaUrl);

    const result = await actualizarTecnico(fd);
    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/empleados");
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white p-6 shadow-card">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-600">Nombre</label>
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-600">
          {empleado.nombre}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-600">Correo electrónico</label>
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-600">
          {empleado.email}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-600">Firma del técnico</label>
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
          <div className="mt-3 relative h-16 w-40 overflow-hidden rounded-lg border border-zinc-200">
            <Image src={firmaUrl} alt="Firma" fill className="object-contain" />
          </div>
        )}
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
          disabled={saving}
          className="rounded-xl bg-brand-primary px-5 py-2.5 font-medium text-white shadow-soft hover:bg-brand-primary-dark disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
