import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
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

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const login = trimField(body.email, 254) || trimField(body.login, 254) || trimField(body.username, 254);
  const password = trimField(body.password, 128);

  if (!login || !password) {
    return NextResponse.json({ ok: false, message: 'E-mail (ou usuário) e senha são obrigatórios.' }, { status: 400 });
  }

  const loginLower = login.toLowerCase();
  const looksLikeEmail = isValidEmail(login);

  const records = (await readRecords()) as Array<Record<string, unknown>>;
  const record = records.find((item) => {
    const user = (item.user as Record<string, unknown>) || {};
    const userEmail = typeof user.email === 'string' ? user.email.toLowerCase() : '';
    const username = typeof user.username === 'string' ? user.username.toLowerCase() : '';
    return userEmail === loginLower || username === loginLower;
  });

  if (!record) {
    return NextResponse.json(
      {
        ok: false,
        message: looksLikeEmail
          ? 'Nenhuma inscrição encontrada com este e-mail.'
          : 'Nenhuma inscrição encontrada com este usuário.',
      },
      { status: 404 }
    );
  }

  const user = ((record.user as Record<string, unknown>) || {}) as Record<string, unknown>;
  const passwordHash = typeof user.passwordHash === 'string' ? user.passwordHash : '';

  if (!passwordHash) {
    return NextResponse.json({ ok: false, message: 'Cadastro sem senha configurada. Refaça a inscrição.' }, { status: 400 });
  }

  if (!verifyPassword(password, passwordHash)) {
    return NextResponse.json({ ok: false, message: 'Senha inválida.' }, { status: 401 });
  }

  return NextResponse.json({ ok: true, record: sanitizeRecord(record) });
}
