"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { isAdmin } from "@/lib/auth/check-admin";

const sedeSchema = z.object({
  cliente_id: z.string().uuid("Cliente inválido").min(1),
  nombre: z.string().min(1, "Nombre requerido").max(200),
  direccion: z.string().max(300).optional().default(""),
  ciudad: z.string().max(100).optional().default(""),
  departamento: z.string().max(100).optional().default(""),
  telefono: z.string().max(50).optional().default(""),
  email: z.string().email("Email inválido").optional().or(z.literal("")).default(""),
});

export type SedeState = { error?: string } | undefined;

export async function crearSede(prevState: SedeState, formData: FormData) {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) return { error: "No autorizado" };

  const parsed = sedeSchema.safeParse({
    cliente_id: formData.get("cliente_id") as string,
    nombre: formData.get("nombre") as string,
    direccion: formData.get("direccion") as string,
    ciudad: formData.get("ciudad") as string,
    departamento: formData.get("departamento") as string,
    telefono: formData.get("telefono") as string,
    email: formData.get("email") as string,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  const { error } = await supabase.from("sedes").insert({
    cliente_id: parsed.data.cliente_id,
    nombre: parsed.data.nombre,
    direccion: parsed.data.direccion || null,
    ciudad: parsed.data.ciudad || null,
    departamento: parsed.data.departamento || null,
    telefono: parsed.data.telefono || null,
    email: parsed.data.email || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/clientes/${parsed.data.cliente_id}`);
  redirect(`/clientes/${parsed.data.cliente_id}/sedes`);
}

export async function actualizarSede(prevState: SedeState, formData: FormData) {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) return { error: "No autorizado" };

  const id = formData.get("id") as string;
  if (!id) return { error: "ID requerido" };

  const parsed = sedeSchema.safeParse({
    cliente_id: formData.get("cliente_id") as string,
    nombre: formData.get("nombre") as string,
    direccion: formData.get("direccion") as string,
    ciudad: formData.get("ciudad") as string,
    departamento: formData.get("departamento") as string,
    telefono: formData.get("telefono") as string,
    email: formData.get("email") as string,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  const { error } = await supabase
    .from("sedes")
    .update({
      nombre: parsed.data.nombre,
      direccion: parsed.data.direccion || null,
      ciudad: parsed.data.ciudad || null,
      departamento: parsed.data.departamento || null,
      telefono: parsed.data.telefono || null,
      email: parsed.data.email || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/clientes/${parsed.data.cliente_id}`);
  redirect(`/clientes/${parsed.data.cliente_id}/sedes`);
}

export async function eliminarSede(id: string, clienteId: string) {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) throw new Error("No autorizado");

  await supabase.from("sedes").delete().eq("id", id);
  revalidatePath(`/clientes/${clienteId}`);
}
