import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const idFilter = request.nextUrl.searchParams.get("id");

    let query = supabase
      .from("profiles")
      .select("id, nombre, nit, ciudad, telefono, direccion, email, logo_url, regimen, tipo_persona, departamento, codigo_postal")
      .eq("role", "cliente")
      .order("nombre");

    if (idFilter) {
      query = query.eq("id", idFilter);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Error en GET /api/clientes:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
