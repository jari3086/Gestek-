export interface PlantillaCheckItem {
  id: string;
  nombre: string;
  obligatorio?: boolean;
}

export type TipoCampoMedicion = "numero" | "texto";

export interface PlantillaMedicion {
  id: string;
  nombre: string;
  unidad: string;
  referencia?: string;
  tipoCampo?: TipoCampoMedicion;
}

export interface GrupoMediciones {
  titulo?: string;
  campos: PlantillaMedicion[];
}

export interface SeccionChecklist {
  id: string;
  titulo?: string;
  tipo: "checklist";
  items: PlantillaCheckItem[];
}

export interface SeccionMediciones {
  id: string;
  titulo?: string;
  tipo: "mediciones";
  grupos: GrupoMediciones[];
}

export type Seccion = SeccionChecklist | SeccionMediciones;

export interface CheckResultItem {
  itemId: string;
  nombre: string;
  cumple: boolean;
  observacion?: string;
}

export interface MedicionResult {
  medicionId: string;
  nombre: string;
  unidad: string;
  valor: string;
}

export interface SeccionChecklistResult {
  id: string;
  titulo?: string;
  tipo: "checklist";
  items: CheckResultItem[];
}

export interface SeccionMedicionesResult {
  id: string;
  titulo?: string;
  tipo: "mediciones";
  grupos: { titulo?: string; campos: MedicionResult[] }[];
}

export type SeccionResultado = SeccionChecklistResult | SeccionMedicionesResult;

export interface ResultadosInforme {
  secciones: SeccionResultado[];
}

export function generarId() {
  return Math.random().toString(36).slice(2, 8);
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function normTipoCampo(v: unknown): TipoCampoMedicion {
  return v === "texto" ? "texto" : "numero";
}

// ============================================================
// Normalización de la plantilla (estructura de secciones)
// ============================================================

/**
 * Normaliza las secciones de una plantilla. Acepta un arreglo de secciones
 * o un objeto `{ secciones: [...] }`.
 */
export function normalizeSecciones(raw: unknown): Seccion[] {
  const arr = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.secciones)
      ? raw.secciones
      : [];
  return arr.filter(isRecord).map((s) => {
    const id = str(s.id) || generarId();
    const titulo = str(s.titulo) || undefined;
    const tipo = s.tipo === "mediciones" ? "mediciones" : "checklist";

    if (tipo === "checklist") {
      const items = (Array.isArray(s.items) ? s.items : [])
        .filter(isRecord)
        .map((i) => ({
          id: str(i.id) || generarId(),
          nombre: str(i.nombre) || (typeof i.item === "string" ? i.item : ""),
          obligatorio: i.obligatorio === true,
        }));
      return { id, titulo, tipo, items };
    }

    const gruposRaw = Array.isArray(s.grupos) ? s.grupos : [];
    if (gruposRaw.length > 0) {
      const grupos = gruposRaw.filter(isRecord).map((g) => ({
        titulo: str(g.titulo) || undefined,
        campos: (Array.isArray(g.campos) ? g.campos : [])
          .filter(isRecord)
          .map((c) => ({
            id: str(c.id) || generarId(),
            nombre: str(c.nombre),
            unidad: str(c.unidad),
            referencia: str(c.referencia) || undefined,
            tipoCampo: normTipoCampo(c.tipoCampo),
          })),
      }));
      return { id, titulo, tipo, grupos };
    }

    // Fallback: sección de mediciones plana (formato previo)
    const flat = (Array.isArray(s.mediciones) ? s.mediciones : [])
      .filter(isRecord)
      .map((c) => ({
        id: str(c.id) || generarId(),
        nombre: str(c.nombre),
        unidad: str(c.unidad),
        referencia: str(c.referencia) || undefined,
        tipoCampo: normTipoCampo(c.tipoCampo),
      }));
    return {
      id,
      titulo,
      tipo,
      grupos: flat.length > 0 ? [{ titulo: undefined, campos: flat }] : [],
    };
  });
}

// ============================================================
// Normalización de resultados (checklist_resultados)
// ============================================================

