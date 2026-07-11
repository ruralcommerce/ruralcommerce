import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { scryptSync, timingSafeEqual } from 'crypto';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-inscriptions.json');

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

async function writeRecords(records: unknown[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function sanitizeRecord(record: Record<string, unknown>) {
  const user = ((record.user as Record<string, unknown>) || {}) as Record<string, unknown>;
  const { passwordHash, ...safeUser } = user;
  return { ...record, user: safeUser };
}

function clientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '';
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const email = trimField(body.email, 254);
  const password = trimField(body.password, 128);
  const fullName = trimField(body.fullName, 160);
  const imageRights = body.imageRights === true;
  const commitment = body.commitment === true;
  const networkMembership = body.networkMembership === true;
  const communications = body.communications === true;
  const locale = trimField(body.locale, 10) || 'es';

  if (!email || !password) {
    return NextResponse.json({ ok: false, message: 'E-mail e senha são obrigatórios.' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, message: 'E-mail inválido.' }, { status: 400 });
  }
  if (!fullName) {
    return NextResponse.json({ ok: false, message: 'Nome completo é obrigatório.' }, { status: 400 });
  }
  if (!imageRights || !commitment || !networkMembership || !communications) {
    return NextResponse.json({ ok: false, message: 'É necessário aceitar todos os termos.' }, { status: 400 });
  }

  const records = (await readRecords()) as Array<Record<string, unknown>>;
  const index = records.findIndex((item) => {
    const user = (item.user as Record<string, unknown>) || {};
    const userEmail = typeof user.email === 'string' ? user.email : '';
    return userEmail.toLowerCase() === email.toLowerCase();
  });

  if (index === -1) {
    return NextResponse.json({ ok: false, message: 'Nenhuma inscrição encontrada com este e-mail.' }, { status: 404 });
  }

  const record = records[index];
  const user = ((record.user as Record<string, unknown>) || {}) as Record<string, unknown>;
  const passwordHash = typeof user.passwordHash === 'string' ? user.passwordHash : '';

  if (!passwordHash || !verifyPassword(password, passwordHash)) {
    return NextResponse.json({ ok: false, message: 'Senha inválida.' }, { status: 401 });
  }

  if (record.status !== 'approved') {
    return NextResponse.json({ ok: false, message: 'Seu perfil ainda não foi aprovado.' }, { status: 403 });
  }

  const profile = ((record.profile as Record<string, unknown>) || {}) as Record<string, unknown>;
  const signedAt = new Date().toISOString();

  records[index] = {
    ...record,
    profile: {
      ...profile,
      marketingConsent: true,
      consentAt: signedAt,
      consentRevokedAt: null,
      agreement: {
        signed: true,
        signedAt,
        fullName,
        imageRightsAccepted: true,
        commitmentAccepted: true,
        dataConfidentialityAccepted: true,
        networkMembershipAccepted: true,
        communicationsAccepted: true,
        locale,
        ip: clientIp(request),
      },
    },
  };

  await writeRecords(records);
  return NextResponse.json({ ok: true, record: sanitizeRecord(records[index]) });
}
