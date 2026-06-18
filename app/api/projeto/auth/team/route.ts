import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'project-inscriptions.json');

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
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
  const password = trimField(body.password, 128);
  const expectedPassword = (process.env.PROJETO_TEAM_PASSWORD || '').trim();

  if (!expectedPassword) {
    return NextResponse.json({ ok: false, message: 'Defina PROJETO_TEAM_PASSWORD no ambiente.' }, { status: 500 });
  }

  if (!password) {
    return NextResponse.json({ ok: false, message: 'Senha da equipe é obrigatória.' }, { status: 400 });
  }

  if (password !== expectedPassword) {
    return NextResponse.json({ ok: false, message: 'Senha da equipe inválida.' }, { status: 401 });
  }

  const records = (await readRecords()) as Array<Record<string, unknown>>;
  const safeRecords = records.map((record) => sanitizeRecord(record));

  return NextResponse.json({ ok: true, records: safeRecords });
}
