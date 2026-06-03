import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const clientIdFilter = request.nextUrl.searchParams.get("cliente_id");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let query = supabase.from("equipos").select("*, cliente:cliente_id(nombre, nit, ciudad)");

  if (clientIdFilter) {
    query = query.eq("cliente_id", clientIdFilter);
  } else if (profile?.role === "cliente") {
    query = query.eq("cliente_id", user.id);
  }

  const { data, error } = await query.order("nombre");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
