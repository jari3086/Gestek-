import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DeleteClienteButton } from "./_components/DeleteClienteButton";
import { AppHeader } from "@/components/AppHeader";

export default async function ClientesPage(props: { searchParams?: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
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

  const letra = searchParams?.letra || "";
  let query = supabase
    .from("profiles")
    .select("*")
    .eq("role", "cliente")
    .order("nombre", { ascending: true });

  if (letra) {
    const nextLetra = String.fromCharCode(letra.charCodeAt(0) + 1);
    query = query.gte("nombre", letra).lt("nombre", nextLetra);
  }

  const { data: clientes } = await query;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <AppHeader links={[{ href: "/dashboard", label: "Inicio" }]} userNombre={profile?.nombre} userRole={profile?.role} />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-brand-secondary">Clientes</h2>
            <p className="text-zinc-500">{clientes?.length ?? 0} registrados</p>
          </div>
          <div className="flex gap-3">
          <Link
            href="/empleados"
            className="rounded-xl border border-brand-primary px-5 py-2.5 font-medium text-brand-primary hover:bg-brand-primary/5"
          >
            Técnicos
          </Link>
          <Link
            href="/clientes/nuevo"
            className="rounded-xl bg-brand-primary px-5 py-2.5 font-medium text-white shadow-soft hover:bg-brand-primary-dark"
          >
            + Nuevo cliente
          </Link>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-1.5">
          <Link
            href="/clientes"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              !letra ? "bg-brand-primary text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Todos
          </Link>
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
            <Link
              key={l}
              href={`/clientes?letra=${l}`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                letra === l ? "bg-brand-primary text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {l}
            </Link>
          ))}
        </div>

        {(!clientes || clientes.length === 0) ? (
          <div className="rounded-xl border border-zinc-200/60 bg-white p-12 text-center shadow-card">
            <p className="text-zinc-400">No hay clientes registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200/60 bg-white shadow-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 text-left text-sm text-zinc-500">
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">NIT</th>
                  <th className="px-5 py-3 font-medium">Correo</th>
                  <th className="px-5 py-3 font-medium">Ciudad</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50"
                  >
                    <td className="px-5 py-4 font-medium text-brand-secondary">
                      {c.nombre}
                    </td>
                    <td className="px-5 py-4 text-zinc-600">{c.nit || "—"}</td>
                    <td className="px-5 py-4 text-zinc-600">{c.email}</td>
                    <td className="px-5 py-4 text-zinc-600">{c.ciudad || "—"}</td>
                    <td className="px-5 py-4 text-right flex items-center justify-end gap-3">
                      <Link
                        href={`/clientes/${c.id}`}
                        className="text-sm font-medium text-brand-primary hover:text-brand-primary-dark"
                      >
                        Ver
                      </Link>
                      <DeleteClienteButton id={c.id} nombre={c.nombre} />
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

