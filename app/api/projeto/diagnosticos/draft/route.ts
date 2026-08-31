import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { scryptSync, timingSafeEqual } from 'crypto';
import path from 'path';
import {
  clampDiagnosisStep,
  countFilledDiagnosisAnswers,
  sanitizeDiagnosisAnswers,
} from '@/lib/project-diagnosis';
import { readTeamSessionFromRequest } from '@/lib/project-team-session';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-inscriptions.json');
const MAX_STEP = 5;

type RecordItem = Record<string, unknown>;

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

function findRecordIndex(records: RecordItem[], candidateId: string, email: string) {
  let index = records.findIndex((item) => {
    const user = ((item.user as RecordItem) || {}) as RecordItem;
    const userEmail = typeof user.email === 'string' ? user.email.toLowerCase() : '';
    return item.id === candidateId && userEmail === email.toLowerCase();
  });

  if (index === -1) {
    index = records.findIndex((item) => {
      const user = ((item.user as RecordItem) || {}) as RecordItem;
      const userEmail = typeof user.email === 'string' ? user.email.toLowerCase() : '';
      return userEmail === email.toLowerCase() && item.status === 'approved';
    });
  }

  return index;
}

export async function PUT(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const candidateId = trimField(body.candidateId, 160);
  const email = trimField(body.email, 254).toLowerCase();
  const password = trimField(body.password, 128);
  const locale = trimField(body.locale, 12) || 'es';
  const answers = sanitizeDiagnosisAnswers(body.answers);
  const currentStep = clampDiagnosisStep(body.currentStep, MAX_STEP);
  const teamSession = readTeamSessionFromRequest(request);
  const teamAssist = body.teamAssist === true;

  if (!candidateId || !email) {
    return NextResponse.json({ ok: false, message: 'Dados de diagnóstico incompletos.' }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, message: 'E-mail inválido.' }, { status: 400 });
  }

  if (teamAssist && !teamSession) {
    return NextResponse.json({ ok: false, message: 'Sessão da equipe inválida.' }, { status: 401 });
  }

  if (!teamAssist && !password) {
    return NextResponse.json({ ok: false, message: 'Senha obrigatória para salvar o rascunho.' }, { status: 400 });
  }

  const records = (await readRecords()) as RecordItem[];
  const index = findRecordIndex(records, candidateId, email);

  if (index === -1) {
    return NextResponse.json({ ok: false, message: 'Participante não encontrado.' }, { status: 404 });
  }

  const current = records[index];
  const status = typeof current.status === 'string' ? current.status : 'pending';

  if (status !== 'approved') {
    return NextResponse.json({ ok: false, message: 'Diagnóstico disponível apenas para participantes aprovados.' }, { status: 403 });
  }

  if (!teamAssist) {
    const user = ((current.user as RecordItem) || {}) as RecordItem;
    const passwordHash = typeof user.passwordHash === 'string' ? user.passwordHash : '';
    if (!passwordHash || !verifyPassword(password, passwordHash)) {
      return NextResponse.json({ ok: false, message: 'Senha inválida.' }, { status: 401 });
    }
  }

  const profile = ((current.profile as RecordItem) || {}) as RecordItem;
  const agreement = ((profile.agreement as RecordItem) || {}) as RecordItem;
  if (agreement.signed !== true) {
    return NextResponse.json({ ok: false, message: 'Assine o convênio antes de salvar o diagnóstico.' }, { status: 403 });
  }

  const previousDiagnosis = ((profile.diagnosis as RecordItem) || {}) as RecordItem;
  const now = new Date().toISOString();
  const filledCount = countFilledDiagnosisAnswers(answers);

  if (filledCount === 0) {
    const nextDiagnosis = { ...previousDiagnosis };
    delete nextDiagnosis.draft;

    records[index] = {
      ...current,
      updatedAt: now,
      profile: {
        ...profile,
        diagnosis: nextDiagnosis,
      },
    };
  } else {
    records[index] = {
      ...current,
      updatedAt: now,
      profile: {
        ...profile,
        diagnosis: {
          ...previousDiagnosis,
          draft: {
            answers,
            currentStep,
            locale,
            updatedAt: now,
          },
        },
      },
    };
  }

  await writeRecords(records);

  return NextResponse.json({
    ok: true,
    message: 'Borrador guardado.',
    updatedAt: now,
    filledCount,
  });
}
