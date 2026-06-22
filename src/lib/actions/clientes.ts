"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clienteSchema } from "@/lib/schemas";
import { isAdmin } from "@/lib/auth/check-admin";

export type ClienteState = { error?: string } | undefined;

export async function crearCliente(prevState: ClienteState, formData: FormData) {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) return { error: "No autorizado" };

  const raw = (name: string) => (formData.get(name) as string) || "";

  const parsed = clienteSchema.safeParse({
    nombre: raw("nombre"),
    email: raw("email"),
    telefono: raw("telefono"),
    nit: raw("nit"),
    direccion: raw("direccion"),
    ciudad: raw("ciudad"),
    regimen: raw("regimen"),
    tipo_persona: raw("tipo_persona"),
    logo_url: raw("logo_url"),
    departamento: raw("departamento"),
    codigo_postal: raw("codigo_postal"),
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
    logo_url: parsed.data.logo_url || null,
    departamento: parsed.data.departamento || null,
    codigo_postal: parsed.data.codigo_postal || null,
  });

  if (profileError) return { error: profileError.message };

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function actualizarCliente(prevState: ClienteState, formData: FormData) {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) return { error: "No autorizado" };

  const id = formData.get("id") as string;
  if (!id) return { error: "ID requerido" };

  const raw = (name: string) => (formData.get(name) as string) || "";

  const parsed = clienteSchema.safeParse({
    nombre: raw("nombre"),
    email: raw("email"),
    telefono: raw("telefono"),
    nit: raw("nit"),
    direccion: raw("direccion"),
    ciudad: raw("ciudad"),
    regimen: raw("regimen"),
    tipo_persona: raw("tipo_persona"),
    logo_url: raw("logo_url"),
    departamento: raw("departamento"),
    codigo_postal: raw("codigo_postal"),
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
      logo_url: parsed.data.logo_url || null,
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
  if (!(await isAdmin(supabase))) return { error: "No autorizado" };

  const email = formData.get("email") as string;
  const nombre = formData.get("nombre") as string;
  const password = formData.get("password") as string;
  const firma_url = formData.get("firma_url") as string;

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

  const profileData: Record<string, string> = {
    id: authData.user.id,
    nombre,
    email,
    role: "tecnico",
  };
  if (firma_url) profileData.firma_url = firma_url;

  const { error: profileError } = await admin.from("profiles").upsert(profileData);

  if (profileError) return { error: profileError.message };

  revalidatePath("/empleados");
  redirect("/empleados");
}

export async function eliminarCliente(id: string) {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) throw new Error("No autorizado");

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

export async function actualizarPerfil(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const firma_url = formData.get("firma_url") as string;
  const nombre = formData.get("nombre") as string;

  const updates: Record<string, string> = {};
  if (firma_url) updates.firma_url = firma_url;
  if (nombre) updates.nombre = nombre;

  if (Object.keys(updates).length === 0) return { error: "Sin cambios" };

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/perfil");
  return { success: true };
}

export async function actualizarTecnico(formData: FormData) {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) return { error: "No autorizado" };

  const id = formData.get("id") as string;
  const nombre = formData.get("nombre") as string;
  const firma_url = formData.get("firma_url") as string;

  if (!id) return { error: "ID requerido" };

  const updates: Record<string, string> = {};
  if (nombre) updates.nombre = nombre;
  if (firma_url) updates.firma_url = firma_url;

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update(updates).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/empleados");
  return { success: true };
}

export async function eliminarTecnico(id: string) {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) throw new Error("No autorizado");

  const admin = createAdminClient();

  await admin.from("mantenimientos").delete().eq("tecnico_id", id);
  await admin.from("profiles").delete().eq("id", id);

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    console.error("Error deleteUser (datos ya eliminados):", error.message);
  }

  revalidatePath("/empleados");
}
