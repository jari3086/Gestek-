import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EditarEquipoForm } from "./form";

export default async function EditarEquipoPage({
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
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "administrador") redirect("/equipos");

  const { data: equipo } = await supabase
    .from("equipos")
    .select("*")
    .eq("id", id)
    .single();

  if (!equipo) redirect("/equipos");

  const { data: clientes } = await supabase
    .from("profiles")
    .select("id, nombre")
    .eq("role", "cliente")
    .order("nombre");

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-zinc-200/60 bg-white shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
          <a
            href={`/equipos/${id}`}
            className="text-sm text-zinc-500 hover:text-brand-primary"
          >
            &larr; Volver al equipo
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-bold text-brand-secondary">
          Editar equipo
        </h2>
        <EditarEquipoForm equipo={equipo} clientes={clientes ?? []} />
      </main>
    </div>
  );
}
