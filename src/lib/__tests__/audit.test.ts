import { describe, it, expect, vi, beforeEach } from "vitest";
import { logAudit } from "@/lib/audit";

const mockRpc = vi.fn();
const mockFrom = vi.fn(() => ({ insert: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve({
    rpc: mockRpc,
    from: mockFrom,
  })),
}));

describe("logAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("llama al RPC insert_audit_log con los datos correctos", async () => {
    mockRpc.mockResolvedValue({ error: null });

    await logAudit({
      userId: "user-123",
      action: "crear",
      entity: "equipos",
      entityId: "equipo-456",
    });

    expect(mockRpc).toHaveBeenCalledWith("insert_audit_log", {
      p_user_id: "user-123",
      p_action: "crear",
      p_entity: "equipos",
      p_entity_id: "equipo-456",
      p_details: null,
    });
  });

  it("incluye details cuando se proporciona", async () => {
    mockRpc.mockResolvedValue({ error: null });

    await logAudit({
      userId: "user-123",
      action: "actualizar",
      entity: "facturas",
      entityId: "fact-789",
      details: { campo: "monto", valorAnterior: 1000, valorNuevo: 2000 },
    });

    expect(mockRpc).toHaveBeenCalledWith(
      "insert_audit_log",
      expect.objectContaining({
        p_details: { campo: "monto", valorAnterior: 1000, valorNuevo: 2000 },
      })
    );
  });

  it("no lanza error si el RPC falla", async () => {
    mockRpc.mockRejectedValue(new Error("DB error"));

    await expect(
      logAudit({
        userId: "user-123",
        action: "eliminar",
        entity: "equipos",
      })
    ).resolves.toBeUndefined();
  });
});
