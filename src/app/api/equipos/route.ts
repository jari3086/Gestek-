import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const clientIdFilter = request.nextUrl.searchParams.get("cliente_id");
  const sedeFilter = request.nextUrl.searchParams.get("sede_id");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let query = supabase.from("equipos").select("*, cliente:cliente_id(nombre, nit, ciudad), sede:sede_id(nombre)");

  if (clientIdFilter) {
    query = query.eq("cliente_id", clientIdFilter);
  } else if (profile?.role === "cliente") {
    query = query.eq("cliente_id", user.id);
  }

  if (sedeFilter) {
    query = query.eq("sede_id", sedeFilter);
  }

  const { data, error } = await query.order("nombre");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Adjuntar la fecha del último informe (mantenimiento) de cada equipo
  if (Array.isArray(data) && data.length > 0) {
    const equipoIds = data.map((e: any) => e.id);
    const { data: ultimos } = await supabase
      .from("mantenimientos")
      .select("equipo_id, fecha")
      .in("equipo_id", equipoIds)
      .order("fecha", { ascending: false });

    if (ultimos) {
      const map = new Map<string, string>();
      for (const m of ultimos) {
        if (!map.has(m.equipo_id)) map.set(m.equipo_id, m.fecha);
      }
      for (const e of data) {
        (e as any).ultimo_informe_fecha = map.get(e.id) || null;
      }
    }
  }

  return NextResponse.json(data);
}
