import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DeletePlantillaForm } from "./_components/DeletePlantillaButton";
import { AppHeader } from "@/components/AppHeader";

export default async function PlantillasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role, nombre").eq("id", user.id).single();

  if (profile?.role !== "administrador") redirect("/dashboard");

  const { data: plantillas } = await supabase
    .from("plantillas")
    .select("*")
    .order("nombre");

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <AppHeader links={[{ href: "/dashboard", label: "Inicio" }, { href: "/informes", label: "Informes" }]} userNombre={profile?.nombre} userRole={profile?.role} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-secondary">Plantillas de checklist</h2>
          <Link
            href="/plantillas/nueva"
            className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-primary/90"
          >
            + Nueva plantilla
          </Link>
        </div>

        {(!plantillas || plantillas.length === 0) ? (
          <div className="rounded-xl border border-zinc-200/60 bg-white p-12 text-center shadow-card">
            <p className="text-zinc-400">No hay plantillas aún.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plantillas.map((p) => (
              <div key={p.id} className="rounded-xl border border-zinc-200/60 bg-white p-5 shadow-card">
                <h3 className="font-semibold text-brand-secondary">{p.nombre}</h3>
                {p.descripcion && (
                  <p className="mt-1 text-xs text-zinc-400">{p.descripcion}</p>
                )}
                <p className="mt-2 text-xs text-zinc-500">
                  {(p.items as any[])?.length || 0} ítems
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/plantillas/${p.id}`}
                    className="rounded-lg bg-brand-primary px-4 py-2 text-xs font-medium text-white transition-all hover:bg-brand-primary/90"
                  >
                    Editar
                  </Link>
                  <DeletePlantillaForm id={p.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
