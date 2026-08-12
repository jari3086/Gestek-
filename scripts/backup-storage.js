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
const HOST = SUPABASE_URL.replace('https://', '');
const BUCKET = 'informes';
const BASE_DIR = path.join(__dirname, '..', 'backup_sql', 'storage');

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
};

function request(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: HOST, path: urlPath, method, headers };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
    }
    const req = https.request(opts, (res) => {
      let data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(data);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: buf, headers: res.headers });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${buf.toString().slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function listFolder(prefix) {
  const res = await request('POST', `/storage/v1/object/list/${BUCKET}`, {
    prefix, limit: 1000, offset: 0,
  });
  return JSON.parse(res.data.toString());
}

async function downloadFile(filePath) {
  const res = await request('GET', `/storage/v1/object/public/${BUCKET}/${filePath}`);
  return res.data;
}

async function listAllFiles(prefix = '') {
  const entries = await listFolder(prefix);
  const files = [];
  for (const entry of entries) {
    const fullPath = prefix ? `${prefix}${entry.name}` : entry.name;
    if (entry.id) {
      files.push(fullPath);
    } else {
      const subFiles = await listAllFiles(`${fullPath}/`);
      files.push(...subFiles);
    }
  }
  return files;
}

(async () => {
  console.log(`🔍 Listando archivos en bucket "${BUCKET}"...`);
  const allFiles = await listAllFiles();
  console.log(`📦 ${allFiles.length} archivos encontrados\n`);

  let downloaded = 0;
  let errors = 0;
  let totalBytes = 0;

  const concurrency = 5;
  for (let i = 0; i < allFiles.length; i += concurrency) {
    const batch = allFiles.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      batch.map(async (filePath) => {
        const localPath = path.join(BASE_DIR, filePath);
        const localDir = path.dirname(localPath);
        if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

        const data = await downloadFile(filePath);
        fs.writeFileSync(localPath, data);
        const size = data.length;
        totalBytes += size;
        downloaded++;
        const sizeStr = size > 1024 * 1024
          ? `${(size / 1024 / 1024).toFixed(1)}MB`
          : `${(size / 1024).toFixed(1)}KB`;
        console.log(`  ✓ [${downloaded}/${allFiles.length}] ${filePath} (${sizeStr})`);
      })
    );
    for (const r of results) {
      if (r.status === 'rejected') {
        errors++;
        console.error(`  ✗ Error: ${r.reason.message}`);
      }
    }
  }

  const totalMB = (totalBytes / 1024 / 1024).toFixed(1);
  console.log(`\n✅ Backup de Storage completado:`);
  console.log(`   Archivos: ${downloaded}`);
  console.log(`   Errores:  ${errors}`);
  console.log(`   Tamaño:   ${totalMB} MB`);
  console.log(`   Ruta:     ${BASE_DIR}`);

  // Manifest
  const manifest = {
    bucket: BUCKET,
    backup_date: new Date().toISOString(),
    project: SUPABASE_URL,
    total_files: downloaded,
    total_bytes: totalBytes,
    files: allFiles.map((f) => ({
      path: f,
      local: path.join('backup_sql/storage', f),
    })),
  };
  fs.writeFileSync(
    path.join(BASE_DIR, '..', `storage-manifest-${new Date().toISOString().replace(/:/g, '-')}.json`),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
