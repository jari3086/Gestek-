"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { hoyBogota, dentroDeDias } from "@/lib/date";

export async function toggleVisibilidad(mantenimientoId: string, visible: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "administrador") return { error: "No autorizado" };

  const { error } = await supabase
    .from("mantenimientos")
    .update({ visible_para_cliente: visible })
    .eq("id", mantenimientoId);

  if (error) return { error: error.message };
  revalidatePath(`/informes/${mantenimientoId}`);
  revalidatePath("/informes");
  return { success: true };
}

export async function actualizarInforme(
  mantenimientoId: string,
  data: {
    observaciones?: string;
    conclusion?: string;
    orden_servicio?: string;
    numero_informe?: string;
    tecnico_nombre?: string;
    firma_aprobador?: string;
  },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: profile } = await supabase
    .from("profiles").select("role, nombre").eq("id", user.id).single();
  if (profile?.role !== "administrador") return { error: "No autorizado" };

  const updates: Record<string, any> = {};
  if (data.observaciones !== undefined) updates.observaciones = data.observaciones;
  if (data.conclusion !== undefined) updates.conclusion = data.conclusion;
  if (data.orden_servicio !== undefined) updates.orden_servicio = data.orden_servicio;
  if (data.numero_informe !== undefined) updates.numero_informe = data.numero_informe;
  if (data.tecnico_nombre !== undefined) updates.tecnico_nombre = data.tecnico_nombre;
  if (data.firma_aprobador !== undefined) updates.firma_aprobador = data.firma_aprobador;

  const { error } = await supabase
    .from("mantenimientos")
    .update(updates)
    .eq("id", mantenimientoId);

  if (error) return { error: error.message };

  // Regenerate PDF with updated data
  try {
    const { data: mant } = await supabase
      .from("mantenimientos")
      .select("*, equipo:equipo_id(*, cliente:cliente_id(*))")
      .eq("id", mantenimientoId)
      .single();

    if (!mant) return { error: "Informe no encontrado" };

    const equipo = mant.equipo as any;
    const cliente = equipo?.cliente as any;

    const { data: checklistResult } = await supabase
      .from("checklist_resultados")
      .select("*")
      .eq("mantenimiento_id", mantenimientoId)
      .maybeSingle();

    const { data: fotos } = await supabase
      .from("fotos_mantenimiento")
      .select("url")
      .eq("mantenimiento_id", mantenimientoId);

    const { generatePdfBuffer } = await import("@/lib/pdf/generate-pdf");
    const { createAdminClient } = await import("@/lib/supabase/admin");

    const pdfBuffer = await generatePdfBuffer({
      equipo,
      cliente,
      mantenimiento: {
        tipo: mant.tipo,
        fecha: mant.fecha,
        orden_servicio: mant.orden_servicio || undefined,
        numero_informe: mant.numero_informe || undefined,
        observaciones: mant.observaciones || undefined,
        conclusion: mant.conclusion || undefined,
        tecnico_nombre: mant.tecnico_nombre || "",
        aprobador_nombre: profile.nombre || undefined,
        firma_tecnico: mant.firma_tecnico || undefined,
        firma_aprobador: mant.firma_aprobador || undefined,
        firma_recibe: mant.firma_recibe || undefined,
        checklist: (checklistResult?.resultados as any[]) || undefined,
        fotos: fotos?.map(f => f.url) || undefined,
      },
    });

    const fileName = `informes/${user.id}/${Date.now()}.pdf`;
    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from("informes")
      .upload(fileName, pdfBuffer, { contentType: "application/pdf", upsert: true });

    if (!uploadError) {
      const { data: urlData } = admin.storage.from("informes").getPublicUrl(fileName);
      await supabase.from("mantenimientos").update({ pdf_url: urlData.publicUrl }).eq("id", mantenimientoId);
    }
  } catch (err) {
    console.error("Error regenerando PDF:", err);
  }

  revalidatePath(`/informes/${mantenimientoId}`);
  return { success: true };
}

