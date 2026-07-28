import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { hashPassword, isPasswordResetValid } from '@/lib/project-password';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-inscriptions.json');

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

async function writeRecords(records: unknown[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function sanitizeRecord(record: Record<string, unknown>) {
  const user = ((record.user as Record<string, unknown>) || {}) as Record<string, unknown>;
  const { passwordHash, passwordReset, ...safeUser } = user;
  return { ...record, user: safeUser };
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const email = trimField(body.email, 254).toLowerCase();
  const token = trimField(body.token, 128);
  const password = trimField(body.password, 128);

  if (!email || !isValidEmail(email) || !token) {
    return NextResponse.json({ ok: false, message: 'Enlace inválido o incompleto.' }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ ok: false, message: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
  }

  const records = (await readRecords()) as Array<Record<string, unknown>>;
  const index = records.findIndex((item) => {
    const user = (item.user as Record<string, unknown>) || {};
    return typeof user.email === 'string' && user.email.toLowerCase() === email;
  });

  if (index === -1) {
    return NextResponse.json({ ok: false, message: 'Enlace inválido o expirado.' }, { status: 400 });
  }

  const record = records[index];
  const user = ((record.user as Record<string, unknown>) || {}) as Record<string, unknown>;

  if (!isPasswordResetValid(user.passwordReset, token)) {
    return NextResponse.json({ ok: false, message: 'Enlace inválido o expirado.' }, { status: 400 });
  }

  const { passwordReset, ...restUser } = user;
  records[index] = {
    ...record,
    user: {
      ...restUser,
      passwordHash: hashPassword(password),
    },
    updatedAt: new Date().toISOString(),
  };
  await writeRecords(records);

  return NextResponse.json({
    ok: true,
    message: 'Contraseña actualizada correctamente.',
    record: sanitizeRecord(records[index]),
  });
}
