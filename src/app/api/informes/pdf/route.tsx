import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { generatePdfBuffer } from "@/lib/pdf/generate-pdf";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { equipo, cliente, mantenimiento } = body;

    if (!equipo || !cliente || !mantenimiento) {
      return NextResponse.json(
        { error: "Faltan datos: equipo, cliente y mantenimiento son requeridos" },
        { status: 400 },
      );
    }

    const pdfBuffer = await generatePdfBuffer({ equipo, cliente, mantenimiento });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="informe-${equipo.nombre.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return NextResponse.json(
      { error: "Error al generar el PDF" },
      { status: 500 },
    );
  }
}
