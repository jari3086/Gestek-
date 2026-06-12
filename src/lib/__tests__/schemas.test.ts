import { describe, it, expect } from "vitest";
import {
  equipoSchema,
  facturaSchema,
  clienteSchema,
  plantillaSchema,
  loginSchema,
} from "@/lib/schemas";

// ========================================
// equipoSchema
// ========================================
describe("equipoSchema", () => {
  const validEquipo = {
    nombre: "Ventilador Mecánico",
    tipo: "Biomédico",
    serie: "SN-001",
    ubicacion: "UCIA - Piso 3",
    cliente_id: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("acepta datos válidos con valores mínimos", () => {
    const result = equipoSchema.safeParse(validEquipo);
    expect(result.success).toBe(true);
  });

  it("acepta todos los campos opcionales", () => {
    const result = equipoSchema.safeParse({
      ...validEquipo,
      id_cliente: "CLI-001",
      marca: "Drager",
      modelo: "Savina 300",
      accesorios: "Mangueras, filtros",
      fecha_ultimo_mantenimiento: "2025-12-15",
      fecha_proximo_mantenimiento: "2026-06-15",
      periodicidad_mantenimiento: "6",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza nombre vacío", () => {
    const result = equipoSchema.safeParse({ ...validEquipo, nombre: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza serie vacía", () => {
    const result = equipoSchema.safeParse({ ...validEquipo, serie: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza ubicación vacía", () => {
    const result = equipoSchema.safeParse({ ...validEquipo, ubicacion: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza cliente_id no UUID", () => {
    const result = equipoSchema.safeParse({ ...validEquipo, cliente_id: "no-es-uuid" });
    expect(result.success).toBe(false);
  });

  it("rechaza periodicidad fuera de rango (negativo)", () => {
    const result = equipoSchema.safeParse({ ...validEquipo, periodicidad_mantenimiento: "-1" });
    expect(result.success).toBe(false);
  });

  it("rechaza periodicidad fuera de rango (>60)", () => {
    const result = equipoSchema.safeParse({ ...validEquipo, periodicidad_mantenimiento: "61" });
    expect(result.success).toBe(false);
  });

  it("acepta periodicidad 0 (no recurrente)", () => {
    const result = equipoSchema.safeParse({ ...validEquipo, periodicidad_mantenimiento: "0" });
    expect(result.success).toBe(true);
  });

  it("rechaza nombre > 200 caracteres", () => {
    const result = equipoSchema.safeParse({ ...validEquipo, nombre: "a".repeat(201) });
    expect(result.success).toBe(false);
  });
});

// ========================================
// facturaSchema
// ========================================
describe("facturaSchema", () => {
  const validFactura = {
    cliente_id: "550e8400-e29b-41d4-a716-446655440000",
    monto: "2500000",
  };

  it("acepta datos mínimos válidos", () => {
    const result = facturaSchema.safeParse(validFactura);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estado).toBe("emitida");
      expect(result.data.moneda).toBe("COP");
      expect(result.data.forma_pago).toBe("contado");
      expect(result.data.tipo_documento).toBe("factura");
    }
  });

  it("rechaza monto negativo", () => {
    const result = facturaSchema.safeParse({ ...validFactura, monto: "-100" });
    expect(result.success).toBe(false);
  });

  it("rechaza monto cero", () => {
    const result = facturaSchema.safeParse({ ...validFactura, monto: "0" });
    expect(result.success).toBe(false);
  });

  it("rechaza cliente_id vacío", () => {
    const result = facturaSchema.safeParse({ ...validFactura, cliente_id: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza estado inválido", () => {
    const result = facturaSchema.safeParse({ ...validFactura, estado: "cancelada" });
    expect(result.success).toBe(false);
  });

  it("acepta todos los campos DIAN", () => {
    const result = facturaSchema.safeParse({
      ...validFactura,
      subtotal: "2100840.34",
      total_iva: "399159.66",
      total: "2500000",
      retencion_fuente: "50000",
      retencion_iva: "0",
      retencion_ica: "0",
      tipo_documento: "factura",
      prefijo: "FE1",
      numero_consecutivo: "1",
      forma_pago: "credito",
      medio_pago: "transferencia",
      moneda: "COP",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza forma_pago inválida", () => {
    const result = facturaSchema.safeParse({ ...validFactura, forma_pago: "debito" });
    expect(result.success).toBe(false);
  });

  it("rechaza tipo_documento inválido", () => {
    const result = facturaSchema.safeParse({ ...validFactura, tipo_documento: "recibo" });
    expect(result.success).toBe(false);
  });

  it("rechaza prefijo > 10 caracteres", () => {
    const result = facturaSchema.safeParse({ ...validFactura, prefijo: "FE1-ABCDEFGH" });
    expect(result.success).toBe(false);
  });
});

// ========================================
// clienteSchema
// ========================================
describe("clienteSchema", () => {
  const validCliente = {
    nombre: "Hospital Central SAS",
    email: "contacto@hospital.com",
  };

  it("acepta datos mínimos", () => {
    const result = clienteSchema.safeParse(validCliente);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.regimen).toBe("ordinario");
      expect(result.data.tipo_persona).toBe("juridica");
    }
  });

  it("rechaza nombre vacío", () => {
    const result = clienteSchema.safeParse({ ...validCliente, nombre: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza email inválido", () => {
    const result = clienteSchema.safeParse({ ...validCliente, email: "no-es-email" });
    expect(result.success).toBe(false);
  });

  it("rechaza email vacío", () => {
    const result = clienteSchema.safeParse({ ...validCliente, email: "" });
    expect(result.success).toBe(false);
  });

  it("acepta todos los campos fiscales", () => {
    const result = clienteSchema.safeParse({
      ...validCliente,
      telefono: "+57 601 2345678",
      nit: "900123456-7",
      direccion: "Carrera 45 # 23-15",
      ciudad: "Bogotá",
      regimen: "simple",
      tipo_persona: "natural",
      departamento: "Cundinamarca",
      codigo_postal: "110111",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza regimen inválido", () => {
    const result = clienteSchema.safeParse({ ...validCliente, regimen: "no-existe" });
    expect(result.success).toBe(false);
  });
});

// ========================================
// plantillaSchema
// ========================================
describe("plantillaSchema", () => {
  it("acepta nombre e items válidos", () => {
    const result = plantillaSchema.safeParse({
      nombre: "Checklist Ventilador",
      items: '[{"item":"Filtros","tipo":"check"}]',
    });
    expect(result.success).toBe(true);
  });

  it("rechaza nombre vacío", () => {
    const result = plantillaSchema.safeParse({ nombre: "", items: "[]" });
    expect(result.success).toBe(false);
  });

  it("rechaza items vacío", () => {
    const result = plantillaSchema.safeParse({ nombre: "Test", items: "" });
    expect(result.success).toBe(false);
  });
});

// ========================================
// loginSchema
// ========================================
describe("loginSchema", () => {
  it("acepta credenciales válidas", () => {
    const result = loginSchema.safeParse({
      email: "admin@gestek.app",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza email inválido", () => {
    const result = loginSchema.safeParse({
      email: "no-email",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza password menor a 6 caracteres", () => {
    const result = loginSchema.safeParse({
      email: "admin@gestek.app",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza email vacío", () => {
    const result = loginSchema.safeParse({ email: "", password: "123456" });
    expect(result.success).toBe(false);
  });
});
