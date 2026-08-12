import { renderToStream } from "@react-pdf/renderer";
import { InformeEquipo } from "./InformeEquipo";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

function detectImageMime(buf: Buffer): string | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length > 8 && buf.toString("latin1", 1, 4) === "PNG") return "image/png";
  if (buf.length > 12 && buf.toString("latin1", 0, 4) === "RIFF" && buf.toString("latin1", 8, 12) === "WEBP") return "image/webp";
  if (buf.length > 6 && (buf.toString("latin1", 0, 6) === "GIF87a" || buf.toString("latin1", 0, 6) === "GIF89a")) return "image/gif";
  return null;
}

async function fotoToDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    try {
      const out = await sharp(buf)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      return `data:image/jpeg;base64,${out.toString("base64")}`;
    } catch {
      const mime = detectImageMime(buf);
      return mime ? `data:${mime};base64,${buf.toString("base64")}` : null;
    }
  } catch {
    return null;
  }
}

export async function generatePdfBuffer(params: {
  equipo: any;
  cliente: any;
  mantenimiento: any;
  sede?: any;
}) {
  let logoBase64: string | null = null;
  try {
    const logoPath = path.join(process.cwd(), "public", "logo gestek.png");
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch { /* ignore */ }

  let logoClienteBase64: string | null = null;
  const logoClienteUrl = params.cliente?.logo_url;
  if (logoClienteUrl) {
    try {
      const res = await fetch(logoClienteUrl);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        logoClienteBase64 = `data:image/png;base64,${buf.toString("base64")}`;
      }
    } catch { /* ignore */ }
  }

  // Normalizar fotos a JPEG (data-URI) para garantizar la incrustación en el PDF
  const fotosUrl = params.mantenimiento?.fotos;
  let fotos: string[] = [];
  if (Array.isArray(fotosUrl) && fotosUrl.length > 0) {
    fotos = (await Promise.all(fotosUrl.map(fotoToDataUri))).filter((u): u is string => Boolean(u));
  }

  const stream = await renderToStream(
    <InformeEquipo
      logoBase64={logoBase64}
      logoClienteBase64={logoClienteBase64}
      equipo={params.equipo}
      cliente={params.cliente}
      sede={params.sede}
      mantenimiento={{ ...params.mantenimiento, fotos }}
    />,
  );

  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) chunks.push(chunk as Uint8Array);
  return Buffer.concat(chunks);
}
