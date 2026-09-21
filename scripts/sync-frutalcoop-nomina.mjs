/**
 * Sync Frutalcoop associates from nómina JSON against project-inscriptions.json.
 *
 *   node scripts/sync-frutalcoop-nomina.mjs [path/to/nomina.json] [--dry-run]
 *
 * - Matches by cédula (notes/nationalId), then email, then Fernando special-case
 * - Updates emails / phone / city / nationalId / frutalcoopCod
 * - Creates missing accounts (incl. no-email with login code FC{cod})
 * - Shared emails (padre/hijo): uses Gmail-style plus addressing for unique login
 * - Does NOT rotate passwords for existing accounts
 * - Writes tmp/frutalcoop-sync-result.json + tmp/frutalcoop-credentials-update.json
 */
import { randomBytes, scryptSync } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dataFile = path.join(root, 'data', 'project-inscriptions.json');
const outDir = path.join(root, 'tmp');
const nominaPath = process.argv[2] && !process.argv[2].startsWith('-')
  ? process.argv[2]
  : path.join(outDir, 'frutalcoop-nomina-2026-09.json');
const dryRun = process.argv.includes('--dry-run');

function digits(value) {
  return String(value || '').replace(/[^0-9]/g, '');
}

function normName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

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

function extractCedFromNotes(notes) {
  const m = String(notes || '').match(/c[eé]dula\s+([0-9\-]+)/i);
  return digits(m?.[1]);
}

function placeholderEmail(cod) {
  return `fc${cod}.pendiente@acceso.ruralcommerceglobal.com`;
}

function plusAddress(baseEmail, tag) {
  const email = String(baseEmail || '').trim().toLowerCase();
  const at = email.indexOf('@');
  if (at < 1) return email;
  const local = email.slice(0, at).replace(/\+.*/, '');
  const domain = email.slice(at + 1);
  const safeTag = String(tag || 'extra')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 24) || 'extra';
  return `${local}+${safeTag}@${domain}`;
}

function isPlaceholderEmail(email) {
  return /@acceso\.ruralcommerceglobal\.com$/i.test(String(email || ''));
}

function readRecords() {
  if (!existsSync(dataFile)) return [];
  const parsed = JSON.parse(readFileSync(dataFile, 'utf8'));
  return Array.isArray(parsed) ? parsed : [];
}

function findMatch(row, records, usedIds) {
  const ced = digits(row.cedula);
  if (ced) {
    const byCed = records.find((r) => {
      if (usedIds.has(r.id) || r.teamTag !== 'frutalcoop') return false;
      const national = digits(r.profile?.nationalId);
      const fromNotes = extractCedFromNotes(r.notes);
      return national === ced || fromNotes === ced;
    });
    if (byCed) return byCed;
  }

  const email = String(row.email || '').trim().toLowerCase();
  if (email && isValidEmail(email)) {
    const byEmail = records.find((r) => {
      if (usedIds.has(r.id) || r.teamTag !== 'frutalcoop') return false;
      return String(r.user?.email || '').toLowerCase() === email;
    });
    if (byEmail) return byEmail;
  }

  // Self-registered "Fernando Chacón Zúñiga" ↔ nómina "Chacón Zúñiga Luis Fernando"
  const n = normName(row.name);
  if (
    n.includes('chacon') &&
    n.includes('fernando') &&
    !n.includes('federico') &&
    !n.includes('pablo') &&
    !n.includes('carlos')
  ) {
    const fernando = records.find((r) => {
      if (usedIds.has(r.id) || r.teamTag !== 'frutalcoop') return false;
      const rn = normName(r.profile?.name);
      return rn.includes('fernando') && rn.includes('chacon');
    });
    if (fernando) return fernando;
  }

  return null;
}

if (!existsSync(nominaPath)) {
  console.error('Nomina JSON not found:', nominaPath);
  process.exit(1);
}

const nomina = JSON.parse(readFileSync(nominaPath, 'utf8'));
if (!Array.isArray(nomina)) {
  console.error('Nomina must be an array');
  process.exit(1);
}

