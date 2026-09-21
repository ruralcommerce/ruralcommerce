import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { scryptSync, timingSafeEqual } from 'crypto';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'project-inscriptions.json');

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPlaceholderEmail(value: string) {
  return /@acceso\.ruralcommerceglobal\.com$/i.test(value);
}

function verifyPassword(password: string, stored: string) {
  const [salt, storedHash] = stored.split(':');
  if (!salt || !storedHash) return false;
  const hashBuffer = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, 'hex');
  if (hashBuffer.length !== storedBuffer.length) return false;
  return timingSafeEqual(hashBuffer, storedBuffer);
}

async function readRecords() {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sanitizeRecord(record: Record<string, unknown>) {
  const user = ((record.user as Record<string, unknown>) || {}) as Record<string, unknown>;
  const { passwordHash, ...safeUser } = user;
  return {
    ...record,
    user: safeUser,
  };
}

/**
 * Authenticated candidate sets/replaces their login email
 * (for associates created without correo, or email corrections).
 */
export async function PUT(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const login = trimField(body.login, 254) || trimField(body.currentEmail, 254) || trimField(body.email, 254);
  const password = trimField(body.password, 128);
  const newEmail = trimField(body.newEmail, 254).toLowerCase();
  const recordId = trimField(body.recordId, 160);

  if (!login || !password || !newEmail) {
    return NextResponse.json(
      { ok: false, message: 'Usuario/correo actual, contraseña y nuevo correo son obligatorios.' },
      { status: 400 }
    );
  }

  if (!isValidEmail(newEmail) || isPlaceholderEmail(newEmail)) {
    return NextResponse.json({ ok: false, message: 'Nuevo correo inválido.' }, { status: 400 });
  }

  const records = (await readRecords()) as Array<Record<string, unknown>>;
  const loginLower = login.toLowerCase();
  const index = records.findIndex((item) => {
    const user = (item.user as Record<string, unknown>) || {};
    const userEmail = typeof user.email === 'string' ? user.email.toLowerCase() : '';
    const username = typeof user.username === 'string' ? user.username.toLowerCase() : '';
    const id = typeof item.id === 'string' ? item.id : '';
    if (recordId && id !== recordId) return false;
    return userEmail === loginLower || username === loginLower || id === loginLower;
  });

  if (index < 0) {
    return NextResponse.json({ ok: false, message: 'No encontramos tu cuenta.' }, { status: 404 });
  }

  const record = records[index] as Record<string, unknown>;
  const user = ((record.user as Record<string, unknown>) || {}) as Record<string, unknown>;
  const passwordHash = typeof user.passwordHash === 'string' ? user.passwordHash : '';
  if (!passwordHash || !verifyPassword(password, passwordHash)) {
    return NextResponse.json({ ok: false, message: 'Contraseña inválida.' }, { status: 401 });
  }

  const taken = records.some((item, i) => {
    if (i === index) return false;
    const other = (item.user as Record<string, unknown>) || {};
    const otherEmail = typeof other.email === 'string' ? other.email.toLowerCase() : '';
    return otherEmail === newEmail;
  });
  if (taken) {
    return NextResponse.json(
      { ok: false, message: 'Ese correo ya está vinculado a otra cuenta.' },
      { status: 409 }
    );
  }

  const profile = ((record.profile as Record<string, unknown>) || {}) as Record<string, unknown>;
  user.email = newEmail;
  user.username = newEmail;
  profile.email = newEmail;
  profile.emailPending = false;
  record.user = user;
  record.profile = profile;
  record.updatedAt = new Date().toISOString();
  records[index] = record;

  await writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');

  return NextResponse.json({ ok: true, record: sanitizeRecord(record) });
}
