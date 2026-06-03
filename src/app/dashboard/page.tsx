import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import { RecordatoriosButton } from "./_components/RecordatoriosButton";
import { hoyBogota, dentroDeDias } from "@/lib/date";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();

  const esAdmin = profile?.role === "administrador";
  const esTecnico = profile?.role === "tecnico";
  const esCliente = profile?.role === "cliente";

  // Queries paralelas para estadísticas
  let equiposQuery = supabase.from("equipos").select("*", { count: "exact", head: true });
  let mantenimientosQuery = supabase.from("mantenimientos").select("*", { count: "exact", head: true });
  let pendientesQuery = supabase.from("mantenimientos").select("*", { count: "exact", head: true }).eq("estado", "pendiente");
  let completadosQuery = supabase.from("mantenimientos").select("*", { count: "exact", head: true }).eq("estado", "completado");

  if (esCliente) {
    equiposQuery = equiposQuery.eq("cliente_id", user.id);
    const { data: equipos } = await supabase
      .from("equipos").select("id").eq("cliente_id", user.id);
    const equipoIds = equipos?.map(e => e.id) ?? [];
    mantenimientosQuery = mantenimientosQuery.in("equipo_id", equipoIds);
    pendientesQuery = pendientesQuery.in("equipo_id", equipoIds);
    completadosQuery = completadosQuery.in("equipo_id", equipoIds);
  } else if (esTecnico) {
    mantenimientosQuery = mantenimientosQuery.eq("tecnico_id", user.id);
    pendientesQuery = pendientesQuery.eq("tecnico_id", user.id);
    completadosQuery = completadosQuery.eq("tecnico_id", user.id);
  }

  const [
    { count: totalEquipos },
    { count: totalMant },
    { count: pendientes },
    { count: completados },
  ] = await Promise.all([
    equiposQuery,
    mantenimientosQuery,
    pendientesQuery,
    completadosQuery,
  ]);

  // Alertas: fechas en zona horaria Colombia
  const hoy = hoyBogota();
  const dentro30dias = dentroDeDias(30);

  let vencidosQuery = supabase
    .from("equipos")
    .select("id, nombre, cliente_id, fecha_proximo_mantenimiento", { count: "exact", head: true })
    .not("fecha_proximo_mantenimiento", "is", null)
    .lt("fecha_proximo_mantenimiento", hoy);

  let proximosQuery = supabase
    .from("equipos")
    .select("id", { count: "exact", head: true })
    .not("fecha_proximo_mantenimiento", "is", null)
    .gte("fecha_proximo_mantenimiento", hoy)
    .lte("fecha_proximo_mantenimiento", dentro30dias);

  let facturasImpagasQuery = supabase
    .from("facturas")
    .select("id", { count: "exact", head: true })
    .eq("estado", "emitida");

  if (esCliente) {
    vencidosQuery = vencidosQuery.eq("cliente_id", user.id);
    proximosQuery = proximosQuery.eq("cliente_id", user.id);
    facturasImpagasQuery = facturasImpagasQuery.eq("cliente_id", user.id);
  } else if (esTecnico) {
    vencidosQuery = vencidosQuery.eq("creado_por", user.id);
    proximosQuery = proximosQuery.eq("creado_por", user.id);
  }

  const [{ count: vencidos }, { count: proximos }, { count: facturasImpagas }] = await Promise.all([
    vencidosQuery,
    proximosQuery,
    facturasImpagasQuery,
  ]);

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-zinc-200/60 bg-white shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image src="/logo gestek.png" alt="Gestek" width={36} height={36} className="h-9 w-auto" />
            <span className="text-lg font-bold text-brand-secondary">GESTEK</span>
          </div>
          <nav className="flex items-center gap-5">
            {(esAdmin || esCliente) && (
              <a href="/equipos" className="text-sm font-medium text-zinc-500 hover:text-brand-primary transition-colors">Equipos</a>
            )}
            <a href="/informes" className="text-sm font-medium text-zinc-500 hover:text-brand-primary transition-colors">Informes</a>
            {esAdmin && (
              <>
                <a href="/clientes" className="text-sm font-medium text-zinc-500 hover:text-brand-primary transition-colors">Clientes</a>
                <a href="/facturas" className="text-sm font-medium text-zinc-500 hover:text-brand-primary transition-colors">Facturación</a>
                <a href="/plantillas" className="text-sm font-medium text-zinc-500 hover:text-brand-primary transition-colors">Plantillas</a>
                <a href="/empleados" className="text-sm font-medium text-zinc-500 hover:text-brand-primary transition-colors">Empleados</a>
              </>
            )}
            {esTecnico && (
              <a href="/informes/nuevo" className="text-sm font-medium text-brand-primary hover:text-brand-primary-dark transition-colors">Generar informe</a>
            )}
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">{profile?.nombre}</span>
            <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
              {esAdmin ? "Admin" : esTecnico ? "Técnico" : "Cliente"}
            </span>
            <form>
              <button
                type="submit"
                formAction={logout}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-soft transition-colors hover:bg-zinc-50"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-brand-secondary">Panel de control</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {esAdmin
              ? "Gestiona equipos, mantenimientos y facturación"
              : esTecnico
              ? "Genera informes de mantenimiento"
              : "Tus equipos biomédicos registrados"}
          </p>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid gap-6 sm:grid-cols-2">
          {(esAdmin || esTecnico) && (
            <div className="rounded-xl border border-zinc-200/60 bg-white p-6 shadow-card">
              <h3 className="text-sm font-medium text-zinc-400">Mantenimientos</h3>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-brand-secondary">{totalMant ?? 0}</span>
                <span className="text-sm text-green-600">{completados ?? 0} ok</span>
                <span className="text-sm text-amber-600">{pendientes ?? 0} pend.</span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">Completados y pendientes</p>
            </div>
          )}

          <a href={esCliente ? "/equipos" : esAdmin ? "/equipos" : "#"} className="block rounded-xl border border-zinc-200/60 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-card">
            <h3 className="text-sm font-medium text-zinc-400">Equipos</h3>
            <p className="mt-2 text-3xl font-bold text-brand-secondary">{totalEquipos ?? 0}</p>
            <p className="mt-1 text-xs text-zinc-400">Equipos biomédicos registrados</p>
          </a>

          <a href="/informes" className="block rounded-xl border border-zinc-200/60 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-card">
            <h3 className="text-sm font-medium text-zinc-400">Informes</h3>
            <p className="mt-2 text-3xl font-bold text-brand-secondary">{totalMant ?? 0}</p>
            <p className="mt-1 text-xs text-zinc-400">Informes generados</p>
          </a>
        </div>

        {/* Alertas */}
        {(vencidos ?? 0) > 0 || (proximos ?? 0) > 0 || (facturasImpagas ?? 0) > 0 ? (
          <div className="mt-8">
            <h3 className="mb-4 font-semibold text-brand-secondary">Alertas</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {(vencidos ?? 0) > 0 && (
                <a href="/equipos" className="block rounded-xl border border-red-200 bg-red-50 p-5 shadow-card transition-all hover:-translate-y-0.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-700">{vencidos}</p>
                      <p className="text-xs text-red-600">Mantenimiento{vencidos !== 1 ? "s" : ""} vencido{vencidos !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                </a>
              )}
              {(proximos ?? 0) > 0 && (
                <a href="/equipos" className="block rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-card transition-all hover:-translate-y-0.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                      <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-700">{proximos}</p>
                      <p className="text-xs text-amber-600">Vencen en 30 días</p>
                    </div>
                  </div>
                </a>
              )}
              {(facturasImpagas ?? 0) > 0 && esAdmin && (
                <a href="/facturas" className="block rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-card transition-all hover:-translate-y-0.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                      <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-700">{facturasImpagas}</p>
                      <p className="text-xs text-amber-600">Factura{facturasImpagas !== 1 ? "s" : ""} impaga{facturasImpagas !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>
        ) : null}

        {esAdmin && (
          <div className="mt-8">
            <h3 className="mb-4 font-semibold text-brand-secondary">Acciones rápidas</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ActionCard href="/clientes/nuevo" title="Nuevo cliente" description="Registrar una entidad o cliente" />
              <ActionCard href="/equipos/nuevo" title="Nuevo equipo" description="Registrar un equipo biomédico" />
              <ActionCard href="/informes/nuevo" title="Nuevo mantenimiento" description="Registrar intervención con informe" />
              <ActionCard href="/plantillas" title="Plantillas" description="Checklist personalizados por equipo" />
              <ActionCard href="/facturas/nueva" title="Nueva factura" description="Emitir una factura a un cliente" />
              <ActionCard href="/informes/nuevo" title="Generar informe" description="Crear PDF de equipo" />
              <RecordatoriosButton />
            </div>
          </div>
        )}

        {esTecnico && (
          <div className="mt-8">
            <h3 className="mb-4 font-semibold text-brand-secondary">Acciones rápidas</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ActionCard href="/informes/nuevo" title="Generar informe" description="Crear PDF de equipo" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ActionCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <a
      href={href}
      className="block rounded-xl border border-zinc-200/60 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-card"
    >
      <h4 className="font-medium text-brand-secondary">{title}</h4>
      <p className="mt-1 text-xs text-zinc-400">{description}</p>
    </a>
  );
}
