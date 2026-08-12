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
const headers = { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` };

function request(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: HOST, path: urlPath, method, headers };
    if (body) opts.headers['Content-Type'] = 'application/json';
    const req = https.request(opts, (res) => {
      const data = [];
      res.on('data', (c) => data.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(data);
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(buf);
        else reject(new Error(`HTTP ${res.statusCode}: ${buf.toString().slice(0,200)}`));
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function listFolder(prefix) {
  const res = await request('POST', `/storage/v1/object/list/${BUCKET}`, { prefix, limit: 1000, offset: 0 });
  return JSON.parse(res.toString());
}

async function downloadFile(filePath) {
  return request('GET', `/storage/v1/object/public/${BUCKET}/${filePath}`);
}

async function listAllFiles(prefix = '') {
  const entries = await listFolder(prefix);
  const files = [];
  for (const e of entries) {
    const fp = prefix ? `${prefix}${e.name}` : e.name;
    if (e.id) files.push(fp);
    else files.push(...await listAllFiles(`${fp}/`));
  }
  return files;
}

(async () => {
  const prefixes = ['logos/'];
  const existing = new Set();
  for (const p of prefixes) {
    console.log(`\n🔍 Listando ${p}...`);
    const files = await listAllFiles(p);
    console.log(`   ${files.length} archivos encontrados`);
    let downloaded = 0;
    for (const f of files) {
      const localPath = path.join(BASE_DIR, f);
      if (fs.existsSync(localPath)) { existing.add(f); continue; }
      const localDir = path.dirname(localPath);
      if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
      try {
        const data = await downloadFile(f);
        fs.writeFileSync(localPath, data);
        downloaded++;
        process.stdout.write(`  ✓ ${f}\n`);
      } catch (e) {
        process.stdout.write(`  ✗ ${f}: ${e.message}\n`);
      }
    }
    console.log(`   ✅ ${p}: ${downloaded} descargados`);
  }

  // Summary
  const allDirs = ['firmas', 'logos', 'fotos', 'informes'];
  for (const d of allDirs) {
    const dirPath = path.join(BASE_DIR, d);
    if (fs.existsSync(dirPath)) {
      let count = 0;
      let size = 0;
      function walk(dir) {
        for (const e of fs.readdirSync(dir)) {
          const p = path.join(dir, e);
          if (fs.statSync(p).isDirectory()) walk(p);
          else { count++; size += fs.statSync(p).size; }
        }
      }
      walk(dirPath);
      console.log(`  ${d}: ${count} archivos, ${(size/1024/1024).toFixed(1)}MB`);
    } else {
      console.log(`  ${d}: (vacio)`);
    }
  }
})().catch((e) => { console.error('FATAL:', e); process.exit(1); });
