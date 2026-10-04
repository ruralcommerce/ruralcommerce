/**
 * Import profile.sex from tmp/sex-import.json into data/project-inscriptions.json
 * Storage codes only: male | female | collective
 *
 *   node scripts/import-participant-sex.mjs
 *   node scripts/import-participant-sex.mjs --file=/path/to/project-inscriptions.json
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const importFile = path.join(root, 'tmp', 'sex-import.json');

const fileArg = process.argv.find((a) => a.startsWith('--file='));
const dataFile = fileArg
  ? path.resolve(fileArg.slice('--file='.length))
  : path.join(root, 'data', 'project-inscriptions.json');

function normalizeSex(raw) {
  const key = String(raw || '')
    .trim()
    .toLowerCase();
  if (['male', 'm', 'masculino', 'hombre', 'man', 'homem'].includes(key)) return 'male';
  if (['female', 'f', 'femenino', 'femenina', 'mujer', 'woman', 'mulher', 'feminino'].includes(key)) {
    return 'female';
  }
  if (['collective', 'colectivo', 'colectiva', 'coletivo', 'coletiva', 'group', 'grupo'].includes(key)) {
    return 'collective';
  }
  if (['male', 'female', 'collective'].includes(key)) return key;
  return null;
}

if (!existsSync(importFile)) {
  console.error('Missing', importFile);
  process.exit(1);
}
if (!existsSync(dataFile)) {
  console.error('Missing', dataFile);
  process.exit(1);
}

const imports = JSON.parse(readFileSync(importFile, 'utf8'));
const byEmail = new Map();
for (const row of imports) {
  const email = String(row.email || '')
    .trim()
    .toLowerCase();
  const sex = normalizeSex(row.sex || row.sexRaw);
  if (email && sex) byEmail.set(email, sex);
}

const records = JSON.parse(readFileSync(dataFile, 'utf8'));
let updated = 0;
let missing = 0;
const missingEmails = [];

for (const [email, sex] of byEmail.entries()) {
  const record = records.find((item) => {
    const userEmail = String(item?.user?.email || '')
      .trim()
      .toLowerCase();
    const profileEmail = String(item?.profile?.email || '')
      .trim()
      .toLowerCase();
    return userEmail === email || profileEmail === email;
  });
  if (!record) {
    missing += 1;
    missingEmails.push(email);
    continue;
  }
  record.profile = { ...(record.profile || {}), sex };
  updated += 1;
}

writeFileSync(dataFile, JSON.stringify(records, null, 2), 'utf8');
console.log(
  JSON.stringify(
    {
      dataFile,
      mapped: byEmail.size,
      updated,
      missing,
      missingEmails: missingEmails.slice(0, 20),
    },
    null,
    2
  )
);
