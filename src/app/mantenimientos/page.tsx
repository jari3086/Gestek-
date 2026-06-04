import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default async function MantenimientosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role, cliente_id").eq("id", user.id).single();

  let query = supabase
    .from("mantenimientos")
    .select("*, equipo:equipo_id(nombre, marca, serie)")
    .order("created_at", { ascending: false });

  if (profile?.role === "cliente") {
    query = query.in("equipo_id",
      supabase.from("equipos").select("id").eq("cliente_id", profile?.cliente_id || user.id) as any,
    );
  }

  const { data: mantenimientos } = await query.limit(100);

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <AppHeader links={[{ href: "/dashboard", label: "Dashboard" }]} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-brand-secondary">Mantenimientos</h2>
        {(!mantenimientos || mantenimientos.length === 0) ? (
          <div className="rounded-xl border border-zinc-200/60 bg-white p-12 text-center shadow-card">
            <p className="text-zinc-400">No hay mantenimientos registrados.</p>
            <Link href="/informes/nuevo" className="mt-4 inline-block rounded-lg bg-brand-primary px-6 py-3 text-sm font-medium text-white">+ Nuevo</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {mantenimientos.map((m) => (
              <div key={m.id} className="rounded-xl border border-zinc-200/60 bg-white p-5 shadow-card flex items-center justify-between">
                <div>
                  <p className="font-medium text-brand-secondary">
                    {m.equipo?.nombre || "—"} <span className="text-sm text-zinc-400 font-normal">— {m.tipo}</span>
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {m.equipo?.marca || "—"} · {m.fecha} · {m.tecnico_id?.slice(0,8)}...
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  m.estado === "completado" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {m.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
