import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { appendAuditEntry } from '@/lib/project-audit-log';
import { hasAllDiagnosisAnswers, sanitizeDiagnosisAnswers } from '@/lib/project-diagnosis';
import { canSubmitDiagnosis } from '@/lib/project-onboarding';
import { markInviteDiagnosisCompleted } from '@/lib/project-participant-invites';
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
  const answers = sanitizeDiagnosisAnswers(body.answers);
  const teamSession = readTeamSessionFromRequest(request);
  const teamAssist = body.teamAssist === true;

  if (!candidateId || !email || !Object.keys(answers).length) {
    return NextResponse.json({ ok: false, message: 'Dados de diagnóstico incompletos.' }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, message: 'E-mail inválido.' }, { status: 400 });
  }

  if (!hasAllDiagnosisAnswers(answers)) {
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
      return userEmail === email && canSubmitDiagnosis(item.status);
    });
  }

  if (index === -1) {
    return NextResponse.json({ ok: false, message: 'Participante não encontrado.' }, { status: 404 });
  }

  const current = records[index];
  const status = typeof current.status === 'string' ? current.status : 'pending';

  if (!canSubmitDiagnosis(status)) {
    return NextResponse.json({ ok: false, message: 'Diagnóstico disponível apenas para participantes aprovados.' }, { status: 403 });
  }

  const profile = ((current.profile as RecordItem) || {}) as RecordItem;
  const agreement = ((profile.agreement as RecordItem) || {}) as RecordItem;
  if (agreement.signed !== true && !teamAssist) {
    return NextResponse.json({ ok: false, message: 'Assine o convênio antes de enviar o diagnóstico.' }, { status: 403 });
  }

  const now = new Date().toISOString();
  const previousDiagnosis = ((profile.diagnosis as RecordItem) || {}) as RecordItem;
  const hadDiagnosis = Boolean(previousDiagnosis.answers);
  const finishingOnboarding = status === 'onboarding';

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

  const nextUser = ((current.user as RecordItem) || {}) as RecordItem;

  records[index] = {
    ...current,
    status: finishingOnboarding ? 'approved' : current.status,
    updatedAt: now,
    user: {
      ...nextUser,
      accessStatus: finishingOnboarding ? 'active' : nextUser.accessStatus,
    },
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

  const inviteToken = typeof current.inviteToken === 'string' ? current.inviteToken : '';
  if (finishingOnboarding && inviteToken) {
    try {
      await markInviteDiagnosisCompleted(inviteToken);
    } catch (error) {
      console.error('[api/projeto/diagnosticos] invite progress update failed:', error);
    }
  }

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
      finishingOnboarding,
    },
  });

  return NextResponse.json({
    ok: true,
    message: teamAssist ? 'Diagnóstico salvo pela equipe técnica.' : 'Diagnóstico enviado com sucesso.',
    record: sanitizeRecord(records[index]),
  });
}
