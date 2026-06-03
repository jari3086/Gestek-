"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarInforme } from "@/lib/actions/informes";
import { useConfirm } from "@/components/ConfirmDialog";

export function DeleteInformeButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { confirm } = useConfirm();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Eliminar informe",
      message: "¿Eliminar este informe? También se eliminarán el checklist y fotos asociados. Esta acción no se puede deshacer.",
    });
    if (!ok) return;
    setPending(true);
    setError(null);
    try {
      const result = await eliminarInforme(id);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || "Error al eliminar el informe");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar el informe");
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
        className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-600 shadow-soft transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "Eliminando..." : "Eliminar"}
      </button>
    </div>
  );
}