function normCheckItem(i: Record<string, unknown>) {
  return {
    itemId: str(i.itemId) || str(i.id) || generarId(),
    nombre: str(i.nombre) || (typeof i.item === "string" ? i.item : ""),
    cumple: typeof i.cumple === "boolean" ? i.cumple : i.resultado === "ok",
    observacion: str(i.observacion) || undefined,
  };
}

function normCampoMedicion(c: Record<string, unknown>) {
  return {
    medicionId: str(c.medicionId) || str(c.id) || generarId(),
    nombre: str(c.nombre),
    unidad: str(c.unidad),
    valor: str(c.valor),
  };
}

function normSeccionResultado(s: Record<string, unknown>): SeccionResultado {
  const id = str(s.id) || generarId();
  const titulo = str(s.titulo) || undefined;
  const tipo = s.tipo === "mediciones" ? "mediciones" : "checklist";

  if (tipo === "checklist") {
    const items = (Array.isArray(s.items) ? s.items : [])
      .filter(isRecord)
      .map(normCheckItem);
    return { id, titulo, tipo: "checklist", items };
  }

  const gruposRaw = Array.isArray(s.grupos) ? s.grupos : [];
  if (gruposRaw.length > 0) {
    const grupos = gruposRaw.filter(isRecord).map((g) => ({
      titulo: str(g.titulo) || undefined,
      campos: (Array.isArray(g.campos) ? g.campos : []).filter(isRecord).map(normCampoMedicion),
    }));
    return { id, titulo, tipo: "mediciones", grupos };
  }

  const flat = (Array.isArray(s.mediciones) ? s.mediciones : [])
    .filter(isRecord)
    .map(normCampoMedicion);
  return {
    id,
    titulo,
    tipo: "mediciones",
    grupos: flat.length > 0 ? [{ titulo: undefined, campos: flat }] : [],
  };
}

/**
 * Normaliza los resultados de un checklist almacenados en checklist_resultados.
 *
 * Soporta tres formatos:
 * - Antiguo:      arreglo de { nombre, categoria, resultado: ok|falla|na, observacion }
 * - Intermedio:   { checklist: [...], mediciones: [...] }
 * - Nuevo:        { secciones: [ { id, titulo, tipo, items|grupos } ] }
 */
export function normalizeResultados(raw: unknown): ResultadosInforme {
  if (Array.isArray(raw)) {
    const items = raw.filter(isRecord).map(normCheckItem);
    return {
      secciones: [
        { id: generarId(), titulo: undefined, tipo: "checklist", items },
      ],
    };
  }

  const obj = isRecord(raw) ? raw : {};

  if (Array.isArray(obj.secciones)) {
    return { secciones: obj.secciones.filter(isRecord).map(normSeccionResultado) };
  }

  // Formato intermedio { checklist, mediciones }
  const secciones: SeccionResultado[] = [];
  const checklistRaw = Array.isArray(obj.checklist) ? obj.checklist : [];
  const medicionesRaw = Array.isArray(obj.mediciones) ? obj.mediciones : [];

  if (checklistRaw.length > 0) {
    secciones.push({
      id: generarId(),
      titulo: undefined,
      tipo: "checklist",
      items: checklistRaw.filter(isRecord).map(normCheckItem),
    });
  }
  if (medicionesRaw.length > 0) {
    secciones.push({
      id: generarId(),
      titulo: undefined,
      tipo: "mediciones",
      grupos: [
        { titulo: undefined, campos: medicionesRaw.filter(isRecord).map(normCampoMedicion) },
      ],
    });
  }
  return { secciones };
}

// ============================================================
// Helpers de plantillas (retrocompatibilidad)
// ============================================================

export function normalizeChecklistItems(raw: unknown): PlantillaCheckItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((i) => ({
      id: str(i.id) || generarId(),
      nombre: str(i.nombre) || (typeof i.item === "string" ? i.item : ""),
      obligatorio: i.obligatorio === true,
    }));
}

export function normalizeMediciones(raw: unknown): PlantillaMedicion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((m) => ({
      id: str(m.id) || generarId(),
      nombre: str(m.nombre),
      unidad: str(m.unidad),
      referencia: str(m.referencia) || undefined,
      tipoCampo: normTipoCampo(m.tipoCampo),
    }));
}
