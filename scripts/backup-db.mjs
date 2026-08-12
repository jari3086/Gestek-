import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = resolve(__dirname, "..", ".env.local");
const envRaw = readFileSync(envPath, "utf-8");

const supabaseUrl = envRaw.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const serviceRoleKey = envRaw.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.error("No se pudieron leer las credenciales de .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TABLES = [
  { name: "config_fiscal", order: 1 },
  { name: "profiles", order: 2 },
  { name: "sedes", order: 3 },
  { name: "plantillas", order: 4 },
  { name: "equipos", order: 5 },
  { name: "mantenimientos", order: 6 },
  { name: "checklist_resultados", order: 7 },
  { name: "fotos_mantenimiento", order: 8 },
  { name: "facturas", order: 9 },
  { name: "audit_log", order: 10 },
].sort((a, b) => a.order - b.order);

function escapeSQL(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return String(val);
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "object") {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

function rowToInsert(table, row) {
  const keys = Object.keys(row);
  const values = keys.map((k) => escapeSQL(row[k]));
  return `INSERT INTO ${table} (${keys.map((k) => `"${k}"`).join(", ")}) VALUES (${values.join(", ")});`;
}

async function fetchAllRows(table) {
  const allRows = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + pageSize - 1);

    if (error) {
      if (error.code === "PGRST116" || error.message?.includes("does not exist")) {
        console.warn(`  ↳ Tabla '${table}' no existe, saltando`);
        return null;
      }
      throw error;
    }

    if (!data || data.length === 0) break;

    allRows.push(...data);

    if (data.length < pageSize) break;

    from += pageSize;
  }

  return allRows;
}

async function main() {
  console.log("Iniciando backup de la base de datos...\n");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputPath = resolve(__dirname, "..", `backup-${timestamp}.sql`);

  const lines = [
    `-- ============================================`,
    `-- Backup generado el: ${new Date().toISOString()}`,
    `-- Base de datos: ${supabaseUrl}`,
    `-- ============================================`,
    ``,
    `BEGIN;`,
    ``,
  ];

  for (const { name } of TABLES) {
    process.stdout.write(`  → Exportando ${name}... `);
    const rows = await fetchAllRows(name);

    if (!rows) {
      process.stdout.write("saltada\n");
      continue;
    }

    if (rows.length === 0) {
      process.stdout.write("0 filas\n");
      continue;
    }

    process.stdout.write(`${rows.length} filas\n`);

    lines.push(`-- ${name} (${rows.length} filas)`);

    for (const row of rows) {
      lines.push(rowToInsert(name, row));
    }

    lines.push("");
  }

  lines.push(`COMMIT;`);
  lines.push("");

  writeFileSync(outputPath, lines.join("\n"), "utf-8");

  console.log(`\n✅ Backup completado: ${outputPath}`);
  console.log(`   Total de tablas exportadas: ${TABLES.length}`);
}

main().catch((err) => {
  console.error("Error durante el backup:", err);
  process.exit(1);
});
