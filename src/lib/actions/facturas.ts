"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { facturaSchema } from "@/lib/schemas";
import { hoyBogota } from "@/lib/date";

export type FacturaState = { error?: string } | undefined;

async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "administrador";
}

export async function crearFactura(prevState: FacturaState, formData: FormData) {
  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) return { error: "No autorizado" };

  const parsed = facturaSchema.safeParse({
    cliente_id: formData.get("cliente_id") as string,
    monto: formData.get("monto") as string,
    fecha: formData.get("fecha") as string || hoyBogota(),
    estado: formData.get("estado") as string || "emitida",
    subtotal: formData.get("subtotal") as string || "0",
    total_iva: formData.get("total_iva") as string || "0",
    total: formData.get("total") as string || "0",
    retencion_fuente: formData.get("retencion_fuente") as string || "0",
    retencion_iva: formData.get("retencion_iva") as string || "0",
    retencion_ica: formData.get("retencion_ica") as string || "0",
    tipo_documento: formData.get("tipo_documento") as string || "factura",
    prefijo: formData.get("prefijo") as string || "",
    numero_consecutivo: formData.get("numero_consecutivo") as string,
    fecha_emision: formData.get("fecha_emision") as string,
    fecha_vencimiento: formData.get("fecha_vencimiento") as string,
    forma_pago: formData.get("forma_pago") as string || "contado",
    medio_pago: formData.get("medio_pago") as string || "",
    moneda: formData.get("moneda") as string || "COP",
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  // Limpiar strings vacíos que PostgreSQL rechaza en columnas TIMESTAMPTZ/DATE
  const { fecha_emision, fecha_vencimiento, numero_consecutivo, ...rest } = parsed.data;
  const data = {
    ...rest,
    ...(fecha_emision && { fecha_emision }),
    ...(fecha_vencimiento && { fecha_vencimiento }),
    ...(numero_consecutivo && { numero_consecutivo }),
  };

  const { error } = await supabase.from("facturas").insert(data);
  if (error) return { error: error.message };

  revalidatePath("/facturas");
  redirect("/facturas");
}

export async function actualizarFactura(prevState: FacturaState, formData: FormData) {
  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) return { error: "No autorizado" };

  const id = formData.get("id") as string;
  if (!id) return { error: "ID requerido" };

  const parsed = facturaSchema.safeParse({
    cliente_id: formData.get("cliente_id") as string,
    monto: formData.get("monto") as string,
    fecha: formData.get("fecha") as string,
    estado: formData.get("estado") as string,
    subtotal: formData.get("subtotal") as string || "0",
    total_iva: formData.get("total_iva") as string || "0",
    total: formData.get("total") as string || "0",
    retencion_fuente: formData.get("retencion_fuente") as string || "0",
    retencion_iva: formData.get("retencion_iva") as string || "0",
    retencion_ica: formData.get("retencion_ica") as string || "0",
    tipo_documento: formData.get("tipo_documento") as string || "factura",
    prefijo: formData.get("prefijo") as string || "",
    numero_consecutivo: formData.get("numero_consecutivo") as string,
    fecha_emision: formData.get("fecha_emision") as string,
    fecha_vencimiento: formData.get("fecha_vencimiento") as string,
    forma_pago: formData.get("forma_pago") as string || "contado",
    medio_pago: formData.get("medio_pago") as string || "",
    moneda: formData.get("moneda") as string || "COP",
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  const { fecha_emision, fecha_vencimiento, numero_consecutivo, ...rest } = parsed.data;
  const data = {
    ...rest,
    ...(fecha_emision && { fecha_emision }),
    ...(fecha_vencimiento && { fecha_vencimiento }),
    ...(numero_consecutivo && { numero_consecutivo }),
  };

  const { error } = await supabase.from("facturas").update(data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/facturas");
  redirect("/facturas");
}

export async function cambiarEstadoFactura(formData: FormData) {
  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) throw new Error("No autorizado");

  const id = formData.get("id") as string;
  const estado = formData.get("estado") as string;

  if (!["emitida", "pagada", "anulada"].includes(estado)) {
    throw new Error("Estado inválido");
  }

  const { error } = await supabase.from("facturas").update({ estado }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/facturas");
}

export async function eliminarFactura(id: string) {
  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) throw new Error("No autorizado");

  const { error } = await supabase.from("facturas").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/facturas");
}

export async function enviarFacturaEmail(facturaId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: profile } = await supabase
    .from("profiles").select("role, nombre").eq("id", user.id).single();
  if (profile?.role !== "administrador") return { error: "No autorizado" };

  const { data: factura } = await supabase
    .from("facturas")
    .select("*, cliente:cliente_id(email, nombre)")
    .eq("id", facturaId)
    .single();

  if (!factura) return { error: "Factura no encontrada" };

  const cliente = factura.cliente as any;
  if (!cliente?.email) return { error: "El cliente no tiene email registrado" };

  if (!process.env.RESEND_API_KEY) {
    return { error: "RESEND_API_KEY no configurada" };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Gestek <facturas@gestek.app>",
      to: cliente.email,
      subject: "Factura de servicio - Gestek",
      html: `<p>Estimado/a ${cliente.nombre},</p>
             <p>Adjunto encontrará la factura por los servicios prestados.</p>
             <p><strong>Factura #${factura.id?.slice(0,8).toUpperCase()}</strong></p>
             <p><strong>Monto:</strong> $${Number(factura.monto).toLocaleString("es-CO")}</p>
             <p><strong>Fecha:</strong> ${factura.fecha}</p>
             <p><strong>Estado:</strong> ${factura.estado}</p>
             <br/>
             <p>Saludos cordiales,</p>
             <p><strong>GESTEK</strong></p>`,
    });

    return { success: true };
  } catch (error) {
    console.error("Error enviando email:", error);
    return { error: "Error al enviar el email" };
  }
}
