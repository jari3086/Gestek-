import { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function checkAdmin(
  supabase?: SupabaseClient,
): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const client = supabase ?? await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { authorized: false, error: "No autenticado" };

  const { data: profile } = await client
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "administrador") {
    return { authorized: false, error: "No autorizado" };
  }

  return { authorized: true, userId: user.id };
}

export async function isAdmin(
  supabase?: SupabaseClient,
): Promise<boolean> {
  const result = await checkAdmin(supabase);
  return result.authorized;
}

export async function getCurrentUser(supabase?: SupabaseClient) {
  const client = supabase ?? await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;

  const { data: profile } = await client
    .from("profiles")
    .select("role, nombre, email")
    .eq("id", user.id)
    .single();

  return { user, profile };
}