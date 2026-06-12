import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ClienteDetallePage({
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
  if (profile?.role !== "administrador") redirect("/dashboard");

  const { data: cliente } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  if (!cliente) redirect("/clientes");

  const { count: equiposCount } = await supabase
    .from("equipos")
    .select("*", { count: "exact", head: true })
    .eq("cliente_id", id);

  const { data: sedes } = await supabase
    .from("sedes")
    .select("id, nombre")
    .eq("cliente_id", id)
    .order("nombre");

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-zinc-200/60 bg-white shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/clientes" className="text-sm text-zinc-500 hover:text-brand-primary">
            &larr; Volver a clientes
          </Link>
          <div className="flex gap-2">
            <Link
              href={`/clientes/${cliente.id}/editar`}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              Editar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-brand-secondary">{cliente.nombre}</h2>
          <p className="text-zinc-500">{cliente.email}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-card">
            <h3 className="mb-4 text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Información
            </h3>
            <dl className="space-y-3">
              <Item label="Nombre" value={cliente.nombre} />
              <Item label="NIT" value={cliente.nit} />
              <Item label="Dirección" value={cliente.direccion} />
              <Item label="Ciudad" value={cliente.ciudad} />
              <Item label="Departamento" value={cliente.departamento} />
              <Item label="Teléfono" value={cliente.telefono} />
              <Item label="Correo" value={cliente.email} />
              <Item label="Régimen" value={cliente.regimen} />
              <Item label="Tipo persona" value={cliente.tipo_persona} />
              <Item label="Código postal" value={cliente.codigo_postal} />
            </dl>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-card">
            <h3 className="mb-4 text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Resumen
            </h3>
            <p className="text-3xl font-bold text-brand-secondary">{equiposCount ?? 0}</p>
            <p className="text-sm text-zinc-500">equipos registrados</p>
            <Link
              href={`/equipos?cliente_id=${cliente.id}`}
              className="mt-4 inline-block text-sm font-medium text-brand-primary hover:text-brand-primary-dark"
            >
              Ver sus equipos &rarr;
            </Link>
          </div>
        </div>

        {/* Sedes */}
        <div className="mt-8 rounded-xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Sedes / Sucursales
            </h3>
            <Link
              href={`/clientes/${cliente.id}/sedes/nueva`}
              className="rounded-lg bg-brand-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-primary/90"
            >
              + Nueva sede
            </Link>
          </div>

          {(!sedes || sedes.length === 0) ? (
            <p className="text-sm text-zinc-400">Este cliente no tiene sedes registradas.</p>
          ) : (
            <div className="space-y-2">
              {sedes.map((sede) => (
                <Link
                  key={sede.id}
                  href={`/clientes/${cliente.id}/sedes`}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 text-sm hover:bg-zinc-50"
                >
                  <span className="font-medium text-brand-secondary">{sede.nombre}</span>
                  <span className="text-brand-primary text-xs">Ver equipos &rarr;</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Item({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between">
      <dt className="text-sm text-zinc-400">{label}</dt>
      <dd className="text-sm font-medium text-zinc-700 text-right max-w-[60%]">
        {value || "—"}
      </dd>
    </div>
  );
}
