"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { plantillaSchema } from "@/lib/schemas";
import { isAdmin } from "@/lib/auth/check-admin";

export type PlantillaState = { error?: string } | undefined;

export interface PlantillaItem {
  id: string;
  nombre: string;
  categoria: string;
  obligatorio: boolean;
}

export async function crearPlantilla(prevState: PlantillaState, formData: FormData) {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) return { error: "No autorizado" };

  const parsed = plantillaSchema.safeParse({
    nombre: formData.get("nombre") as string,
    items: formData.get("items") as string,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  let items: PlantillaItem[];
  try {
    items = JSON.parse(parsed.data.items);
  } catch {
    return { error: "Formato de items inválido" };
  }

  const descripcion = formData.get("descripcion") as string || null;

  const { error } = await supabase.from("plantillas").insert({
    nombre: parsed.data.nombre,
    descripcion,
    items,
  });

  if (error) return { error: error.message };
  redirect("/plantillas");
}

export async function actualizarPlantilla(prevState: PlantillaState, formData: FormData) {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) return { error: "No autorizado" };

  const id = formData.get("id") as string;
  if (!id) return { error: "ID requerido" };

  const parsed = plantillaSchema.safeParse({
    nombre: formData.get("nombre") as string,
    items: formData.get("items") as string,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  let items: PlantillaItem[];
  try {
    items = JSON.parse(parsed.data.items);
  } catch {
    return { error: "Formato de items inválido" };
  }

  const descripcion = formData.get("descripcion") as string || null;

  const { error } = await supabase
    .from("plantillas")
    .update({ nombre: parsed.data.nombre, descripcion, items, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  redirect("/plantillas");
}

export async function eliminarPlantilla(id: string) {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) throw new Error("No autorizado");

  const { error } = await supabase.from("plantillas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/plantillas");
}
