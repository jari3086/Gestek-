"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { plantillaSchema } from "@/lib/schemas";
import { isAdmin } from "@/lib/auth/check-admin";
import { normalizeSecciones, normalizeChecklistItems, normalizeMediciones, type Seccion } from "@/lib/checklist";

export type PlantillaState = { error?: string } | undefined;

export interface PlantillaItem {
  id: string;
  nombre: string;
  categoria: string;
  obligatorio: boolean;
}

function parseJson(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function seccionesFromForm(formData: FormData): { secciones: Seccion[]; error?: string } {
  const raw = parseJson(formData.get("secciones") as string | null);

  // Si no llega "secciones" (retrocompatibilidad), construir desde items/mediciones
  if (!raw) {
    const items = normalizeChecklistItems(parseJson(formData.get("items") as string | null));
    const mediciones = normalizeMediciones(parseJson(formData.get("mediciones") as string | null));

    const secciones: Seccion[] = [];
    if (items.length > 0) secciones.push({ id: "sec-check", titulo: "", tipo: "checklist", items });
    if (mediciones.length > 0) {
      secciones.push({
        id: "sec-mediciones",
        titulo: "",
        tipo: "mediciones",
        grupos: [{ titulo: "", campos: mediciones }],
      });
    }
    return { secciones };
  }

  return { secciones: normalizeSecciones(raw) };
}

export async function crearPlantilla(prevState: PlantillaState, formData: FormData) {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) return { error: "No autorizado" };

  const parsed = plantillaSchema.safeParse({
    nombre: formData.get("nombre") as string,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  const { secciones, error } = seccionesFromForm(formData);
  if (error) return { error };
  if (secciones.length === 0) return { error: "Agregue al menos una sección" };

  const descripcion = formData.get("descripcion") as string || null;

  const { error: insertError } = await supabase.from("plantillas").insert({
    nombre: parsed.data.nombre,
    descripcion,
    secciones,
  });

  if (insertError) return { error: insertError.message };
  redirect("/plantillas");
}

export async function actualizarPlantilla(prevState: PlantillaState, formData: FormData) {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) return { error: "No autorizado" };

  const id = formData.get("id") as string;
  if (!id) return { error: "ID requerido" };

  const parsed = plantillaSchema.safeParse({
    nombre: formData.get("nombre") as string,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  const { secciones, error } = seccionesFromForm(formData);
  if (error) return { error };
  if (secciones.length === 0) return { error: "Agregue al menos una sección" };

  const descripcion = formData.get("descripcion") as string || null;

  const { error: updateError } = await supabase
    .from("plantillas")
    .update({ nombre: parsed.data.nombre, descripcion, secciones, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) return { error: updateError.message };
  redirect("/plantillas");
}

export async function eliminarPlantilla(id: string) {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) throw new Error("No autorizado");

  const { error } = await supabase.from("plantillas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/plantillas");
}
