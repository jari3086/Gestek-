import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

  const { data } = await query;

  return NextResponse.json(data || []);
}