const records = readRecords();
const usedIds = new Set();
const emailOwners = new Map();
for (const record of records) {
  const email = String(record?.user?.email || '').toLowerCase().trim();
  if (email) emailOwners.set(email, record.id);
}

const now = new Date().toISOString();
const result = {
  dryRun,
  updated: [],
  created: [],
  skipped: [],
  emailConflicts: [],
  sendWelcomeIds: [],
};
const credentials = [];

for (const row of nomina) {
  const cod = row.cod;
  const name = String(row.name || '').trim();
  if (!name || !cod) continue;

  let email = String(row.email || '').trim().toLowerCase();
  const phone = String(row.phone || '').trim();
  const city = String(row.city || '').trim();
  const cedula = String(row.cedula || '').trim();
  const sheetNote = String(row.sheetNote || '').trim();
  const loginCode = `FC${cod}`;

  // Padre Torres Arroyo shares son's inbox — unique login via plus addressing
  if (cod === 19 && email === 'alvarotc2015@gmail.com') {
    email = plusAddress(email, 'evelio');
  }

  const needsEmail = !email;
  if (needsEmail) {
    email = placeholderEmail(cod);
  } else if (!isValidEmail(email)) {
    result.skipped.push({ cod, name, reason: 'invalid_email', email });
    continue;
  }

  const existing = findMatch(row, records, usedIds);

  if (existing) {
    usedIds.add(existing.id);
    const oldEmail = String(existing.user?.email || '').toLowerCase().trim();
    const owner = emailOwners.get(email);
    if (owner && owner !== existing.id) {
      result.emailConflicts.push({
        cod,
        name,
        email,
        existingId: existing.id,
        conflictId: owner,
      });
      continue;
    }

    const before = {
      email: oldEmail,
      phone: existing.profile?.phone || '',
      city: existing.profile?.city || '',
    };

    existing.status = 'approved';
    existing.updatedAt = now;
    existing.teamTag = 'frutalcoop';
    existing.profile = {
      ...(existing.profile || {}),
      name: name || existing.profile?.name,
      phone: phone || existing.profile?.phone || '',
      city: city || existing.profile?.city || '',
      nationalId: cedula || existing.profile?.nationalId || '',
      frutalcoopCod: cod,
      cooperative: existing.profile?.cooperative || 'Frutalcoop',
      locale: existing.profile?.locale || 'es',
      marketingConsent: existing.profile?.marketingConsent !== false,
    };

    if (needsEmail) {
      existing.profile.emailPending = true;
      existing.user = {
        ...(existing.user || {}),
        username: loginCode,
        accessStatus: 'approved',
      };
      // keep existing login email if already placeholder/real unless empty
      if (!oldEmail || isPlaceholderEmail(oldEmail)) {
        existing.user.email = email;
        existing.profile.email = '';
      }
    } else {
      existing.profile.emailPending = false;
      existing.profile.email = email;
      existing.user = {
        ...(existing.user || {}),
        email,
        username: email,
        accessStatus: 'approved',
      };
      if (oldEmail && oldEmail !== email) {
        emailOwners.delete(oldEmail);
      }
      emailOwners.set(email, existing.id);
    }

    existing.notes = [
      existing.notes || '',
      `Sync nómina ${now.slice(0, 10)} · cód. ${cod} · cédula ${cedula || 'n/d'}`,
      sheetNote ? `Nota nómina: ${sheetNote}` : '',
    ]
      .filter(Boolean)
      .join(' · ');

    const agreementSigned = existing.profile?.agreement?.signed === true;
    const shouldWelcome =
      !needsEmail &&
      (!agreementSigned ||
        (oldEmail && oldEmail !== email) ||
        /reenviar|nuevo correo|actualizar correo/i.test(sheetNote));

    result.updated.push({
      id: existing.id,
      cod,
      name,
      before,
      after: {
        email: existing.user.email,
        phone: existing.profile.phone,
        city: existing.profile.city,
        emailPending: Boolean(existing.profile.emailPending),
        loginCode: needsEmail ? loginCode : undefined,
      },
      agreementSigned,
      shouldWelcome,
    });

    if (shouldWelcome) result.sendWelcomeIds.push(existing.id);

    credentials.push({
      cod,
      name,
      email: needsEmail ? '' : existing.user.email,
      loginCode: needsEmail ? loginCode : existing.user.email,
      phone: existing.profile.phone || phone,
      city: existing.profile.city || city,
      cedula,
      status: needsEmail
        ? 'updated_pending_email'
        : oldEmail !== existing.user.email
          ? 'updated_email'
          : 'updated_meta',
      password: '',
      note: needsEmail
        ? `Sin correo: entrar con usuario ${loginCode} y la contraseña ya asignada (o pedir restablecer). Puede agregar correo en Mi perfil.`
        : oldEmail !== existing.user.email
          ? `Correo actualizado de ${oldEmail} → ${existing.user.email}. Contraseña NO se cambió.`
          : 'Datos actualizados. Contraseña NO se cambió.',
      recordId: existing.id,
      sheetNote,
    });
    continue;
  }

  // Create new
  const owner = emailOwners.get(email);
  if (owner) {
    result.emailConflicts.push({ cod, name, email, conflictId: owner, action: 'create' });
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
    notes: `Importación nómina Frutalcoop ${now.slice(0, 10)} · cód. ${cod} · cédula ${cedula || 'n/d'}${
      sheetNote ? ` · Nota: ${sheetNote}` : ''
    }`,
    user: {
      id,
      email,
      username: needsEmail ? loginCode : email,
      accessStatus: 'approved',
      passwordHash: hashPassword(password),
    },
    profile: {
      name,
      email: needsEmail ? '' : email,
      phone,
      organization: name,
      cooperative: 'Frutalcoop',
      city,
      role: 'Asociado Frutalcoop',
      nationalId: cedula,
      frutalcoopCod: cod,
      emailPending: needsEmail,
      interest: 'Frutalcoop — sync nómina',
      message: `Importado desde nómina Frutalcoop (cédula ${cedula || 'n/d'}, cód. ${cod}).`,
      answers: null,
      locale: 'es',
      marketingConsent: true,
      consentAt: now,
    },
  };

  if (!dryRun) {
    records.push(record);
  }
  usedIds.add(id);
  emailOwners.set(email, id);

  result.created.push({
    id,
    cod,
    name,
    email: needsEmail ? '' : email,
    loginCode: needsEmail ? loginCode : email,
    emailPending: needsEmail,
  });
  if (!needsEmail) result.sendWelcomeIds.push(id);

  credentials.push({
    cod,
    name,
    email: needsEmail ? '' : email,
    loginCode: needsEmail ? loginCode : email,
    phone,
    city,
    cedula,
    status: needsEmail ? 'created_pending_email' : 'created',
    password,
    note: needsEmail
      ? `Cuenta creada sin correo. Entrar en /es/perfil con usuario ${loginCode} y esta contraseña. Luego agregar correo en Mi perfil.`
      : 'Cuenta nueva con contraseña provisional.',
    recordId: id,
    sheetNote,
  });
}

mkdirSync(outDir, { recursive: true });
if (!dryRun) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  writeFileSync(`${dataFile}.bak-frutalcoop-sync-${stamp}`, readFileSync(dataFile));
  writeFileSync(dataFile, JSON.stringify(records, null, 2), 'utf8');
}

writeFileSync(path.join(outDir, 'frutalcoop-sync-result.json'), JSON.stringify(result, null, 2), 'utf8');
writeFileSync(
  path.join(outDir, 'frutalcoop-credentials-update.json'),
  JSON.stringify(credentials, null, 2),
  'utf8'
);

console.log(
  JSON.stringify(
    {
      ok: true,
      dryRun,
      updated: result.updated.length,
      created: result.created.length,
      skipped: result.skipped.length,
      emailConflicts: result.emailConflicts.length,
      sendWelcome: result.sendWelcomeIds.length,
      createdDetail: result.created,
      emailChanges: result.updated.filter((u) => u.before.email !== u.after.email),
      conflicts: result.emailConflicts,
    },
    null,
    2
  )
);
