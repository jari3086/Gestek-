import { NextRequest, NextResponse } from "next/server";
import { generatePdfBuffer } from "@/lib/pdf/generate-pdf";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { hoyBogota } from "@/lib/date";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "127.0.0.1";
  const rl = await rateLimit({ key: `generar:${ip}`, max: 5, windowMs: 60000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const body = await request.json();
    const { equipo, cliente, mantenimiento, sede, proximo_mantenimiento, proxima_calibracion } = body;
    const equipoId = body.equipoId;

    if (!equipo || !cliente || !mantenimiento) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 },
      );
    }

    const pdfBuffer = await generatePdfBuffer({ equipo, cliente, mantenimiento, sede });

    const fileName = `informes/${user.id}/${Date.now()}.pdf`;

    // Subir a Storage con admin client (bypass RLS)
    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from("informes")
      .upload(fileName, pdfBuffer, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      console.error("Error subiendo PDF:", uploadError);
    }

    let pdfUrl: string | null = null;
    if (!uploadError) {
      const { data: urlData } = admin.storage.from("informes").getPublicUrl(fileName);
      pdfUrl = urlData.publicUrl;
    }

    // Guardar registro de mantenimiento
    let mantenimientoId: string | null = null;
    if (equipoId) {
      const { data: mantRecord } = await supabase.from("mantenimientos").insert({
        equipo_id: equipoId,
        tipo: mantenimiento.tipo || "Mantenimiento",
        fecha: hoyBogota(),
        tecnico_id: user.id,
        estado: "completado",
        pdf_url: pdfUrl,
        observaciones: mantenimiento.observaciones || "",
        conclusion: mantenimiento.conclusion || null,
        orden_servicio: mantenimiento.orden_servicio || null,
        numero_informe: mantenimiento.numero_informe || null,
        tecnico_nombre: mantenimiento.tecnico_nombre || null,
        visible_para_cliente: false,
        firma_tecnico: mantenimiento.firma_tecnico || null,
        firma_aprobador: mantenimiento.firma_aprobador || null,
        firma_recibe: mantenimiento.firma_recibe || null,
      }).select("id").single();

      mantenimientoId = mantRecord?.id ?? null;

      // Guardar checklist results
      if (mantRecord && mantenimiento.checklist?.length > 0) {
        await supabase.from("checklist_resultados").insert({
          mantenimiento_id: mantRecord.id,
          plantilla_id: body.plantillaId || null,
          resultados: mantenimiento.checklist,
        });
      }

      // Guardar fotos
      if (mantRecord && mantenimiento.fotos?.length > 0) {
        const fotosRecords = mantenimiento.fotos.map((url: string) => ({
          mantenimiento_id: mantRecord.id,
          url,
        }));
        await supabase.from("fotos_mantenimiento").insert(fotosRecords);
      }

      // Actualizar fechas de próximo mantenimiento/calibración en el equipo
      const equipoUpdates: Record<string, string> = {};
      if (proximo_mantenimiento) equipoUpdates.fecha_proximo_mantenimiento = proximo_mantenimiento;
      if (proxima_calibracion) equipoUpdates.fecha_proxima_calibracion = proxima_calibracion;
      if (Object.keys(equipoUpdates).length > 0) {
        await supabase.from("equipos").update(equipoUpdates).eq("id", equipoId);
      }
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="informe-${equipo.nombre?.replace(/\s+/g, "-").toLowerCase() || "equipo"}.pdf"`,
        "X-Pdf-Url": pdfUrl || "",
        "X-Mantenimiento-Id": mantenimientoId || "",
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 });
  }
}
