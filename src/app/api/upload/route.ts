import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import sharp from "sharp";

export const maxDuration = 30;

const WEB_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const CONVERTIBLE_TYPES = [
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
  "image/x-heic",
  "image/x-heif",
  "image/x-adobe-dng",
  "image/x-raw",
  "image/x-raw-adobe",
  "image/dng",
];
const ALLOWED_TYPES = [...WEB_TYPES, ...CONVERTIBLE_TYPES, "application/pdf"];

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  bmp: "image/bmp",
  tiff: "image/tiff",
  tif: "image/tiff",
  heic: "image/heic",
  heif: "image/heif",
  dng: "image/x-adobe-dng",
};

function detectMime(fileName: string, declaredType: string): string {
  if (declaredType && declaredType !== "application/octet-stream") return declaredType;
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return EXT_TO_MIME[ext] || "application/octet-stream";
}

function isConvertible(mime: string): boolean {
  return CONVERTIBLE_TYPES.includes(mime) || mime === "image/x-adobe-dng" || mime === "image/dng";
}

function extFromMime(mime: string): string {
  return EXT_MAP[mime] || (mime.split("/")[1] ?? "bin");
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "127.0.0.1";
    const rl = await rateLimit({ key: `upload:${ip}`, max: 10, windowMs: 60000 });
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

    const mime = detectMime(file.name, file.type);

    if (!ALLOWED_TYPES.includes(mime)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido: " + mime }, { status: 400 });
    }

    let buffer: Buffer = Buffer.from(await file.arrayBuffer());
    let contentType = mime;

    if (!WEB_TYPES.includes(mime)) {
      try {
        buffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
        contentType = "image/jpeg";
      } catch {
        try {
          buffer = await sharp(buffer).png().toBuffer();
          contentType = "image/png";
        } catch {
          return NextResponse.json({ error: "No se pudo convertir la imagen. Formatos soportados: JPEG, PNG, WebP, HEIC, HEIF, DNG, BMP, TIFF." }, { status: 400 });
        }
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
    return NextResponse.json({ url: urlData?.publicUrl || null });
  } catch (err) {
    console.error("Error en POST /api/upload:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
