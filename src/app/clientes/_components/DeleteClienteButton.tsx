"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarCliente } from "@/lib/actions/clientes";
import { useConfirm } from "@/components/ConfirmDialog";

export function DeleteClienteButton({ id, nombre }: { id: string; nombre: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { confirm } = useConfirm();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Eliminar cliente",
      message: `¿Eliminar al cliente "${nombre}" y todos sus equipos? Esta acción no se puede deshacer.`,
    });
    if (!ok) return;
    setPending(true);
    setError(null);
    try {
      await eliminarCliente(id);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar el cliente");
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
        className="text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
      >
        {pending ? "Eliminando..." : "Eliminar"}
      </button>
    </div>
  );
}
