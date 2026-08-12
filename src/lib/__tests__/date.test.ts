import { describe, it, expect } from "vitest";
import { fechaOpcional } from "@/lib/date";

describe("fechaOpcional", () => {
  it("convierte cadena vacía a null", () => {
    expect(fechaOpcional("")).toBeNull();
  });

  it("convierte espacios en blanco a null", () => {
    expect(fechaOpcional("   ")).toBeNull();
  });

  it("convierte null/undefined a null", () => {
    expect(fechaOpcional(null)).toBeNull();
    expect(fechaOpcional(undefined)).toBeNull();
  });

  it("conserva fechas válidas", () => {
    expect(fechaOpcional("2026-08-11")).toBe("2026-08-11");
  });

  it("conserva fechas con espacios circundantes", () => {
    expect(fechaOpcional(" 2026-08-11 ")).toBe("2026-08-11");
  });
});
