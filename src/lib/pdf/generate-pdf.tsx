import { renderToStream } from "@react-pdf/renderer";
import { InformeEquipo } from "./InformeEquipo";
import * as fs from "fs";
import * as path from "path";

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

  const stream = await renderToStream(
    <InformeEquipo
      logoBase64={logoBase64}
      logoClienteBase64={logoClienteBase64}
      equipo={params.equipo}
      cliente={params.cliente}
      sede={params.sede}
      mantenimiento={params.mantenimiento}
    />,
  );

  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) chunks.push(chunk as Uint8Array);
  return Buffer.concat(chunks);
}
