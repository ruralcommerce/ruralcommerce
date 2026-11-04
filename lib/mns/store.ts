import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import type {
  MnsAnswers,
  MnsCheckSnapshot,
  MnsFichaId,
  MnsLocale,
  MnsParticipant,
  MnsSession,
  MnsStoreFile,
  MnsWorkRoute,
} from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'mns-sessions.json');

function emptyStore(): MnsStoreFile {
  return { sessions: [] };
}

async function ensureStore(): Promise<MnsStoreFile> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as MnsStoreFile;
    if (!parsed || !Array.isArray(parsed.sessions)) return emptyStore();
    return parsed;
  } catch {
    return emptyStore();
  }
}

async function saveStore(store: MnsStoreFile) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
}

function randomCode(length = 6) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function listSessions(): Promise<MnsSession[]> {
  const store = await ensureStore();
  return [...store.sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getSessionById(id: string): Promise<MnsSession | null> {
  const store = await ensureStore();
  return store.sessions.find((s) => s.id === id) || null;
}

export async function getSessionByCode(code: string): Promise<MnsSession | null> {
  const normalized = code.trim().toUpperCase();
  const store = await ensureStore();
  return store.sessions.find((s) => s.code.toUpperCase() === normalized) || null;
}

export type CreateSessionInput = {
  groupName: string;
  title?: string;
  notes?: string;
  locale?: MnsLocale;
  createdBy?: string;
};

export async function createSession(input: CreateSessionInput): Promise<MnsSession> {
  const store = await ensureStore();
  const now = new Date().toISOString();
  let code = randomCode();
  while (store.sessions.some((s) => s.code === code)) {
    code = randomCode();
  }

  const session: MnsSession = {
    id: newId('mns'),
    code,
    groupName: input.groupName.trim(),
    title: (input.title || `MNS · ${input.groupName}`).trim(),
    notes: (input.notes || '').trim(),
    status: 'active',
    locale: input.locale || 'es',
    createdAt: now,
    updatedAt: now,
    createdBy: (input.createdBy || 'equipo').trim(),
    participants: [],
  };

  store.sessions.unshift(session);
  await saveStore(store);
  return session;
}

export async function updateSession(
  id: string,
  patch: Partial<Pick<MnsSession, 'groupName' | 'title' | 'notes' | 'status' | 'locale'>>
): Promise<MnsSession | null> {
  const store = await ensureStore();
  const index = store.sessions.findIndex((s) => s.id === id);
  if (index < 0) return null;
  const current = store.sessions[index];
  const next: MnsSession = {
    ...current,
    ...patch,
    groupName: patch.groupName !== undefined ? patch.groupName.trim() : current.groupName,
    title: patch.title !== undefined ? patch.title.trim() : current.title,
    notes: patch.notes !== undefined ? patch.notes.trim() : current.notes,
    updatedAt: new Date().toISOString(),
  };
  store.sessions[index] = next;
  await saveStore(store);
  return next;
}

export async function joinSession(
  code: string,
  name: string,
  opts?: {
    forceNew?: boolean;
    participantId?: string;
    workRoute?: MnsWorkRoute;
    companyName?: string;
  }
): Promise<{ session: MnsSession; participant: MnsParticipant; resumed: boolean } | null> {
  const store = await ensureStore();
  const normalized = code.trim().toUpperCase();
  const index = store.sessions.findIndex((s) => s.code.toUpperCase() === normalized);
  if (index < 0) return null;

  const session = store.sessions[index];
  if (session.status === 'closed') return null;

  const now = new Date().toISOString();
  const companyName = (opts?.companyName || '').trim();
  let participant: MnsParticipant | undefined;
  let resumed = false;

  if (opts?.participantId && !opts.forceNew) {
    participant = session.participants.find((p) => p.id === opts.participantId);
    if (participant) resumed = true;
  }

  if (!participant && !opts?.forceNew) {
    const byName = session.participants.find((p) => {
      if (p.completedAt) return false;
      const sameName = p.name.trim().toLowerCase() === name.trim().toLowerCase();
      if (!sameName) return false;
      if (!companyName) return true;
      return (p.companyName || '').trim().toLowerCase() === companyName.toLowerCase();
    });
    if (byName) {
      participant = byName;
      resumed = true;
    }
  }

  if (!participant) {
    participant = {
      id: newId('part'),
      name: name.trim() || 'Participante',
      companyName: companyName || '',
      joinedAt: now,
      updatedAt: now,
      completedAt: null,
      workRoute: opts?.workRoute || 'negocio',
      productLabel: '',
      answers: {},
      currentFicha: 'ficha1',
      preCheck: null,
      postCheck: null,
    };
    session.participants.push(participant);
  } else {
    participant.name = name.trim() || participant.name;
    if (companyName) participant.companyName = companyName;
    if (!participant.companyName) participant.companyName = '';
    participant.updatedAt = now;
    if (opts?.workRoute) participant.workRoute = opts.workRoute;
  }

  session.updatedAt = now;
  store.sessions[index] = session;
  await saveStore(store);
  return { session, participant, resumed };
}

export async function saveParticipantAnswers(
  code: string,
  participantId: string,
  patch: {
    answers?: MnsAnswers;
    currentFicha?: MnsFichaId;
    workRoute?: MnsWorkRoute;
    productLabel?: string;
    companyName?: string;
    preCheck?: MnsCheckSnapshot | null;
    postCheck?: MnsCheckSnapshot | null;
    complete?: boolean;
  }
): Promise<MnsParticipant | null> {
  const store = await ensureStore();
  const normalized = code.trim().toUpperCase();
  const sIndex = store.sessions.findIndex((s) => s.code.toUpperCase() === normalized);
  if (sIndex < 0) return null;

  const session = store.sessions[sIndex];
  const pIndex = session.participants.findIndex((p) => p.id === participantId);
  if (pIndex < 0) return null;

  const now = new Date().toISOString();
  const current = session.participants[pIndex];
  const next: MnsParticipant = {
    ...current,
    updatedAt: now,
    answers: patch.answers
      ? {
          ...current.answers,
          ...Object.fromEntries(
            Object.entries(patch.answers).map(([ficha, fields]) => [
              ficha,
              { ...(current.answers[ficha as MnsFichaId] || {}), ...(fields || {}) },
            ])
          ),
        }
      : current.answers,
    currentFicha: patch.currentFicha || current.currentFicha,
    workRoute: patch.workRoute || current.workRoute,
    productLabel:
      patch.productLabel !== undefined ? patch.productLabel.trim() : current.productLabel,
    companyName:
      patch.companyName !== undefined ? patch.companyName.trim() : current.companyName || '',
    preCheck: patch.preCheck !== undefined ? patch.preCheck : current.preCheck ?? null,
    postCheck: patch.postCheck !== undefined ? patch.postCheck : current.postCheck ?? null,
    completedAt: patch.complete ? now : current.completedAt,
  };

  session.participants[pIndex] = next;
  session.updatedAt = now;
  store.sessions[sIndex] = session;
  await saveStore(store);
  return next;
}
