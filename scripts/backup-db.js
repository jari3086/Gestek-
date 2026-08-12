const https = require('https');
const fs = require('fs');
const path = require('path');

const envRaw = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
function env(key) {
  const m = envRaw.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return m ? m[1].trim() : '';
}

const SUPABASE_URL = env('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_ROLE_KEY = env('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('FATAL: No se encontraron NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const HOST = SUPABASE_URL.replace('https://', '');

const TABLE_ORDER = [
  'config_fiscal',
  'profiles',
  'sedes',
  'equipos',
  'plantillas',
  'mantenimientos',
  'checklist_resultados',
  'fotos_mantenimiento',
  'facturas',
  'audit_log',
];

const JSONB_COLUMNS = {
  audit_log: ['details'],
};

function fetchTable(table) {
  return new Promise((resolve, reject) => {
    const path = `/rest/v1/${table}?select=*`;
    const opts = {
      hostname: HOST,
      path: path,
      method: 'GET',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`${table}: HTTP ${res.statusCode} — ${data}`));
          return;
        }
        try {
          resolve({ rows: JSON.parse(data), table });
        } catch {
          reject(new Error(`Parse error for ${table}: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function escapeVal(val, isJsonb) {
  if (val === null || val === undefined) return 'NULL';
  if (isJsonb) {
    const json = JSON.stringify(val);
    return `'${json.replace(/'/g, "''")}'::jsonb`;
  }
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'number') return String(val);
  const str = String(val);
  return `'${str.replace(/'/g, "''")}'`;
}

function buildInserts(table, rows) {
  if (rows.length === 0) return `-- ${table} (0 filas)\n`;
  const cols = Object.keys(rows[0]);
  const colList = cols.map((c) => `"${c}"`).join(', ');
  const lines = [`-- ${table} (${rows.length} filas)`];
  for (const row of rows) {
    const vals = cols.map((c) => escapeVal(row[c], JSONB_COLUMNS[table]?.includes(c)));
    lines.push(`INSERT INTO ${table} (${colList}) VALUES (${vals.join(', ')});`);
  }
  return lines.join('\n') + '\n';
}

(async () => {
  const now = new Date().toISOString().replace(/:/g, '-');
  const lines = [
    '-- ============================================',
    `-- Backup generado el: ${new Date().toISOString()}`,
    `-- Base de datos: ${SUPABASE_URL}`,
    '-- ============================================',
    '',
    'BEGIN;',
    '',
  ];

  for (const table of TABLE_ORDER) {
    try {
      const { rows } = await fetchTable(table);
      lines.push(buildInserts(table, rows));
      console.log(`✓ ${table}: ${rows.length} filas`);
    } catch (err) {
      console.error(`✗ ${table}: ERROR — ${err.message}`);
      lines.push(`-- ${table}: ERROR — ${err.message}`);
    }
  }

  lines.push('COMMIT;');
  lines.push('');

  const outPath = `backup_sql/backup-${now}.sql`;
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`\n✅ Backup guardado en: ${outPath}`);
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
