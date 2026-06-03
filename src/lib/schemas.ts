import { z } from "zod/v4";
import { hoyBogota } from "@/lib/date";

export const equipoSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(200),
  tipo: z.string().min(1, "Tipo requerido").max(100),
  id_cliente: z.string().max(100).optional().default(""),
  marca: z.string().max(100).optional().default(""),
  modelo: z.string().max(100).optional().default(""),
  serie: z.string().min(1, "Serie requerida").max(100),
  accesorios: z.string().max(500).optional().default(""),
  ubicacion: z.string().min(1, "Ubicación requerida").max(300),
  cliente_id: z.string().uuid("Cliente inválido").min(1),
  fecha_ultimo_mantenimiento: z.string().optional().default(""),
  fecha_proximo_mantenimiento: z.string().optional().default(""),
  fecha_ultima_calibracion: z.string().optional().default(""),
  fecha_proxima_calibracion: z.string().optional().default(""),
  periodicidad_mantenimiento: z.coerce.number().int().min(0).max(60).optional().default(0),
});

export const facturaSchema = z.object({
  cliente_id: z.string().uuid("Cliente inválido").min(1),
  monto: z.coerce.number().positive("Monto debe ser positivo"),
  fecha: z.string().optional().default(() => hoyBogota()),
  estado: z.enum(["emitida", "pagada", "anulada"]).default("emitida"),
  subtotal: z.coerce.number().min(0).optional().default(0),
  total_iva: z.coerce.number().min(0).optional().default(0),
  total: z.coerce.number().min(0).optional().default(0),
  retencion_fuente: z.coerce.number().min(0).optional().default(0),
  retencion_iva: z.coerce.number().min(0).optional().default(0),
  retencion_ica: z.coerce.number().min(0).optional().default(0),
  tipo_documento: z.enum(["factura", "nota_credito", "nota_debito"]).optional().default("factura"),
  prefijo: z.string().max(10).optional().default(""),
  numero_consecutivo: z.coerce.number().int().positive().optional(),
  fecha_emision: z.string().optional(),
  fecha_vencimiento: z.string().optional(),
  forma_pago: z.enum(["contado", "credito"]).optional().default("contado"),
  medio_pago: z.string().max(50).optional().default(""),
  moneda: z.string().max(3).optional().default("COP"),
});

export const clienteSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(200),
  email: z.string().email("Email inválido"),
  telefono: z.string().max(50).optional().default(""),
  nit: z.string().max(50).optional().default(""),
  direccion: z.string().max(300).optional().default(""),
  ciudad: z.string().max(100).optional().default(""),
  regimen: z.enum(["comun", "simplificado"]).optional().default("comun"),
  tipo_persona: z.enum(["natural", "juridica"]).optional().default("juridica"),
  departamento: z.string().max(100).optional().default(""),
  codigo_postal: z.string().max(20).optional().default(""),
});

export const plantillaSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(200),
  items: z.string().min(1, "Items requeridos"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
});
