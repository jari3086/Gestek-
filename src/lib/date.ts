const TIMEZONE = "America/Bogota";

export function hoyBogota(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

export function dentroDeDias(dias: number): string {
  const [y, m, d] = new Date()
    .toLocaleDateString("en-CA", { timeZone: TIMEZONE })
    .split("-")
    .map(Number);
  const target = new Date(y, m - 1, d + dias);
  return target.toISOString().split("T")[0];
}

// Normaliza un valor de fecha para columnas DATE de Postgres:
// cadena vacía / espacios en blanco / null / undefined → null.
export function fechaOpcional(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const v = value.trim();
  return v === "" ? null : v;
}
