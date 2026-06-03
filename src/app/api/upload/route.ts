import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import sharp from "sharp";

export const maxDuration = 30;

const WEB_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const CONVERTIBLE_TYPES = ["image/bmp", "image/tiff", "image/heic", "image/heif"];
const ALLOWED_TYPES = [...WEB_TYPES, ...CONVERTIBLE_TYPES, "application/pdf"];

function needsConversion(mime: string) {
  return CONVERTIBLE_TYPES.includes(mime);
}

function extFromMime(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  return mime.split("/")[1] ?? "bin";
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "127.0.0.1";
  const rl = rateLimit({ key: `upload:${ip}`, max: 10, windowMs: 60000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });

  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Archivo demasiado grande (máx 10MB)" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido: " + file.type }, { status: 400 });
  }

  let buffer: Buffer = Buffer.from(await file.arrayBuffer());
  let contentType = file.type;

  if (needsConversion(file.type)) {
    try {
      buffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
      contentType = "image/jpeg";
    } catch {
      return NextResponse.json({
        error: `No se pudo convertir ${file.type}. Prueba con JPEG, PNG o WebP.`,
      }, { status: 400 });
    }
  }

  const folder = (formData.get("folder") as string) || "fotos";
  const baseName = file.name.replace(/\s+/g, "-").replace(/\.[^.]+$/, "");
  const fileName = `${folder}/${user.id}/${Date.now()}-${baseName}.${extFromMime(contentType)}`;

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from("informes")
    .upload(fileName, buffer, { contentType, upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = admin.storage.from("informes").getPublicUrl(fileName);
  return NextResponse.json({ url: urlData.publicUrl });
}
