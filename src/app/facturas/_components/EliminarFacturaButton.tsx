"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarFactura } from "@/lib/actions/facturas";
import { useConfirm } from "@/components/ConfirmDialog";

export default function EliminarFacturaButton({ facturaId }: { facturaId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { confirm } = useConfirm();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Eliminar factura",
      message: "¿Eliminar esta factura? Esta acción no se puede deshacer.",
    });
    if (!ok) return;
    setPending(true);
    setError(null);
    try {
      await eliminarFactura(facturaId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar la factura");
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      {error && <p className="mb-1 text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
      >
        {pending ? "Eliminando..." : "Eliminar"}
      </button>
    </div>
  );
}
