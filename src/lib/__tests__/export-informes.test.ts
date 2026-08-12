import { describe, it, expect } from "vitest";
import { buildFilasHistorial } from "@/lib/export-informes";

const equipos = [
  {
    id: "eq-1",
    nombre: "Ventilador",
    modelo: "Savina 300",
    marca: "Drager",
    serie: "DRG-1",
    ubicacion: "UCIA",
    id_cliente: "G-001",
    sede: { nombre: "Sede Central" },
    cliente: { nombre: "Hospital Central" },
  },
  {
    id: "eq-2",
    nombre: "Desfibrilador",
    modelo: "R Series",
    marca: "Zoll",
    serie: "ZL-1",
    ubicacion: "Urgencias",
    id_cliente: "G-002",
    sede: { nombre: "Sede Sur" },
    cliente: { nombre: "Clinica del Norte" },
  },
];

const mantenimientos = [
  { equipo_id: "eq-1", tipo: "Mantenimiento preventivo", fecha: "2026-06-01", numero_informe: "INF-100" },
  { equipo_id: "eq-1", tipo: "Calibración", fecha: "2026-07-01", numero_informe: "INF-101" },
];

describe("buildFilasHistorial", () => {
  it("incluye la columna Cliente para admin y genera una fila por informe", () => {
    const filas = buildFilasHistorial(equipos, mantenimientos, false);
    expect(filas).toHaveLength(3);
    expect(Object.keys(filas[0])).toEqual([
      "Cliente", "Sede", "Equipo", "ID cliente", "Modelo", "Marca",
      "Serie", "Ubicación", "Servicio", "N° de informe", "Fecha",
    ]);
    expect(filas[0]).toMatchObject({
      Cliente: "Hospital Central",
      Equipo: "Ventilador",
      Servicio: "Mantenimiento preventivo",
      "N° de informe": "INF-100",
      Fecha: "2026-06-01",
    });
    expect(filas[1].Servicio).toBe("Calibración");
  });

  it("marca Sin registro para equipos sin informes", () => {
    const filas = buildFilasHistorial(equipos, mantenimientos, false);
    const sinRegistro = filas.find((f) => f.Equipo === "Desfibrilador");
    expect(sinRegistro).toMatchObject({
      Servicio: "Sin registro",
      "N° de informe": "Sin registro",
      Fecha: "Sin registro",
    });
  });

  it("omite la columna Cliente para el rol cliente", () => {
    const filas = buildFilasHistorial(equipos, mantenimientos, true);
    expect(Object.keys(filas[0])).not.toContain("Cliente");
    expect(Object.keys(filas[0])[0]).toBe("Sede");
  });

  it("devuelve arreglo vacío sin equipos", () => {
    expect(buildFilasHistorial([], mantenimientos, false)).toEqual([]);
  });
});