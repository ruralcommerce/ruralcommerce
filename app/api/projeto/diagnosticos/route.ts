import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { appendAuditEntry } from '@/lib/project-audit-log';
import { readTeamSessionFromRequest } from '@/lib/project-team-session';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-inscriptions.json');

type RecordItem = Record<string, unknown>;

type DiagnosisPayload = {
  candidateId: string;
  email: string;
  locale: string;
  answers: Record<string, unknown>;
  teamAssist?: boolean;
};

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

function sanitizeRecord(record: RecordItem) {
  const user = ((record.user as RecordItem) || {}) as RecordItem;
  const { passwordHash, ...safeUser } = user;
  return {
    ...record,
    user: safeUser,
  };
}

function hasAllAnswers(answers: Record<string, unknown>) {
  const expectedKeys = Array.from({ length: 26 }, (_, index) => `q${index + 1}`);
  return expectedKeys.every((key) => {
    const value = answers[key];
    if (Array.isArray(value)) return value.length > 0;
    return typeof value === 'string' ? value.trim().length > 0 : value !== null && typeof value !== 'undefined';
  });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload inválido.' }, { status: 400 });
  }

  const body = payload as DiagnosisPayload;
  const candidateId = trimField(body.candidateId, 160);
  const email = trimField(body.email, 254).toLowerCase();
  const locale = trimField(body.locale, 12) || 'es';
  const answers = typeof body.answers === 'object' && body.answers !== null ? body.answers : null;
  const teamSession = readTeamSessionFromRequest(request);
  const teamAssist = body.teamAssist === true;

  if (!candidateId || !email || !answers) {
    return NextResponse.json({ ok: false, message: 'Dados de diagnóstico incompletos.' }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, message: 'E-mail inválido.' }, { status: 400 });
  }

  if (!hasAllAnswers(answers)) {
    return NextResponse.json({ ok: false, message: 'Complete todas as respostas do diagnóstico.' }, { status: 400 });
  }

  if (teamAssist && !teamSession) {
    return NextResponse.json({ ok: false, message: 'Sessão da equipe inválida.' }, { status: 401 });
  }

  const records = (await readRecords()) as RecordItem[];

  let index = records.findIndex((item) => {
    const user = ((item.user as RecordItem) || {}) as RecordItem;
    const userEmail = typeof user.email === 'string' ? user.email.toLowerCase() : '';
    return item.id === candidateId && userEmail === email;
  });

  if (index === -1) {
    index = records.findIndex((item) => {
      const user = ((item.user as RecordItem) || {}) as RecordItem;
      const userEmail = typeof user.email === 'string' ? user.email.toLowerCase() : '';
      return userEmail === email && item.status === 'approved';
    });
  }

  if (index === -1) {
    return NextResponse.json({ ok: false, message: 'Participante não encontrado.' }, { status: 404 });
  }

  const current = records[index];
  const status = typeof current.status === 'string' ? current.status : 'pending';

  if (status !== 'approved') {
    return NextResponse.json({ ok: false, message: 'Diagnóstico disponível apenas para participantes aprovados.' }, { status: 403 });
  }

  const profile = ((current.profile as RecordItem) || {}) as RecordItem;
  const now = new Date().toISOString();
  const previousDiagnosis = ((profile.diagnosis as RecordItem) || {}) as RecordItem;
  const hadDiagnosis = Boolean(previousDiagnosis.answers);

  const submittedBy = teamAssist && teamSession
    ? {
        type: 'team',
        teamMemberId: teamSession.memberId,
        teamMemberName: teamSession.name,
        teamMemberEmail: teamSession.email,
        onBehalfOf: candidateId,
      }
    : {
        type: 'candidate',
        candidateId,
        email,
      };

  records[index] = {
    ...current,
    updatedAt: now,
    profile: {
      ...profile,
      diagnosis: {
        submittedAt: now,
        locale,
        answers,
        submittedBy,
        updatedAt: now,
      },
    },
  };

  await writeRecords(records);

  await appendAuditEntry({
    action: hadDiagnosis ? 'diagnosis_update' : 'diagnosis_submit',
    actorType: teamAssist ? 'team' : 'candidate',
    actorId: teamAssist && teamSession ? teamSession.memberId : candidateId,
    actorName: teamAssist && teamSession ? teamSession.name : email,
    targetRecordId: candidateId,
    metadata: {
      email,
      teamAssist,
      submittedBy,
    },
  });

  return NextResponse.json({
    ok: true,
    message: teamAssist ? 'Diagnóstico salvo pela equipe técnica.' : 'Diagnóstico enviado com sucesso.',
    record: sanitizeRecord(records[index]),
  });
}
