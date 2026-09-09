/**
 * One-off / ops bulk import for Frutalcoop associates.
 *
 * Usage on server:
 *   node scripts/import-frutalcoop-bulk.mjs /path/to/frutalcoop-source.json
 *
 * Writes:
 *   data/project-inscriptions.json (updated)
 *   tmp/frutalcoop-credentials.json (provisional passwords + status)
 */
import { randomBytes, scryptSync } from 'crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dataFile = path.join(root, 'data', 'project-inscriptions.json');
const outDir = path.join(root, 'tmp');
const outFile = path.join(outDir, 'frutalcoop-credentials.json');

const sourcePath = process.argv[2] || path.join(outDir, 'frutalcoop-source.json');

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function makePassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  const bytes = randomBytes(6);
  for (let i = 0; i < 6; i += 1) suffix += alphabet[bytes[i] % alphabet.length];
  return `Frutal-${suffix}`;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function readRecords() {
  if (!existsSync(dataFile)) return [];
  try {
    const parsed = JSON.parse(readFileSync(dataFile, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecords(records) {
  mkdirSync(path.dirname(dataFile), { recursive: true });
  // backup before write
  if (existsSync(dataFile)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    writeFileSync(`${dataFile}.bak-frutalcoop-${stamp}`, readFileSync(dataFile));
  }
  writeFileSync(dataFile, JSON.stringify(records, null, 2), 'utf8');
}

if (!existsSync(sourcePath)) {
  console.error('Source JSON not found:', sourcePath);
  process.exit(1);
}

const source = JSON.parse(readFileSync(sourcePath, 'utf8'));
if (!Array.isArray(source)) {
  console.error('Source must be an array');
  process.exit(1);
}

const records = readRecords();
const byEmail = new Map();
for (const record of records) {
  const email = String(record?.user?.email || '').toLowerCase().trim();
  if (email) byEmail.set(email, record);
}

const seenInBatch = new Set();
const credentials = [];
const now = new Date().toISOString();
let created = 0;
let updated = 0;
let skipped = 0;

for (const row of source) {
  const name = String(row.name || '').trim();
  const email = String(row.email || '')
    .trim()
    .toLowerCase();
  const phone = String(row.phone || '').trim();
  const city = String(row.city || '').trim();
  const cedula = String(row.cedula || '').trim();
  const cod = row.cod ?? '';

  if (!email) {
    credentials.push({
      cod,
      name,
      email: '',
      phone,
      city,
      cedula,
      status: 'skipped_no_email',
      password: '',
      note: 'Sin correo en la nómina',
    });
    skipped += 1;
    continue;
  }

  if (!isValidEmail(email)) {
    credentials.push({
      cod,
      name,
      email,
      phone,
      city,
      cedula,
      status: 'skipped_invalid_email',
      password: '',
      note: 'Correo inválido',
    });
    skipped += 1;
    continue;
  }

  if (seenInBatch.has(email)) {
    credentials.push({
      cod,
      name,
      email,
      phone,
      city,
      cedula,
      status: 'skipped_duplicate_in_sheet',
      password: '',
      note: 'Correo duplicado en la planilla (ya procesado arriba)',
    });
    skipped += 1;
    continue;
  }
  seenInBatch.add(email);

  const existing = byEmail.get(email);
  if (existing) {
    existing.status = 'approved';
    existing.updatedAt = now;
    existing.teamTag = 'frutalcoop';
    existing.user = {
      ...(existing.user || {}),
      email,
      username: email,
      accessStatus: 'approved',
    };
    existing.profile = {
      ...(existing.profile || {}),
      name: name || existing.profile?.name || email,
      phone: phone || existing.profile?.phone || '',
      organization:
        existing.profile?.organization &&
        !/^frutalcoop(\s*r\.?\s*l\.?)?$/i.test(String(existing.profile.organization).trim()) &&
        !/^cooperativa\s*frutalcoop/i.test(String(existing.profile.organization).trim())
          ? existing.profile.organization
          : name || existing.profile?.name || email,
      cooperative: existing.profile?.cooperative || 'Frutalcoop',
      city: city || existing.profile?.city || '',
      locale: 'es',
      interest: existing.profile?.interest || 'Frutalcoop — importación de nómina',
      message:
        existing.profile?.message ||
        `Importado desde nómina Frutalcoop (cédula ${cedula || 'n/d'}, cód. ${cod || 'n/d'}).`,
    };
    // Do not rotate password for existing accounts
    credentials.push({
      cod,
      name: existing.profile.name,
      email,
      phone: existing.profile.phone || phone,
      city: existing.profile.city || city,
      cedula,
      status: 'already_existed_updated_tag',
      password: '',
      recordId: existing.id,
      note: 'Ya existía en el sistema. Se marcó aprobado + etiqueta frutalcoop. Contraseña NO se cambió.',
    });
    updated += 1;
    continue;
  }

  const password = makePassword();
  const id = `participant_${Date.now()}_${randomBytes(3).toString('hex')}`;
  const record = {
    id,
    createdAt: now,
    updatedAt: now,
    status: 'approved',
    teamTag: 'frutalcoop',
    notes: `Importación nómina Frutalcoop ${now.slice(0, 10)} · cód. ${cod || 'n/d'} · cédula ${cedula || 'n/d'}`,
    user: {
      id,
      email,
      username: email,
      accessStatus: 'approved',
      passwordHash: hashPassword(password),
    },
    profile: {
      name: name || email,
      phone,
      organization: name || email,
      cooperative: 'Frutalcoop',
      city,
      role: 'Asociado Frutalcoop',
      interest: 'Frutalcoop — importación de nómina',
      message: `Importado desde nómina Frutalcoop (cédula ${cedula || 'n/d'}, cód. ${cod || 'n/d'}).`,
      answers: null,
      locale: 'es',
      marketingConsent: true,
      consentAt: now,
    },
  };

  records.push(record);
  byEmail.set(email, record);
  credentials.push({
    cod,
    name: record.profile.name,
    email,
    phone,
    city,
    cedula,
    status: 'created',
    password,
    recordId: id,
    note: 'Cuenta nueva, aprobada, etiqueta frutalcoop',
  });
  created += 1;
}

writeRecords(records);
mkdirSync(outDir, { recursive: true });
writeFileSync(
  outFile,
  JSON.stringify(
    {
      importedAt: now,
      summary: { created, updated, skipped, totalSource: source.length },
      credentials,
    },
    null,
    2
  ),
  'utf8'
);

console.log(JSON.stringify({ ok: true, created, updated, skipped, outFile }, null, 2));
