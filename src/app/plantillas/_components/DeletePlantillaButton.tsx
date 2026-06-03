"use client";

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { eliminarPlantilla } from "@/lib/actions/plantillas";
import { useConfirm } from "@/components/ConfirmDialog";

export function DeletePlantillaForm({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { confirm } = useConfirm();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Eliminar plantilla",
      message: "¿Eliminar esta plantilla? Los informes que la usen no se verán afectados.",
    });
    if (!ok) return;
    startTransition(async () => {
      try {
        await eliminarPlantilla(id);
        router.refresh();
      } catch {
        alert("Error al eliminar la plantilla");
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
