"use client";

export function FiltrosFacturas({
  filtroCliente,
  filtroEstado,
  clientes,
  esAdmin,
}: {
  filtroCliente: string;
  filtroEstado: string;
  clientes: { id: string; nombre: string }[];
  esAdmin: boolean;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {esAdmin && (
        <select
          value={filtroCliente}
          onChange={(e) => {
            const params = new URLSearchParams(window.location.search);
            params.set("cliente_id", e.target.value);
            window.location.search = params.toString();
          }}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
        >
          <option value="">Todos los clientes</option>
          {clientes.map((cl) => (
            <option key={cl.id} value={cl.id}>{cl.nombre}</option>
          ))}
        </select>
      )}
      <select
        value={filtroEstado}
        onChange={(e) => {
          const params = new URLSearchParams(window.location.search);
          if (e.target.value) params.set("estado", e.target.value);
          else params.delete("estado");
          window.location.search = params.toString();
        }}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-soft focus:border-brand-primary focus:outline-none"
      >
        <option value="">Todos los estados</option>
        <option value="emitida">Emitida</option>
        <option value="pagada">Pagada</option>
        <option value="anulada">Anulada</option>
      </select>
    </div>
  );
}
