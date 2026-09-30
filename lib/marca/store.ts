import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { MarcaContract, MarcaLocale, MarcaParticipant, MarcaStoreFile } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'marca-contracts.json');

function emptyStore(): MarcaStoreFile {
  return { contracts: [] };
}

async function ensureStore(): Promise<MarcaStoreFile> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as MarcaStoreFile;
    if (!parsed || !Array.isArray(parsed.contracts)) return emptyStore();
    return parsed;
  } catch {
    return emptyStore();
  }
}

async function saveStore(store: MarcaStoreFile) {
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

export async function listContracts(): Promise<MarcaContract[]> {
  const store = await ensureStore();
  return [...store.contracts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getContractById(id: string): Promise<MarcaContract | null> {
  const store = await ensureStore();
  return store.contracts.find((c) => c.id === id) || null;
}

export async function getContractByCode(code: string): Promise<MarcaContract | null> {
  const normalized = code.trim().toUpperCase();
  const store = await ensureStore();
  return store.contracts.find((c) => c.code.toUpperCase() === normalized) || null;
}

export type CreateContractInput = {
  clientName: string;
  title: string;
  notes?: string;
  locale?: MarcaLocale;
  createdBy?: string;
  imageIds?: string[];
};

export async function createContract(input: CreateContractInput): Promise<MarcaContract> {
  const store = await ensureStore();
  const now = new Date().toISOString();
  let code = randomCode();
  while (store.contracts.some((c) => c.code === code)) {
    code = randomCode();
  }

  const contract: MarcaContract = {
    id: newId('ctr'),
    code,
    clientName: input.clientName.trim(),
    title: (input.title || `Marca · ${input.clientName}`).trim(),
    notes: (input.notes || '').trim(),
    status: 'active',
    locale: input.locale || 'es',
    createdAt: now,
    updatedAt: now,
    createdBy: (input.createdBy || 'equipo').trim(),
    imageIds: input.imageIds || [],
    participants: [],
  };

  store.contracts.unshift(contract);
  await saveStore(store);
  return contract;
}

export async function updateContract(
  id: string,
  patch: Partial<Pick<MarcaContract, 'clientName' | 'title' | 'notes' | 'status' | 'imageIds' | 'locale'>>
): Promise<MarcaContract | null> {
  const store = await ensureStore();
  const index = store.contracts.findIndex((c) => c.id === id);
  if (index < 0) return null;
  const current = store.contracts[index];
  const next: MarcaContract = {
    ...current,
    ...patch,
    clientName: patch.clientName !== undefined ? patch.clientName.trim() : current.clientName,
    title: patch.title !== undefined ? patch.title.trim() : current.title,
    notes: patch.notes !== undefined ? patch.notes.trim() : current.notes,
    updatedAt: new Date().toISOString(),
  };
  store.contracts[index] = next;
  await saveStore(store);
  return next;
}

export async function joinContract(code: string, name: string): Promise<{ contract: MarcaContract; participant: MarcaParticipant } | null> {
  const store = await ensureStore();
  const normalized = code.trim().toUpperCase();
  const index = store.contracts.findIndex((c) => c.code.toUpperCase() === normalized);
  if (index < 0) return null;
  const contract = store.contracts[index];
  if (contract.status === 'done') return null;

  const participant: MarcaParticipant = {
    id: newId('prt'),
    name: name.trim() || 'Participante',
    joinedAt: new Date().toISOString(),
    votes: {},
    words: { people: [], places: [], product: [] },
    customer: {},
    specialMeaning: '',
  };

  contract.participants.push(participant);
  contract.updatedAt = new Date().toISOString();
  store.contracts[index] = contract;
  await saveStore(store);
  return { contract, participant };
}

export async function saveParticipantResponse(
  code: string,
  participantId: string,
  patch: Partial<Pick<MarcaParticipant, 'votes' | 'words' | 'customer' | 'specialMeaning' | 'completedAt'>>
): Promise<MarcaParticipant | null> {
  const store = await ensureStore();
  const normalized = code.trim().toUpperCase();
  const cIndex = store.contracts.findIndex((c) => c.code.toUpperCase() === normalized);
  if (cIndex < 0) return null;
  const contract = store.contracts[cIndex];
  const pIndex = contract.participants.findIndex((p) => p.id === participantId);
  if (pIndex < 0) return null;

  const current = contract.participants[pIndex];
  const next: MarcaParticipant = {
    ...current,
    ...patch,
    votes: patch.votes ? { ...current.votes, ...patch.votes } : current.votes,
    words: patch.words
      ? {
          people: patch.words.people ?? current.words.people,
          places: patch.words.places ?? current.words.places,
          product: patch.words.product ?? current.words.product,
        }
      : current.words,
    customer: patch.customer ? { ...current.customer, ...patch.customer } : current.customer,
    specialMeaning:
      patch.specialMeaning !== undefined ? patch.specialMeaning : current.specialMeaning,
  };

  contract.participants[pIndex] = next;
  contract.updatedAt = new Date().toISOString();
  store.contracts[cIndex] = contract;
  await saveStore(store);
  return next;
}