export async function enviarEmailManual(mantenimientoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: profile } = await supabase
    .from("profiles").select("role, nombre").eq("id", user.id).single();
  if (profile?.role !== "administrador") return { error: "No autorizado" };

  // Obtener mantenimiento con equipo y cliente
  const { data: mant } = await supabase
    .from("mantenimientos")
    .select("*, equipo:equipo_id(*, cliente:cliente_id(*))")
    .eq("id", mantenimientoId)
    .single();

  if (!mant) return { error: "Informe no encontrado" };
  if (!mant.pdf_url) return { error: "El informe no tiene PDF asociado" };

  const equipo = mant.equipo as any;
  const cliente = equipo?.cliente as any;

  if (!cliente?.email) return { error: "El cliente no tiene email registrado" };

  // Enviar por email
  if (!process.env.RESEND_API_KEY) {
    return { error: "RESEND_API_KEY no configurada" };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Descargar PDF desde Storage
    const pdfResponse = await fetch(mant.pdf_url);
    const pdfBuffer = await pdfResponse.arrayBuffer();

    await resend.emails.send({
      from: "Gestek <informes@gestek.app>",
      to: cliente.email,
      subject: `Informe de servicio - ${equipo.nombre}`,
      html: `<p>Estimado/a ${cliente.nombre},</p>
             <p>Adjunto encontrará el informe de servicio realizado al equipo <strong>${equipo.nombre}</strong>.</p>
             <p><strong>Equipo:</strong> ${equipo.nombre} (Serie: ${equipo.serie})</p>
             <p><strong>Tipo de servicio:</strong> ${mant.tipo}</p>
             <p><strong>Fecha:</strong> ${mant.fecha}</p>
             <p><strong>Profesional:</strong> ${mant.tecnico_nombre || profile.nombre || "Técnico"}</p>
             <br/>
             <p>Saludos cordiales,</p>
             <p><strong>GESTEK</strong></p>`,
      attachments: [
        {
          filename: `informe-${equipo.nombre.replace(/\s+/g, "-").toLowerCase()}.pdf`,
          content: Buffer.from(pdfBuffer).toString("base64"),
        },
      ],
    });

    return { success: true };
  } catch (error) {
    console.error("Error enviando email:", error);
    return { error: "Error al enviar el email" };
  }
}

export async function enviarRecordatoriosMantenimiento() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "administrador") return { error: "No autorizado" };

  if (!process.env.RESEND_API_KEY) {
    return { error: "RESEND_API_KEY no configurada" };
  }

  const hoy = hoyBogota();
  const dentro15dias = dentroDeDias(15);

  const { data: equipos } = await supabase
    .from("equipos")
    .select("id, nombre, serie, cliente_id, fecha_proximo_mantenimiento, cliente:cliente_id!inner(email, nombre)")
    .not("fecha_proximo_mantenimiento", "is", null)
    .lte("fecha_proximo_mantenimiento", dentro15dias)
    .gte("fecha_proximo_mantenimiento", hoy);

  if (!equipos || equipos.length === 0) {
    return { success: true, enviados: 0, message: "No hay mantenimientos próximos para notificar" };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    let enviados = 0;

    for (const eq of equipos) {
      const cliente = eq.cliente as any;
      if (!cliente?.email) continue;

      await resend.emails.send({
        from: "Gestek <recordatorios@gestek.app>",
        to: cliente.email,
        subject: `Recordatorio: Mantenimiento próximo - ${eq.nombre}`,
        html: `<p>Estimado/a ${cliente.nombre},</p>
               <p>Le recordamos que el mantenimiento del equipo <strong>${eq.nombre}</strong> (Serie: ${eq.serie}) está próximo a vencer.</p>
               <p><strong>Fecha programada:</strong> ${eq.fecha_proximo_mantenimiento}</p>
               <p>Por favor, contacte a Gestek para coordinar la visita técnica.</p>
               <br/>
               <p>Saludos cordiales,</p>
               <p><strong>GESTEK</strong></p>`,
      });
      enviados++;
    }

    return { success: true, enviados, message: `${enviados} recordatorio(s) enviado(s)` };
  } catch (error) {
    console.error("Error enviando recordatorios:", error);
    return { error: "Error al enviar los recordatorios" };
  }
}

export async function eliminarInforme(mantenimientoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "administrador") return { error: "No autorizado" };

  const { error } = await supabase
    .from("mantenimientos")
    .delete()
    .eq("id", mantenimientoId);

  if (error) return { error: error.message };
  revalidatePath("/informes");
  return { success: true };
}
