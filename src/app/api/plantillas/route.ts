import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { data, error } = await supabase
      .from("plantillas")
      .select("id, nombre, descripcion, items")
      .order("nombre");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Error en GET /api/plantillas:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
