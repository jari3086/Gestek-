import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DeleteEmpleadoButton } from "./_components/DeleteEmpleadoButton";

export default async function EmpleadosPage() {
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

  if (profile?.role !== "administrador") redirect("/dashboard");

  const { data: tecnicos } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "tecnico")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-zinc-200/60 bg-white shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Image src="/logo gestek.png" alt="Gestek" width={36} height={36} className="h-9 w-auto" />
            </Link>
            <span className="text-lg font-bold text-brand-secondary">GESTEK</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-brand-primary">
              Dashboard
            </Link>
            <span className="text-sm text-zinc-500">{profile.nombre}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-brand-secondary">Empleados técnicos</h2>
            <p className="text-zinc-500">{tecnicos?.length ?? 0} registrados</p>
          </div>
          <Link
            href="/empleados/nuevo"
            className="rounded-xl bg-brand-primary px-5 py-2.5 font-medium text-white shadow-soft hover:bg-brand-primary-dark"
          >
            + Nuevo técnico
          </Link>
        </div>

        {(!tecnicos || tecnicos.length === 0) ? (
          <div className="rounded-xl border border-zinc-200/60 bg-white p-12 text-center shadow-card">
            <p className="text-zinc-400">No hay técnicos registrados</p>
            <Link
              href="/empleados/nuevo"
              className="mt-4 inline-block rounded-lg bg-brand-primary px-6 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-primary/90"
            >
              Registrar primer técnico
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200/60 bg-white shadow-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 text-left text-sm text-zinc-500">
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">Correo</th>
                  <th className="px-5 py-3 font-medium">Registrado</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {tecnicos.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50"
                  >
                    <td className="px-5 py-4 font-medium text-brand-secondary">
                      {t.nombre}
                    </td>
                    <td className="px-5 py-4 text-zinc-600">{t.email}</td>
                    <td className="px-5 py-4 text-zinc-500 text-sm">
                      {new Date(t.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <DeleteEmpleadoButton id={t.id} nombre={t.nombre} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
