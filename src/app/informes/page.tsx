import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { FiltrosAdminInformes } from "./_components/FiltrosAdminInformes";
import { FiltrosClienteInformes } from "./_components/FiltrosClienteInformes";
import { ExportCsvButton } from "@/components/ExportCsvButton";

export default async function InformesListPage(props: { searchParams?: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role, nombre").eq("id", user.id).single();

  const esAdmin = profile?.role === "administrador";
  const esTecnico = profile?.role === "tecnico";
  const esCliente = profile?.role === "cliente";

  let query = supabase
    .from("mantenimientos")
    .select("*, equipo:equipo_id!inner(nombre, serie, marca, cliente_id, sede_id)")
    .order("created_at", { ascending: false });

  if (searchParams?.equipo_id) {
    query = query.eq("equipo_id", searchParams.equipo_id);
  } else if (searchParams?.cliente_id && esAdmin) {
    query = query.eq("equipo.cliente_id", searchParams.cliente_id);
  }

  if (searchParams?.sede_id) {
    query = query.eq("equipo.sede_id", searchParams.sede_id);
  }

  if (searchParams?.fecha_inicio) {
    query = query.gte("fecha", searchParams.fecha_inicio);
  }
  if (searchParams?.fecha_fin) {
    query = query.lte("fecha", searchParams.fecha_fin);
  }

  if (searchParams?.tecnico_id && esAdmin) {
    query = query.eq("tecnico_id", searchParams.tecnico_id);
  }

  if (esCliente) {
    query = query.eq("visible_para_cliente", true);
  } else if (esTecnico) {
    query = query.eq("tecnico_id", user.id);
  }

  const { data: mantenimientos } = await query.limit(100);

  // Para clientes, obtener sus equipos y sedes para los filtros
  let equiposCliente: any[] = [];
  let sedesCliente: any[] = [];
  if (esCliente) {
    const { data: eqs } = await supabase
      .from("equipos")
      .select("id, nombre, marca, modelo")
      .eq("cliente_id", user.id)
      .order("nombre");
    equiposCliente = eqs || [];

    const { data: sds } = await supabase
      .from("sedes")
      .select("id, nombre")
      .eq("cliente_id", user.id)
      .order("nombre");
    sedesCliente = sds || [];
  }

  // Para admin, obtener datos para filtros
  let tecnicos: { id: string; nombre: string }[] = [];
  let clientes: { id: string; nombre: string }[] = [];
  let equipos: { id: string; nombre: string }[] = [];
  if (esAdmin) {
    const { data: tec } = await supabase
      .from("profiles")
      .select("id, nombre")
      .eq("role", "tecnico")
      .order("nombre");
    tecnicos = tec || [];

    const { data: cl } = await supabase
      .from("profiles")
      .select("id, nombre")
      .eq("role", "cliente")
      .order("nombre");
    clientes = cl || [];

    let equiposQuery = supabase.from("equipos").select("id, nombre").order("nombre");
    if (searchParams?.cliente_id) {
      equiposQuery = equiposQuery.eq("cliente_id", searchParams.cliente_id);
    }
    const { data: eq } = await equiposQuery;
    equipos = eq || [];
  }

  const equipoSeleccionado = searchParams?.equipo_id || "";

  const navLinks = [
    { href: "/dashboard", label: "Inicio" },
    ...(esAdmin || esTecnico ? [{ href: "/informes/nuevo", label: "+ Nuevo informe", highlight: true as const }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <AppHeader
        links={navLinks}
        userNombre={profile?.nombre}
        userRole={profile?.role}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-brand-secondary">Informes generados</h2>
          {mantenimientos && mantenimientos.length > 0 && (
            <ExportCsvButton
              rows={mantenimientos.map((m) => ({
                Equipo: (m as any).equipo?.nombre || "",
                Tipo: m.tipo,
                Fecha: m.fecha,
                Estado: m.estado,
                "Técnico": (m as any).tecnico_nombre || "",
                Serie: (m as any).equipo?.serie || "",
              }))}
              filename="informes"
            />
          )}
          {esCliente && equiposCliente.length > 0 && (
            <FiltrosClienteInformes
              defaultValue={equipoSeleccionado}
              equipos={equiposCliente}
              sedes={sedesCliente}
            />
          )}
          {esAdmin && (
            <FiltrosAdminInformes
              tecnicos={tecnicos}
              clientes={clientes}
              equipos={equipos}
            />
          )}
        </div>

        {(!mantenimientos || mantenimientos.length === 0) ? (
          <div className="rounded-xl border border-zinc-200/60 bg-white p-12 text-center shadow-card">
            <p className="text-zinc-400">No hay informes generados aún.</p>
            {(esAdmin || esTecnico) && (
              <Link href="/informes/nuevo" className="mt-4 inline-block rounded-lg bg-brand-primary px-6 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-primary/90">
                Generar primer informe
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {mantenimientos.map((m) => (
              <Link
                key={m.id}
                href={`/informes/${m.id}`}
                className="block rounded-xl border border-zinc-200/60 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-brand-secondary">
                      {m.equipo?.nombre || "Equipo"} <span className="text-sm text-zinc-400 font-normal">— {m.tipo}</span>
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {m.equipo?.marca || "—"} · Serie: {m.equipo?.serie || "—"} · {m.fecha}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      m.estado === "completado" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {m.estado}
                    </span>
                    {!esAdmin && !esTecnico && !m.visible_para_cliente && (
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-400">
                        Oculto
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
