import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // El rate limiter usa un Map global, necesitamos resetearlo
    // Accedemos internamente — como es un módulo ES, la store es privada.
    // Probamos el comportamiento observable.
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("permite la primera solicitud", () => {
    const result = rateLimit({ key: "test-1", max: 3, windowMs: 60000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("permite hasta el límite", () => {
    const key = "test-2";
    // Primeras 3 requests deben ser permitidas
    for (let i = 0; i < 3; i++) {
      const result = rateLimit({ key, max: 3, windowMs: 60000 });
      expect(result.allowed).toBe(true);
    }
  });

  it("bloquea después de exceder el límite", () => {
    const key = "test-3";
    // Usar las 3
    for (let i = 0; i < 3; i++) {
      rateLimit({ key, max: 3, windowMs: 60000 });
    }
    // La 4ta debe ser bloqueada
    const result = rateLimit({ key, max: 3, windowMs: 60000 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("restablece después de la ventana de tiempo", () => {
    const key = "test-4";
    // Usar todas las requests
    for (let i = 0; i < 3; i++) {
      rateLimit({ key, max: 3, windowMs: 60000 });
    }
    // Avanzar 61s para que expire la ventana
    vi.advanceTimersByTime(61000);
    // Debe permitir de nuevo
    const result = rateLimit({ key, max: 3, windowMs: 60000 });
    expect(result.allowed).toBe(true);
  });

  it("keys diferentes no se afectan entre sí", () => {
    const resultA1 = rateLimit({ key: "key-a", max: 2, windowMs: 60000 });
    expect(resultA1.allowed).toBe(true);

    const resultB1 = rateLimit({ key: "key-b", max: 2, windowMs: 60000 });
    expect(resultB1.allowed).toBe(true);

    const resultA2 = rateLimit({ key: "key-a", max: 2, windowMs: 60000 });
    expect(resultA2.allowed).toBe(true);

    // key-a ya usó sus 2, debe bloquear
    const resultA3 = rateLimit({ key: "key-a", max: 2, windowMs: 60000 });
    expect(resultA3.allowed).toBe(false);

    // key-b solo usó 1, debe permitir
    const resultB2 = rateLimit({ key: "key-b", max: 2, windowMs: 60000 });
    expect(resultB2.allowed).toBe(true);
  });

  it("usa valores por defecto (30 req / 60s)", () => {
    const result = rateLimit({ key: "test-default" });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29);
  });
});
