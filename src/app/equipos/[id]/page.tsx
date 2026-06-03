import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DeleteEquipoButton } from "../_components/DeleteEquipoButton";

export default async function EquipoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nombre")
    .eq("id", user.id)
    .single();

  const esAdmin = profile?.role === "administrador";

  if (profile?.role === "tecnico") redirect("/dashboard");

  const { data: equipo } = await supabase
    .from("equipos")
    .select("*, cliente:cliente_id(*)")
    .eq("id", id)
    .single();

  if (!equipo) redirect("/equipos");
  if (!esAdmin && equipo.cliente_id !== user.id) redirect("/equipos");

  const cliente = equipo.cliente as any;

  const { data: mantenimientos } = await supabase
    .from("mantenimientos")
    .select("id, tipo, fecha, estado, tecnico_nombre, created_at, visible_para_cliente")
    .eq("equipo_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-zinc-200/60 bg-white shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/equipos" className="text-sm text-zinc-500 hover:text-brand-primary">
            &larr; Volver a equipos
          </Link>
          {esAdmin && (
            <div className="flex gap-2">
              <Link
                href={`/equipos/${equipo.id}/editar`}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                Editar
              </Link>
              <DeleteEquipoButton id={equipo.id} nombre={equipo.nombre} />
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-brand-secondary">{equipo.nombre}</h2>
          {equipo.id_cliente && (
            <p className="text-sm text-zinc-400">ID cliente: {equipo.id_cliente}</p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-card">
            <h3 className="mb-4 text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Datos del equipo
            </h3>
            <dl className="space-y-3">
              <Item label="Tipo" value={equipo.tipo} />
              <Item label="Marca" value={equipo.marca} />
              <Item label="Modelo" value={equipo.modelo} />
              <Item label="Serie" value={equipo.serie} />
              <Item label="Ubicación" value={equipo.ubicacion} />
              <Item label="Accesorios" value={equipo.accesorios} />
            </dl>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-card">
            <h3 className="mb-4 text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Datos del cliente
            </h3>
            <dl className="space-y-3">
              <Item label="Nombre" value={cliente?.nombre} />
              <Item label="NIT" value={cliente?.nit} />
              <Item label="Dirección" value={cliente?.direccion} />
              <Item label="Ciudad" value={cliente?.ciudad} />
              <Item label="Correo" value={cliente?.email} />
              <Item label="Teléfono" value={cliente?.telefono} />
            </dl>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-card">
            <h3 className="mb-4 text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Mantenimiento
            </h3>
            <dl className="space-y-3">
              <Item
                label="Último mantenimiento"
                value={formatDate(equipo.fecha_ultimo_mantenimiento)}
              />
              <Item
                label="Próximo mantenimiento"
                value={formatDate(equipo.fecha_proximo_mantenimiento)}
                destacado
              />
              <Item
                label="Última calibración"
                value={formatDate(equipo.fecha_ultima_calibracion)}
              />
              <Item
                label="Próxima calibración"
                value={formatDate(equipo.fecha_proxima_calibracion)}
                destacado
              />
            </dl>
          </div>

          {esAdmin ? (
            <div className="rounded-xl bg-white p-5 shadow-card">
              <h3 className="mb-4 text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Acciones
              </h3>
              <div className="space-y-3">
                <Link
                  href={`/informes/nuevo`}
                  className="block rounded-lg bg-brand-primary/10 px-4 py-3 text-center text-sm font-medium text-brand-primary hover:bg-brand-primary/20"
                >
                  Generar informe
                </Link>
                <Link
                  href={`/informes?equipo_id=${equipo.id}`}
                  className="block rounded-lg bg-brand-secondary/10 px-4 py-3 text-center text-sm font-medium text-brand-secondary hover:bg-brand-secondary/20"
                >
                  Ver informes de este equipo
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-white p-5 shadow-card">
              <h3 className="mb-4 text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Informes
              </h3>
              <Link
                href={`/informes`}
                className="block rounded-lg bg-brand-primary/10 px-4 py-3 text-center text-sm font-medium text-brand-primary hover:bg-brand-primary/20"
              >
                Ver mis informes
              </Link>
            </div>
          )}
        </div>

        {/* Historial de mantenimientos */}
        {mantenimientos && mantenimientos.length > 0 && (
          <div className="mt-8 rounded-xl bg-white p-5 shadow-card">
            <h3 className="mb-4 text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Historial de mantenimientos
            </h3>
            <div className="space-y-2">
              {mantenimientos.map((m) => (
                <Link
                  key={m.id}
                  href={`/informes/${m.id}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 transition-colors hover:bg-zinc-50"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-secondary">
                      {m.tipo || "Mantenimiento"} — {m.fecha}
                    </p>
                    {m.tecnico_nombre && (
                      <p className="text-xs text-zinc-400">por {m.tecnico_nombre}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      m.estado === "completado" ? "bg-green-100 text-green-700"
                      : m.estado === "pendiente" ? "bg-yellow-100 text-yellow-700"
                      : "bg-zinc-100 text-zinc-500"
                    }`}>
                      {m.estado}
                    </span>
                    <svg className="h-4 w-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
            {(mantenimientos?.length ?? 0) >= 10 && (
              <Link
                href={`/informes?equipo_id=${equipo.id}`}
                className="mt-3 block text-center text-sm font-medium text-brand-primary hover:text-brand-primary-dark"
              >
                Ver todos los informes →
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Item({
  label,
  value,
  destacado,
}: {
  label: string;
  value?: string | null;
  destacado?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <dt className="text-sm text-zinc-400">{label}</dt>
      <dd
        className={`text-sm font-medium text-right max-w-[60%] ${
          destacado ? "text-brand-primary" : "text-zinc-700"
        }`}
      >
        {value || "—"}
      </dd>
    </div>
  );
}

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
