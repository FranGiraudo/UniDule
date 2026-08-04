import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.resolve('.env'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim();
});

const URL = env.VITE_SUPABASE_URL;
const KEY = env.VITE_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

async function run() {
  console.log("Fetching global_subjects from Supabase...");
  const res = await fetch(`${URL}/rest/v1/global_subjects?select=*`, {
    headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
  });
  const subjects = await res.json();
  if (!subjects || subjects.error) {
    console.error("Failed to fetch", subjects);
    process.exit(1);
  }

  const cols = {};
  for (let i = 0; i < 15; i++) cols[i] = [];
  
  subjects.forEach(s => {
    s.col = (s.year - 1) * 2 + (s.semester - 1);
    s.row = 0;
    if (!cols[s.col]) cols[s.col] = [];
    cols[s.col].push(s);
  });

  Object.values(cols).forEach(col => {
    col.forEach((s, i) => s.row = i);
  });

  const nodeMap = {};
  subjects.forEach(s => nodeMap[s.code] = s);

  console.log("Applying Barycenter heuristic...");
  const MAX_ITERS = 20;
  for (let it = 0; it < MAX_ITERS; it++) {
    for (let c = 1; c < 15; c++) {
      if (!cols[c] || cols[c].length === 0) continue;
      cols[c].forEach(s => {
        const preds = (s.correlatives?.toCurse || []).map(code => nodeMap[code]).filter(Boolean);
        if (preds.length > 0) {
          const avg = preds.reduce((acc, p) => acc + p.row, 0) / preds.length;
          s.barycenter = avg;
        } else {
          s.barycenter = s.row;
        }
      });
      cols[c].sort((a, b) => a.barycenter - b.barycenter);
      cols[c].forEach((s, i) => s.row = i);
    }

    for (let c = 13; c >= 0; c--) {
      if (!cols[c] || cols[c].length === 0) continue;
      cols[c].forEach(s => {
        const succs = subjects.filter(sub => (sub.correlatives?.toCurse || []).includes(s.code));
        if (succs.length > 0) {
          const avg = succs.reduce((acc, p) => acc + p.row, 0) / succs.length;
          s.barycenter = avg;
        } else {
          s.barycenter = s.row;
        }
      });
      cols[c].sort((a, b) => a.barycenter - b.barycenter);
      cols[c].forEach((s, i) => s.row = i);
    }
  }

  console.log("Generating layout_migration.sql...");
  let sql = `
-- Script de migración generado automáticamente
-- ALTER TABLE global_subjects ADD COLUMN IF NOT EXISTS layout_row INTEGER DEFAULT 0;

BEGIN;
`;

  subjects.forEach(s => {
    sql += `UPDATE global_subjects SET layout_row = ${s.row} WHERE code = '${s.code}';\n`;
  });

  sql += `COMMIT;\n`;

  fs.writeFileSync(path.resolve('layout_migration.sql'), sql, 'utf8');
  console.log("Done! Generated layout_migration.sql");
}

run().catch(console.error);
