import { describe, it, expect } from "vitest";
import {
  normalizeSecciones,
  normalizeResultados,
  normalizeChecklistItems,
  normalizeMediciones,
  type Seccion,
} from "@/lib/checklist";

function itemsOf(s: Seccion) {
  return s.tipo === "checklist" ? s.items : [];
}

function gruposOf(s: Seccion) {
  return s.tipo === "mediciones" ? s.grupos : [];
}

describe("normalizeSecciones", () => {
  it("acepta objeto { secciones: [...] }", () => {
    const result = normalizeSecciones({
      secciones: [
        { id: "s1", tipo: "checklist", items: [{ id: "a1", nombre: "Verificar fusibles" }] },
      ],
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: "s1", tipo: "checklist" });
  });

  it("genera ids faltantes", () => {
    const result = normalizeSecciones([
      { tipo: "checklist", items: [{ nombre: "Sin id" }] },
    ]);
    expect(result[0].id).toBeTruthy();
    expect(itemsOf(result[0])[0].id).toBeTruthy();
  });

  it("convierte mediciones planas en un grupo", () => {
    const result = normalizeSecciones([
      { id: "s2", tipo: "mediciones", mediciones: [{ id: "m1", nombre: "Voltaje", unidad: "VAC" }] },
    ]);
    expect(result[0].tipo).toBe("mediciones");
    expect(gruposOf(result[0])[0].campos).toHaveLength(1);
  });

  it("convierte formato viejo de items {item, tipo}", () => {
    const result = normalizeSecciones([
      { id: "s3", tipo: "checklist", items: [{ item: "Filtros", tipo: "check" }] },
    ]);
    expect(itemsOf(result[0])[0].nombre).toBe("Filtros");
  });

  it("descarta entradas no-objeto", () => {
    const result = normalizeSecciones(["texto", null, 42]);
    expect(result).toHaveLength(0);
  });

  it("asume tipo checklist para secciones sin tipo", () => {
    const result = normalizeSecciones([{ titulo: "sin tipo" }]);
    expect(result).toHaveLength(1);
    expect(result[0].tipo).toBe("checklist");
  });
});

describe("normalizeResultados", () => {
  it("mantiene formato nuevo { secciones: [...] }", () => {
    const result = normalizeResultados({
      secciones: [
        {
          id: "s1",
          tipo: "checklist",
          items: [{ itemId: "a1", nombre: "Filtros", cumple: true }],
        },
      ],
    });
    expect(result.secciones).toHaveLength(1);
    expect(result.secciones[0]).toMatchObject({ id: "s1", tipo: "checklist" });
  });

  it("convierte formato intermedio { checklist, mediciones }", () => {
    const result = normalizeResultados({
      checklist: [{ itemId: "a1", nombre: "Aceite", cumple: true }],
      mediciones: [{ medicionId: "m1", nombre: "Voltaje", unidad: "VAC", valor: "120" }],
    });
    expect(result.secciones).toHaveLength(2);
    expect(result.secciones[0].tipo).toBe("checklist");
    expect(result.secciones[1].tipo).toBe("mediciones");
  });

  it("convierte formato antiguo (arreglo)", () => {
    const result = normalizeResultados([
      { nombre: "Aceite", categoria: "Motor", resultado: "ok", observacion: "" },
      { nombre: "Filtros", categoria: "General", resultado: "falla" },
    ]);
    expect(result.secciones).toHaveLength(1);
    expect(result.secciones[0].tipo).toBe("checklist");
    if (result.secciones[0].tipo === "checklist") {
      expect(result.secciones[0].items).toHaveLength(2);
      expect(result.secciones[0].items[0].cumple).toBe(true);
      expect(result.secciones[0].items[1].cumple).toBe(false);
    }
  });

  it("normaliza resultados de mediciones en grupos", () => {
    const result = normalizeResultados({
      secciones: [
        {
          id: "s2",
          tipo: "mediciones",
          grupos: [{ titulo: "Fuente", campos: [{ medicionId: "m1", nombre: "Voltaje", unidad: "VAC", valor: "119.9" }] }],
        },
      ],
    });
    expect(result.secciones[0].tipo).toBe("mediciones");
    if (result.secciones[0].tipo === "mediciones") {
      expect(result.secciones[0].grupos[0].campos[0].valor).toBe("119.9");
    }
  });
});

describe("normalizeChecklistItems / normalizeMediciones", () => {
  it("normaliza items legacy", () => {
    const items = normalizeChecklistItems([{ item: "Filtros", tipo: "check" }]);
    expect(items[0]).toMatchObject({ nombre: "Filtros" });
    expect(items[0].id).toBeTruthy();
  });

  it("normaliza mediciones legacy con tipo de campo", () => {
    const mediciones = normalizeMediciones([{ nombre: "Voltaje", unidad: "VAC", tipoCampo: "texto" }]);
    expect(mediciones[0]).toMatchObject({ nombre: "Voltaje", unidad: "VAC", tipoCampo: "texto" });
  });

  it("devuelve arreglo vacío para entradas no-array", () => {
    expect(normalizeChecklistItems(null)).toEqual([]);
    expect(normalizeMediciones({})).toEqual([]);
  });
});
