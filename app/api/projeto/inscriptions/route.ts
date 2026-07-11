import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { randomBytes, scryptSync } from 'crypto';
import path from 'path';
import { notifyNewProjectInscription } from '@/lib/project-inscription-notify';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-inscriptions.json');

const MAX = {
  name: 160,
  email: 254,
  phone: 40,
  organization: 200,
  city: 120,
  role: 120,
  interest: 120,
  message: 3000,
  password: 128,
} as const;

function trimField(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function sanitizeRecord(record: Record<string, unknown>) {
  const user = ((record.user as Record<string, unknown>) || {}) as Record<string, unknown>;
  const { passwordHash, ...safeUser } = user;
  return {
    ...record,
    user: safeUser,
  };
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

export async function GET() {
  const records = await readRecords();
  const safeRecords = (records as Array<Record<string, unknown>>).map((record) => sanitizeRecord(record));
  return NextResponse.json({ ok: true, records: safeRecords });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const name = trimField(body.name, MAX.name);
  const email = trimField(body.email, MAX.email);
  const phone = trimField(body.phone, MAX.phone);
  const organization = trimField(body.organization, MAX.organization);
  const city = trimField(body.city, MAX.city);
  const role = trimField(body.role, MAX.role);
  const interest = trimField(body.interest, MAX.interest);
  const message = trimField(body.message, MAX.message);
  const password = trimField(body.password, MAX.password);
  const answers =
    typeof body.answers === 'object' && body.answers !== null ? body.answers : null;

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, message: 'Nome, e-mail e mensagem são obrigatórios.' }, { status: 400 });
  }

  if (!password || password.length < 6) {
    return NextResponse.json({ ok: false, message: 'Senha deve ter no mínimo 6 caracteres.' }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, message: 'E-mail inválido.' }, { status: 400 });
  }

  const records = await readRecords();
  const id = `participant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  const passwordHash = hashPassword(password);

  const record = {
    id,
    createdAt,
    status: 'pending',
    user: {
      id,
      email,
      username: email,
      accessStatus: 'pending',
      passwordHash,
    },
    profile: {
      name,
      phone,
      organization,
      city,
      role,
      interest,
      message,
      answers,
      locale: typeof body.locale === 'string' ? body.locale : 'pt-BR',
      marketingConsent: body.marketingConsent === true,
      consentAt: body.marketingConsent === true ? createdAt : null,
    },
  };

  records.push(record);
  await writeRecords(records);

  try {
    await notifyNewProjectInscription({
      id,
      createdAt,
      user: { email },
      profile: {
        name,
        phone,
        organization,
        city,
        role,
        interest,
        message,
        locale: typeof body.locale === 'string' ? body.locale : 'pt-BR',
      },
    });
  } catch (error) {
    console.error('[api/projeto/inscriptions] notification email failed:', error);
  }

  return NextResponse.json({ ok: true, record: sanitizeRecord(record as Record<string, unknown>) });
}
