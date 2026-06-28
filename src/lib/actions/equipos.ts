"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { equipoSchema } from "@/lib/schemas";
import { logAudit } from "@/lib/audit";
import { checkAdmin } from "@/lib/auth/check-admin";

export type EquipoState = { error?: string } | undefined;

function fromForm(formData: FormData) {
  return {
    nombre: formData.get("nombre") as string,
    tipo: formData.get("tipo") as string,
    id_cliente: formData.get("id_cliente") as string,
    marca: formData.get("marca") as string,
    modelo: formData.get("modelo") as string,
    serie: formData.get("serie") as string,
    accesorios: formData.get("accesorios") as string,
    ubicacion: formData.get("ubicacion") as string,
    cliente_id: formData.get("cliente_id") as string,
    sede_id: (formData.get("sede_id") as string) || "",
    fecha_ultimo_mantenimiento: formData.get("fecha_ultimo_mantenimiento") as string,
    fecha_proximo_mantenimiento: formData.get("fecha_proximo_mantenimiento") as string,
    fecha_ultima_calibracion: formData.get("fecha_ultima_calibracion") as string,
    fecha_proxima_calibracion: formData.get("fecha_proxima_calibracion") as string,
    periodicidad_mantenimiento: formData.get("periodicidad_mantenimiento") as string,
  };
}

export async function crearEquipo(prevState: EquipoState, formData: FormData) {
  const supabase = await createClient();
  const adminCheck = await checkAdmin(supabase);
  if (!adminCheck.authorized) return { error: adminCheck.error || "No autorizado" };

  const parsed = equipoSchema.safeParse(fromForm(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  const { periodicidad_mantenimiento, ...rest } = parsed.data;
  const payload = {
    ...rest,
    periodicidad_mantenimiento: periodicidad_mantenimiento || null,
    id_cliente: rest.id_cliente || null,
    marca: rest.marca || null,
    modelo: rest.modelo || null,
    accesorios: rest.accesorios || null,
    sede_id: rest.sede_id || null,
    fecha_ultimo_mantenimiento: rest.fecha_ultimo_mantenimiento || null,
    fecha_proximo_mantenimiento: rest.fecha_proximo_mantenimiento || null,
    fecha_ultima_calibracion: rest.fecha_ultima_calibracion || null,
    fecha_proxima_calibracion: rest.fecha_proxima_calibracion || null,
    creado_por: adminCheck.userId!,
  };

  const { error } = await supabase.from("equipos").insert(payload);
  if (error) return { error: error.message };

  await logAudit({
    userId: adminCheck.userId!,
    action: "crear",
    entity: "equipo",
    entityId: payload.nombre,
    details: { cliente_id: payload.cliente_id },
  });

  revalidatePath("/equipos");
  redirect("/equipos");
}

export async function actualizarEquipo(prevState: EquipoState, formData: FormData) {
  const supabase = await createClient();
  const adminCheck = await checkAdmin(supabase);
  if (!adminCheck.authorized) return { error: adminCheck.error || "No autorizado" };
  const id = formData.get("id") as string;
  if (!id) return { error: "ID requerido" };

  const parsed = equipoSchema.safeParse(fromForm(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  const { periodicidad_mantenimiento, ...rest } = parsed.data;
  const payload = {
    ...rest,
    periodicidad_mantenimiento: periodicidad_mantenimiento || null,
    id_cliente: rest.id_cliente || null,
    marca: rest.marca || null,
    modelo: rest.modelo || null,
    accesorios: rest.accesorios || null,
    sede_id: rest.sede_id || null,
    fecha_ultimo_mantenimiento: rest.fecha_ultimo_mantenimiento || null,
    fecha_proximo_mantenimiento: rest.fecha_proximo_mantenimiento || null,
    fecha_ultima_calibracion: rest.fecha_ultima_calibracion || null,
    fecha_proxima_calibracion: rest.fecha_proxima_calibracion || null,
  };

  const { error } = await supabase.from("equipos").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/equipos");
  redirect("/equipos");
}

export async function eliminarEquipo(id: string) {
  const supabase = await createClient();
  const adminCheck = await checkAdmin(supabase);
  if (!adminCheck.authorized) throw new Error(adminCheck.error || "No autorizado");
  const { data: equipo } = await supabase.from("equipos").select("nombre").eq("id", id).single();
  const { error } = await supabase.from("equipos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logAudit({
    userId: adminCheck.userId!,
    action: "eliminar",
    entity: "equipo",
    entityId: id,
    details: { nombre: equipo?.nombre },
  });

  revalidatePath("/equipos");
}
