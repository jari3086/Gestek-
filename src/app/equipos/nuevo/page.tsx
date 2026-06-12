import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EquipoForm } from "./form";

export default async function NuevoEquipoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "administrador") redirect("/equipos");

  const { data: clientes } = await supabase
    .from("profiles")
    .select("id, nombre")
    .eq("role", "cliente")
    .order("nombre");

  const { data: sedes } = await supabase
    .from("sedes")
    .select("id, cliente_id, nombre")
    .order("nombre");

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-zinc-200/60 bg-white shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
          <a href="/equipos" className="text-sm text-zinc-500 hover:text-brand-primary">
            &larr; Volver a equipos
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-bold text-brand-secondary">Nuevo equipo</h2>
        <EquipoForm clientes={clientes ?? []} sedes={sedes ?? []} />
      </main>
    </div>
  );
}
