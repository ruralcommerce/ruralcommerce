/**
 * Safe backfill: set profile.role = "Representante legal" only when empty.
 * Does NOT touch name, organization, agreement, diagnosis, passwords.
 *
 *   node scripts/backfill-representative-role.mjs
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataFile = path.join(root, 'data', 'project-inscriptions.json');

if (!existsSync(dataFile)) {
  console.error('Missing', dataFile);
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = `${dataFile}.bak-role-${stamp}`;
writeFileSync(backup, readFileSync(dataFile));

const records = JSON.parse(readFileSync(dataFile, 'utf8'));
let updated = 0;

for (const record of records) {
  if (!record.profile || typeof record.profile !== 'object') continue;
  const role = typeof record.profile.role === 'string' ? record.profile.role.trim() : '';
  if (role) continue;
  record.profile.role = 'Representante legal';
  record.updatedAt = new Date().toISOString();
  updated += 1;
}

writeFileSync(dataFile, JSON.stringify(records, null, 2), 'utf8');
console.log(JSON.stringify({ ok: true, updated, backup }, null, 2));
