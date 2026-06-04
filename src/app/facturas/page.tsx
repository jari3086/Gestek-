import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import CambiarEstadoFactura from "./_components/CambiarEstadoFactura";
import EliminarFacturaButton from "./_components/EliminarFacturaButton";
import { EnviarFacturaEmailButton } from "./_components/EnviarFacturaEmailButton";
import { FiltrosFacturas } from "./_components/FiltrosFacturas";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import { AppHeader } from "@/components/AppHeader";

export default async function FacturasPage(props: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role, nombre").eq("id", user.id).single();

  const esAdmin = profile?.role === "administrador";
  const esCliente = profile?.role === "cliente";

  // Filtros
  const filtroEstado = searchParams?.estado || "";
  const filtroCliente = searchParams?.cliente_id || "";

  let query = supabase
    .from("facturas")
    .select("*, cliente:cliente_id(nombre)")
    .order("created_at", { ascending: false });

  if (esCliente) {
    query = query.eq("cliente_id", user.id);
  }

  if (filtroEstado) {
    query = query.eq("estado", filtroEstado);
  }

  if (filtroCliente && esAdmin) {
    query = query.eq("cliente_id", filtroCliente);
  }

  const { data: facturas } = await query.limit(200);

  // Datos para filtros (admin)
  let clientes: { id: string; nombre: string }[] = [];
  if (esAdmin) {
    const { data: cls } = await supabase
      .from("profiles")
      .select("id, nombre")
      .eq("role", "cliente")
      .order("nombre");
    clientes = cls || [];
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <AppHeader links={[{ href: "/dashboard", label: "Dashboard" }]} userNombre={profile?.nombre} userRole={profile?.role} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-brand-secondary">Facturación</h2>
          {facturas && facturas.length > 0 && (
            <ExportCsvButton
              rows={facturas.map((f) => ({
                ID: f.id?.slice(0, 8).toUpperCase(),
                Cliente: (f.cliente as any)?.nombre || "",
                Subtotal: Number(f.subtotal ?? f.monto),
                IVA: Number(f.total_iva ?? 0),
                Retenciones: Number(f.retencion_fuente ?? 0) + Number(f.retencion_iva ?? 0) + Number(f.retencion_ica ?? 0),
                Total: Number(f.total ?? f.monto),
                Fecha: f.fecha,
                Estado: f.estado,
                "Est. DIAN": f.estado_dian || "",
                CUFE: f.cufe || "",
              }))}
              filename="facturas"
            />
          )}
        </div>

        {(esAdmin || (facturas && facturas.length > 5)) && (
          <FiltrosFacturas filtroCliente={filtroCliente} filtroEstado={filtroEstado} clientes={clientes} esAdmin={esAdmin} />
        )}

        {(!facturas || facturas.length === 0) ? (
          <div className="rounded-xl border border-zinc-200/60 bg-white p-12 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <p className="text-zinc-500 font-medium">No hay facturas</p>
            <p className="mt-1 text-sm text-zinc-400">
              {filtroEstado || filtroCliente
                ? "Ninguna factura coincide con los filtros seleccionados"
                : "Aún no se han emitido facturas"}
            </p>
            {esAdmin && !filtroEstado && !filtroCliente && (
              <Link href="/facturas/nueva" className="mt-6 inline-block rounded-xl bg-brand-primary px-6 py-3 font-medium text-white shadow-soft transition-colors hover:bg-brand-primary-dark">
                Crear primera factura
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {facturas.map((f) => (
              <div key={f.id} className="rounded-xl border border-zinc-200/60 bg-white p-5 shadow-card flex items-center justify-between">
                <div>
                  <p className="font-medium text-brand-secondary">Factura #{f.id?.slice(0,8).toUpperCase()}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {f.cliente?.nombre || "—"} · ${Number(f.monto).toLocaleString("es-CO")}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {f.prefijo && f.numero_consecutivo && (
                      <span className="text-xs text-zinc-400">{f.prefijo}-{f.numero_consecutivo}</span>
                    )}
                    {f.cufe && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600 font-mono" title={f.cufe}>
                        CUFE ✓
                      </span>
                    )}
                    {f.estado_dian && f.estado_dian !== "pendiente" && (
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        f.estado_dian === "aceptada" ? "bg-green-50 text-green-600"
                        : f.estado_dian === "rechazada" ? "bg-red-50 text-red-600"
                        : "bg-yellow-50 text-yellow-600"
                      }`}>
                        DIAN: {f.estado_dian}
                      </span>
                    )}
                    {f.forma_pago === "credito" && (
                      <span className="text-xs text-zinc-400">Crédito</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {esAdmin ? (
                    <>
                      <CambiarEstadoFactura facturaId={f.id} estadoActual={f.estado} />
                      <EnviarFacturaEmailButton facturaId={f.id} />
                    </>
                  ) : (
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      f.estado === "pagada" ? "bg-green-100 text-green-700"
                      : f.estado === "anulada" ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {f.estado}
                    </span>
                  )}
                  {esAdmin && <EliminarFacturaButton facturaId={f.id} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
