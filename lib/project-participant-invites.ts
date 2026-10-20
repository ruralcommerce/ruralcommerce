import { mkdir, readFile, writeFile } from 'fs/promises';
import { randomBytes } from 'crypto';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-participant-invites.json');

export type InviteProgressStep = 'register' | 'agreement' | 'diagnosis' | 'done';

export type ParticipantInvite = {
  id: string;
  token: string;
  invitedEmail: string;
  /** Email used when the person registers (may differ from invitedEmail). */
  registrationEmail: string | null;
  locale: string;
  status: 'sent' | 'in_progress' | 'completed' | 'revoked';
  progress: {
    currentStep: InviteProgressStep;
    registrationCompletedAt: string | null;
    agreementSignedAt: string | null;
    diagnosisCompletedAt: string | null;
  };
  /** Partial enrollment answers so the invitee can resume. */
  enrollmentDraft: Record<string, unknown> | null;
  enrollmentDraftStep: number | null;
  inscriptionId: string | null;
  note: string;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
  createdBy: string;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidInviteEmail(value: string) {
  return isValidEmail(normalizeEmail(value));
}

async function readAll(): Promise<ParticipantInvite[]> {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as ParticipantInvite[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(invites: ParticipantInvite[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(invites, null, 2), 'utf8');
}

function makeToken() {
  return randomBytes(24).toString('hex');
}

function emptyProgress(): ParticipantInvite['progress'] {
  return {
    currentStep: 'register',
    registrationCompletedAt: null,
    agreementSignedAt: null,
    diagnosisCompletedAt: null,
  };
}

export async function listParticipantInvites() {
  const invites = await readAll();
  return invites.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findInviteByToken(token: string) {
  const normalized = token.trim();
  if (!normalized) return null;
  const invites = await readAll();
  return invites.find((item) => item.token === normalized) || null;
}

export async function findInviteByEmail(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const invites = await readAll();
  return (
    invites.find((item) => {
      if (item.status === 'revoked') return false;
      if (normalizeEmail(item.invitedEmail) === normalized) return true;
      if (item.registrationEmail && normalizeEmail(item.registrationEmail) === normalized) return true;
      return false;
    }) || null
  );
}

export async function createParticipantInvite(input: {
  email: string;
  locale?: string;
  note?: string;
  createdBy: string;
}) {
  const invitedEmail = normalizeEmail(input.email);
  if (!isValidEmail(invitedEmail)) {
    throw new Error('invalid-email');
  }

  const invites = await readAll();
  const now = new Date().toISOString();
  const invite: ParticipantInvite = {
    id: `invite_${Date.now()}_${randomBytes(3).toString('hex')}`,
    token: makeToken(),
    invitedEmail,
    registrationEmail: null,
    locale: input.locale === 'pt-BR' || input.locale === 'en' ? input.locale : 'es',
    status: 'sent',
    progress: emptyProgress(),
    enrollmentDraft: null,
    enrollmentDraftStep: null,
    inscriptionId: null,
    note: (input.note || '').trim().slice(0, 500),
    createdAt: now,
    updatedAt: now,
    sentAt: null,
    createdBy: input.createdBy,
  };

  invites.push(invite);
  await writeAll(invites);
  return invite;
}

export async function updateParticipantInvite(
  token: string,
  updater: (invite: ParticipantInvite) => ParticipantInvite
) {
  const invites = await readAll();
  const index = invites.findIndex((item) => item.token === token);
  if (index === -1) return null;
  const updated = updater({ ...invites[index] });
  updated.updatedAt = new Date().toISOString();
  invites[index] = updated;
  await writeAll(invites);
  return updated;
}

export async function markInviteSent(token: string) {
  return updateParticipantInvite(token, (invite) => ({
    ...invite,
    sentAt: new Date().toISOString(),
    status: invite.status === 'completed' || invite.status === 'revoked' ? invite.status : 'sent',
  }));
}

export async function saveInviteEnrollmentDraft(
  token: string,
  draft: Record<string, unknown>,
  draftStep: number,
  registrationEmail?: string
) {
  return updateParticipantInvite(token, (invite) => {
    const nextEmail = registrationEmail ? normalizeEmail(registrationEmail) : invite.registrationEmail;
    return {
      ...invite,
      status: invite.status === 'completed' || invite.status === 'revoked' ? invite.status : 'in_progress',
      registrationEmail: nextEmail || invite.registrationEmail,
      enrollmentDraft: draft,
      enrollmentDraftStep: Math.max(0, Math.min(20, Math.floor(draftStep))),
      progress: {
        ...invite.progress,
        currentStep: invite.progress.registrationCompletedAt ? invite.progress.currentStep : 'register',
      },
    };
  });
}

export async function markInviteRegistered(
  token: string,
  input: { inscriptionId: string; registrationEmail: string }
) {
  const now = new Date().toISOString();
  return updateParticipantInvite(token, (invite) => ({
    ...invite,
    status: 'in_progress',
    inscriptionId: input.inscriptionId,
    registrationEmail: normalizeEmail(input.registrationEmail),
    enrollmentDraft: null,
    enrollmentDraftStep: null,
    progress: {
      ...invite.progress,
      currentStep: 'agreement',
      registrationCompletedAt: now,
    },
  }));
}

export async function markInviteAgreementSigned(token: string) {
  const now = new Date().toISOString();
  return updateParticipantInvite(token, (invite) => ({
    ...invite,
    status: 'in_progress',
    progress: {
      ...invite.progress,
      currentStep: 'diagnosis',
      agreementSignedAt: now,
    },
  }));
}

export async function markInviteDiagnosisCompleted(token: string) {
  const now = new Date().toISOString();
  return updateParticipantInvite(token, (invite) => ({
    ...invite,
    status: 'completed',
    progress: {
      ...invite.progress,
      currentStep: 'done',
      diagnosisCompletedAt: now,
    },
  }));
}

export function publicInviteView(invite: ParticipantInvite) {
  return {
    id: invite.id,
    token: invite.token,
    invitedEmail: invite.invitedEmail,
    registrationEmail: invite.registrationEmail,
    locale: invite.locale,
    status: invite.status,
    progress: invite.progress,
    enrollmentDraft: invite.enrollmentDraft,
    enrollmentDraftStep: invite.enrollmentDraftStep,
    inscriptionId: invite.inscriptionId,
  };
}

export function inviteOnboardingUrl(token: string, locale?: string) {
  const base = (process.env.PROJETO_SITE_URL?.trim() || 'https://ruralcommerceglobal.com').replace(/\/$/, '');
  const localeKey = locale === 'pt-BR' || locale === 'en' ? locale : 'es';
  return `${base}/${localeKey}/projeto/convite/${token}`;
}
