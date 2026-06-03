"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clienteSchema } from "@/lib/schemas";

export type ClienteState = { error?: string } | undefined;

async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "administrador";
}

export async function crearCliente(prevState: ClienteState, formData: FormData) {
  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) return { error: "No autorizado" };

  const parsed = clienteSchema.safeParse({
    nombre: formData.get("nombre") as string,
    email: formData.get("email") as string,
    telefono: formData.get("telefono") as string,
    nit: formData.get("nit") as string,
    direccion: formData.get("direccion") as string,
    ciudad: formData.get("ciudad") as string,
    regimen: formData.get("regimen") as string,
    tipo_persona: formData.get("tipo_persona") as string,
    departamento: formData.get("departamento") as string,
    codigo_postal: formData.get("codigo_postal") as string,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  const password = formData.get("password") as string;
  if (!password || password.length < 6) return { error: "Contraseña debe tener al menos 6 caracteres" };

  const admin = createAdminClient();

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password,
    email_confirm: true,
    user_metadata: { nombre: parsed.data.nombre, role: "cliente" },
  });

  if (authError) return { error: authError.message };

  const { error: profileError } = await admin.from("profiles").upsert({
    id: authData.user.id,
    nombre: parsed.data.nombre,
    email: parsed.data.email,
    role: "cliente",
    nit: parsed.data.nit || null,
    direccion: parsed.data.direccion || null,
    ciudad: parsed.data.ciudad || null,
    telefono: parsed.data.telefono || null,
    regimen: parsed.data.regimen || null,
    tipo_persona: parsed.data.tipo_persona || null,
    departamento: parsed.data.departamento || null,
    codigo_postal: parsed.data.codigo_postal || null,
  });

  if (profileError) return { error: profileError.message };

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function actualizarCliente(prevState: ClienteState, formData: FormData) {
  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) return { error: "No autorizado" };

  const id = formData.get("id") as string;
  if (!id) return { error: "ID requerido" };

  const parsed = clienteSchema.safeParse({
    nombre: formData.get("nombre") as string,
    email: formData.get("email") as string,
    telefono: formData.get("telefono") as string,
    nit: formData.get("nit") as string,
    direccion: formData.get("direccion") as string,
    ciudad: formData.get("ciudad") as string,
    regimen: formData.get("regimen") as string,
    tipo_persona: formData.get("tipo_persona") as string,
    departamento: formData.get("departamento") as string,
    codigo_postal: formData.get("codigo_postal") as string,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  const { error } = await supabase
    .from("profiles")
    .update({
      nombre: parsed.data.nombre,
      email: parsed.data.email,
      nit: parsed.data.nit || null,
      direccion: parsed.data.direccion || null,
      ciudad: parsed.data.ciudad || null,
      telefono: parsed.data.telefono || null,
      regimen: parsed.data.regimen || null,
      tipo_persona: parsed.data.tipo_persona || null,
      departamento: parsed.data.departamento || null,
      codigo_postal: parsed.data.codigo_postal || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function crearTecnico(prevState: ClienteState, formData: FormData) {
  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) return { error: "No autorizado" };

  const email = formData.get("email") as string;
  const nombre = formData.get("nombre") as string;
  const password = formData.get("password") as string;

  if (!email || !email.includes("@")) return { error: "Email inválido" };
  if (!nombre || nombre.length < 1) return { error: "Nombre requerido" };
  if (!password || password.length < 6) return { error: "Contraseña debe tener al menos 6 caracteres" };

  const admin = createAdminClient();

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre, role: "tecnico" },
  });

  if (authError) return { error: authError.message };

  const { error: profileError } = await admin.from("profiles").upsert({
    id: authData.user.id,
    nombre,
    email,
    role: "tecnico",
  });

  if (profileError) return { error: profileError.message };

  revalidatePath("/empleados");
  redirect("/empleados");
}

export async function eliminarCliente(id: string) {
  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) throw new Error("No autorizado");

  const admin = createAdminClient();

  // 1. Eliminar equipos del cliente y todo lo relacionado
  const { data: equipos, error: eqErr } = await admin.from("equipos").select("id").eq("cliente_id", id);
  if (eqErr) throw new Error(`Error al buscar equipos: ${eqErr.message}`);

  if (equipos && equipos.length > 0) {
    const equipoIds = equipos.map((e: { id: string }) => e.id);

    const { data: mantenimientos } = await admin
      .from("mantenimientos").select("id").in("equipo_id", equipoIds);
    const mantIds = (mantenimientos || []).map((m: { id: string }) => m.id);

    if (mantIds.length > 0) {
      const { error: e1 } = await admin.from("checklist_resultados").delete().in("mantenimiento_id", mantIds);
      if (e1) throw new Error(`Error al eliminar checklist: ${e1.message}`);
      const { error: e2 } = await admin.from("fotos_mantenimiento").delete().in("mantenimiento_id", mantIds);
      if (e2) throw new Error(`Error al eliminar fotos: ${e2.message}`);
      const { error: e3 } = await admin.from("mantenimientos").delete().in("id", mantIds);
      if (e3) throw new Error(`Error al eliminar mantenimientos: ${e3.message}`);
    }

    const { error: e4 } = await admin.from("equipos").delete().in("id", equipoIds);
    if (e4) throw new Error(`Error al eliminar equipos: ${e4.message}`);
  }

  // 2. Eliminar facturas del cliente
  const { error: factErr } = await admin.from("facturas").delete().eq("cliente_id", id);
  if (factErr) throw new Error(`Error al eliminar facturas: ${factErr.message}`);

  // 3. Eliminar el perfil
  const { error: profileErr } = await admin.from("profiles").delete().eq("id", id);
  if (profileErr) throw new Error(`Error al eliminar perfil: ${profileErr.message}`);

  // 4. Eliminar el usuario auth
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    console.error("Error deleteUser (datos ya eliminados):", error.message);
  }

  revalidatePath("/clientes");
}

export async function eliminarTecnico(id: string) {
  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) throw new Error("No autorizado");

  const admin = createAdminClient();

  await admin.from("mantenimientos").delete().eq("tecnico_id", id);
  await admin.from("profiles").delete().eq("id", id);

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    console.error("Error deleteUser (datos ya eliminados):", error.message);
  }

  revalidatePath("/empleados");
}
