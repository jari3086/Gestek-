import { NextResponse } from "next/server";

async function findUserByEmail(email: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?filter%5Bemail%5D=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      },
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.users?.[0] ?? null;
}

export async function GET() {
  const adminEmail = process.env.ADMIN_SETUP_EMAIL;
  const adminPassword = process.env.ADMIN_SETUP_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: "Configura ADMIN_SETUP_EMAIL y ADMIN_SETUP_PASSWORD en las variables de entorno" },
      { status: 500 },
    );
  }

  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // 1. Check if profile already exists with correct role
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id, role")
    .eq("email", adminEmail)
    .maybeSingle();

  if (existingProfile) {
    if (existingProfile.role === "administrador") {
      return NextResponse.json({ message: "Admin ya existe con el rol correcto" });
    }
    // Profile exists but with wrong role — fix it
    await admin.from("profiles").update({ role: "administrador" }).eq("id", existingProfile.id);
    return NextResponse.json({ message: "Rol corregido a administrador. Intenta iniciar sesión." });
  }

  // 2. Check if auth user exists (via GoTrue Admin API directo)
  const authUser = await findUserByEmail(adminEmail);

  if (authUser) {
    // Auth user exists but no profile — crearlo y resetear contraseña
    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${authUser.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: adminPassword,
          email_confirm: true,
          user_metadata: { nombre: "Administrador", role: "administrador" },
        }),
      },
    );

    await admin.from("profiles").upsert({
      id: authUser.id,
      nombre: "Administrador",
      email: adminEmail,
      role: "administrador",
    });

    return NextResponse.json({ message: "Perfil creado y contraseña restablecida. Ya puedes iniciar sesión." });
  }

  // 3. No existe nada — crear desde cero
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { nombre: "Administrador", role: "administrador" },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  await admin.from("profiles").upsert({
    id: authData.user.id,
    nombre: "Administrador",
    email: adminEmail,
    role: "administrador",
  });

  return NextResponse.json({ message: "Admin creado exitosamente. Ya puedes iniciar sesión." });
}
