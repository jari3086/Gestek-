import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SedesListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string>>;
}) {
  const { id: clienteId } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "administrador") redirect("/dashboard");

  const { data: cliente } = await supabase
    .from("profiles").select("id, nombre").eq("id", clienteId).single();
  if (!cliente) redirect("/clientes");

  const { data: sedes } = await supabase
    .from("sedes")
    .select("id, nombre, direccion, ciudad, telefono")
    .eq("cliente_id", clienteId)
    .order("nombre");

  const sedeActiva = sp?.sede_id || "";

  // Obtener conteo de equipos por sede
  const { data: equipos } = await supabase
    .from("equipos")
    .select("id, sede_id, nombre")
    .eq("cliente_id", clienteId);

  const equiposPorSede: Record<string, number> = {};
  for (const eq of equipos || []) {
    const sid = eq.sede_id || "sin-sede";
    equiposPorSede[sid] = (equiposPorSede[sid] || 0) + 1;
  }

  // Equipos de la sede activa
  const equiposSede = sedeActiva
    ? (equipos || []).filter(e => e.sede_id === sedeActiva)
    : [];

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-zinc-200/60 bg-white shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
          <Link href={`/clientes/${clienteId}`} className="text-sm text-zinc-500 hover:text-brand-primary">
            &larr; Volver a {cliente.nombre}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-brand-secondary">Sedes de {cliente.nombre}</h2>
            <p className="text-zinc-500">{sedes?.length || 0} sedes registradas</p>
          </div>
          <Link
            href={`/clientes/${clienteId}/sedes/nueva`}
            className="rounded-xl bg-brand-primary px-5 py-2.5 font-medium text-white shadow-soft hover:bg-brand-primary/90"
          >
            + Nueva sede
          </Link>
        </div>

        {(!sedes || sedes.length === 0) ? (
          <div className="rounded-xl border border-zinc-200/60 bg-white p-12 text-center shadow-card">
            <p className="text-zinc-400">No hay sedes registradas para este cliente.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sedes.map((sede) => {
              const totalEq = equiposPorSede[sede.id] || 0;
              return (
                <div key={sede.id} className="rounded-xl border border-zinc-200/60 bg-white p-5 shadow-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-brand-secondary">{sede.nombre}</h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        {sede.direccion || "—"} {sede.ciudad ? `· ${sede.ciudad}` : ""}
                      </p>
                      {sede.telefono && (
                        <p className="text-sm text-zinc-400">{sede.telefono}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                        {totalEq} equipos
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-3">
                    <Link
                      href={`/equipos?cliente_id=${clienteId}&sede_id=${sede.id}`}
                      className="text-sm font-medium text-brand-primary hover:text-brand-primary-dark"
                    >
                      Ver equipos &rarr;
                    </Link>
                    <Link
                      href={`/informes?cliente_id=${clienteId}&equipo_sede_id=${sede.id}`}
                      className="text-sm font-medium text-brand-primary hover:text-brand-primary-dark"
                    >
                      Ver informes &rarr;
                    </Link>
                    <Link
                      href={`/clientes/${clienteId}/sedes/${sede.id}/editar`}
                      className="text-sm font-medium text-zinc-500 hover:text-zinc-700"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
