import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SedeForm } from "../../nueva/form";

export default async function EditarSedePage({
  params,
}: {
  params: Promise<{ id: string; sedeId: string }>;
}) {
  const { id: clienteId, sedeId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "administrador") redirect("/dashboard");

  const { data: sede } = await supabase
    .from("sedes").select("*").eq("id", sedeId).single();
  if (!sede) redirect(`/clientes/${clienteId}/sedes`);

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-zinc-200/60 bg-white shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
          <a
            href={`/clientes/${clienteId}/sedes`}
            className="text-sm text-zinc-500 hover:text-brand-primary"
          >
            &larr; Volver a sedes
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-bold text-brand-secondary">Editar sede: {sede.nombre}</h2>
        <SedeForm clienteId={clienteId} sede={sede} />
      </main>
    </div>
  );
}
