import { createClient } from "@/lib/supabase/server";

export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  details,
}: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
}) {
  try {
    const supabase = await createClient();
    await supabase.rpc("insert_audit_log", {
      p_user_id: userId,
      p_action: action,
      p_entity: entity,
      p_entity_id: entityId ?? null,
      p_details: details ?? null,
    });
  } catch {
    // Fire-and-forget: no debe interrumpir la operación principal
  }
}
