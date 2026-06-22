import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { ToggleVisibilidad } from "../_components/ToggleVisibilidad";
import { EnviarEmail } from "../_components/EnviarEmail";
import { EditarInformeForm } from "../_components/EditarInformeForm";
import { DeleteInformeButton } from "../_components/DeleteInformeButton";

export default async function InformeDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role, nombre, firma_url").eq("id", user.id).single();

  const esAdmin = profile?.role === "administrador";
  const esTecnico = profile?.role === "tecnico";
  const esCliente = profile?.role === "cliente";

  const { data: mant } = await supabase
    .from("mantenimientos")
    .select("*, equipo:equipo_id(*, cliente:cliente_id(*))")
    .eq("id", id)
    .single();

  if (!mant) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="rounded-xl border border-zinc-200/60 bg-white p-10 shadow-card text-center max-w-md">
          <h2 className="text-xl font-bold text-brand-secondary">Informe no encontrado</h2>
          <p className="mt-2 text-sm text-zinc-500">El informe que buscas no existe o no tienes acceso.</p>
          <Link href="/informes" className="mt-6 inline-block rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium text-white">
            Volver a informes
          </Link>
        </div>
      </div>
    );
  }

  const [checklistResult, fotosResult] = await Promise.all([
    supabase
      .from("checklist_resultados")
      .select("resultados")
      .eq("mantenimiento_id", id)
      .maybeSingle(),
    supabase
      .from("fotos_mantenimiento")
      .select("url")
      .eq("mantenimiento_id", id),
  ]);

  const checklist = (checklistResult?.data?.resultados as any[]) || [];
  const fotos = fotosResult?.data?.map((f) => f.url) || [];

  type EquipoData = Record<string, string | null | undefined> & { cliente?: Record<string, string | null | undefined> };
  const equipo = mant.equipo as EquipoData;
  const cliente = equipo?.cliente as Record<string, string | null | undefined> | undefined;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <AppHeader
        links={[
          { href: "/dashboard", label: "Inicio" },
          { href: "/informes", label: "Informes" },
        ]}
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-secondary">Informe de servicio</h2>
            <p className="mt-1 text-sm text-zinc-500">{mant.tipo} · {mant.fecha}</p>
          </div>
          <div className="flex items-center gap-3">
            {mant.pdf_url && (esAdmin || (esCliente && mant.visible_para_cliente)) && (
              <a
                href={mant.pdf_url}
                target="_blank"
                className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-primary/90"
              >
                {esCliente ? "Ver PDF" : "Descargar PDF"}
              </a>
            )}
            {(esAdmin || esTecnico) && (
              <Link
                href="/informes/nuevo"
                className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-600 shadow-soft transition-colors hover:bg-zinc-50"
              >
                Nuevo informe
              </Link>
            )}
          </div>
        </div>

        {/* Datos del equipo y cliente */}
        <div className="mb-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200/60 bg-white p-5 shadow-card">
            <h3 className="mb-3 font-semibold text-brand-secondary">Equipo</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-zinc-400">Nombre:</span> <span className="text-zinc-700">{equipo?.nombre || "—"}</span></p>
              <p><span className="text-zinc-400">Marca:</span> <span className="text-zinc-700">{equipo?.marca || "—"}</span></p>
              <p><span className="text-zinc-400">Modelo:</span> <span className="text-zinc-700">{equipo?.modelo || "—"}</span></p>
              <p><span className="text-zinc-400">Serie:</span> <span className="text-zinc-700">{equipo?.serie || "—"}</span></p>
              <p><span className="text-zinc-400">Ubicación:</span> <span className="text-zinc-700">{equipo?.ubicacion || "—"}</span></p>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200/60 bg-white p-5 shadow-card">
            <h3 className="mb-3 font-semibold text-brand-secondary">Cliente</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-zinc-400">Nombre:</span> <span className="text-zinc-700">{cliente?.nombre || "—"}</span></p>
              <p><span className="text-zinc-400">NIT:</span> <span className="text-zinc-700">{cliente?.nit || "—"}</span></p>
              <p><span className="text-zinc-400">Dirección:</span> <span className="text-zinc-700">{cliente?.direccion || "—"}</span></p>
              <p><span className="text-zinc-400">Email:</span> <span className="text-zinc-700">{cliente?.email || "—"}</span></p>
            </div>
          </div>
        </div>

        {/* Acciones para administrador */}
        {esAdmin && (
          <>
            <div className="mb-6 rounded-xl border border-zinc-200/60 bg-white p-5 shadow-card">
              <h3 className="mb-4 font-semibold text-brand-secondary">Acciones</h3>
              <div className="flex flex-wrap gap-4">
                <ToggleVisibilidad id={id} visible={mant.visible_para_cliente ?? false} />
                <EnviarEmail id={id} />
                <DeleteInformeButton id={id} />
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200/60 bg-white p-5 shadow-card">
              <h3 className="mb-4 font-semibold text-brand-secondary">Editar informe completo</h3>
              <p className="mb-4 text-xs text-zinc-400">Puedes modificar todos los campos del informe, incluyendo la lista de chequeo, fotos y firmas.</p>
              <EditarInformeForm
                id={id}
                tipo={mant.tipo || ""}
                fecha={mant.fecha || ""}
                observaciones={mant.observaciones || ""}
                conclusion={mant.conclusion || ""}
                orden_servicio={mant.orden_servicio || ""}
                numero_informe={mant.numero_informe || ""}
                tecnico_nombre={mant.tecnico_nombre || ""}
                aprobador_nombre={mant.aprobador_nombre || ""}
                firma_tecnico={mant.firma_tecnico || undefined}
                firma_aprobador={mant.firma_aprobador || undefined}
                firma_recibe={mant.firma_recibe || undefined}
                proximo_mantenimiento={equipo?.fecha_proximo_mantenimiento || ""}
                proxima_calibracion={equipo?.fecha_proxima_calibracion || ""}
                checklist={checklist}
                fotos={fotos}
                equipoNombre={equipo?.nombre || ""}
                tecnicoFirmaUrl={profile?.firma_url}
                tecnicoNombre={profile?.nombre}
              />
            </div>
          </>
        )}

        {/* Información adicional para cliente y técnico */}
        {!esAdmin && (
          <div className="rounded-xl border border-zinc-200/60 bg-white p-5 shadow-card">
            <h3 className="mb-3 font-semibold text-brand-secondary">Resumen del servicio</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-zinc-400">Tipo:</span> <span className="text-zinc-700">{mant.tipo}</span></p>
              <p><span className="text-zinc-400">Fecha:</span> <span className="text-zinc-700">{mant.fecha}</span></p>
              {mant.tecnico_nombre && (
                <p><span className="text-zinc-400">Profesional:</span> <span className="text-zinc-700">{mant.tecnico_nombre}</span></p>
              )}
              {mant.orden_servicio && (
                <p><span className="text-zinc-400">Orden de servicio:</span> <span className="text-zinc-700">{mant.orden_servicio}</span></p>
              )}
              {mant.numero_informe && (
                <p><span className="text-zinc-400">N° de informe:</span> <span className="text-zinc-700">{mant.numero_informe}</span></p>
              )}
              {mant.observaciones && (
                <div className="mt-3 rounded-lg bg-[#f8fafc] p-4">
                  <p className="mb-1 text-xs font-medium text-zinc-500">Observaciones</p>
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">{mant.observaciones}</p>
                </div>
              )}
              {mant.conclusion && (
                <div className="mt-2 rounded-lg bg-[#f8fafc] p-4">
                  <p className="mb-1 text-xs font-medium text-zinc-500">Conclusión</p>
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">{mant.conclusion}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
