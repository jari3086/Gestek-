"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarEquipo } from "@/lib/actions/equipos";
import { useConfirm } from "@/components/ConfirmDialog";

export function DeleteEquipoButton({ id, nombre }: { id: string; nombre: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { confirm } = useConfirm();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Eliminar equipo",
      message: `¿Eliminar "${nombre}" y todos sus mantenimientos asociados? Esta acción no se puede deshacer.`,
    });
    if (!ok) return;
    setPending(true);
    setError(null);
    try {
      await eliminarEquipo(id);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar el equipo");
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <button
        onClick={handleDelete}
        disabled={pending}
        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "Eliminando..." : "Eliminar"}
      </button>
    </div>
  );
}
