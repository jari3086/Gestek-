import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

const mockLimit = vi.fn();

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({}),
  },
}));

vi.mock("@upstash/ratelimit", () => {
  const Ratelimit = vi.fn(function () {
    return { limit: mockLimit };
  });
  Ratelimit.slidingWindow = vi.fn();
  return { Ratelimit };
});

describe("rateLimit", () => {
  beforeAll(() => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
  });

  beforeEach(() => {
    mockLimit.mockReset();
  });

  it("permite la primera solicitud", async () => {
    mockLimit.mockResolvedValue({ success: true, limit: 3, remaining: 2, reset: Date.now() + 60000 });
    const result = await rateLimit({ key: "test-1", max: 3, windowMs: 60000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("permite hasta el límite", async () => {
    mockLimit
      .mockResolvedValueOnce({ success: true, limit: 3, remaining: 2, reset: 0 })
      .mockResolvedValueOnce({ success: true, limit: 3, remaining: 1, reset: 0 })
      .mockResolvedValueOnce({ success: true, limit: 3, remaining: 0, reset: 0 });

    for (let i = 0; i < 3; i++) {
      const result = await rateLimit({ key: "test-2", max: 3, windowMs: 60000 });
      expect(result.allowed).toBe(true);
    }
  });

  it("bloquea después de exceder el límite", async () => {
    mockLimit
      .mockResolvedValueOnce({ success: true, limit: 3, remaining: 2, reset: 0 })
      .mockResolvedValueOnce({ success: true, limit: 3, remaining: 1, reset: 0 })
      .mockResolvedValueOnce({ success: true, limit: 3, remaining: 0, reset: 0 })
      .mockResolvedValueOnce({ success: false, limit: 3, remaining: 0, reset: 0 });

    for (let i = 0; i < 3; i++) {
      await rateLimit({ key: "test-3", max: 3, windowMs: 60000 });
    }
    const result = await rateLimit({ key: "test-3", max: 3, windowMs: 60000 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("keys diferentes no se afectan entre sí", async () => {
    mockLimit
      .mockResolvedValueOnce({ success: true, limit: 2, remaining: 1, reset: 0 })
      .mockResolvedValueOnce({ success: true, limit: 2, remaining: 1, reset: 0 })
      .mockResolvedValueOnce({ success: true, limit: 2, remaining: 0, reset: 0 })
      .mockResolvedValueOnce({ success: false, limit: 2, remaining: 0, reset: 0 })
      .mockResolvedValueOnce({ success: true, limit: 2, remaining: 0, reset: 0 });

    const resultA1 = await rateLimit({ key: "key-a", max: 2, windowMs: 60000 });
    expect(resultA1.allowed).toBe(true);

    const resultB1 = await rateLimit({ key: "key-b", max: 2, windowMs: 60000 });
    expect(resultB1.allowed).toBe(true);

    const resultA2 = await rateLimit({ key: "key-a", max: 2, windowMs: 60000 });
    expect(resultA2.allowed).toBe(true);

    const resultA3 = await rateLimit({ key: "key-a", max: 2, windowMs: 60000 });
    expect(resultA3.allowed).toBe(false);

    const resultB2 = await rateLimit({ key: "key-b", max: 2, windowMs: 60000 });
    expect(resultB2.allowed).toBe(true);
  });

  it("usa valores por defecto (30 req / 60s)", async () => {
    mockLimit.mockResolvedValue({ success: true, limit: 30, remaining: 29, reset: Date.now() + 60000 });
    const result = await rateLimit({ key: "test-default" });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29);
  });
});
