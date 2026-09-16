import { mkdir, readFile, writeFile } from 'fs/promises';
import { randomBytes } from 'crypto';
import path from 'path';

export const PLANTA_DEMO_CODE = 'COPEY-22M2';

export type PlantaInvite = {
  code: string;
  label: string;
  active: boolean;
  seeded?: boolean;
  createdAt: string;
  createdBy: string;
  uses: number;
  lastUsedAt?: string;
  lastUsedBy?: string;
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-planta-invites.json');

function demoInvites(): PlantaInvite[] {
  return [
    {
      code: PLANTA_DEMO_CODE,
      label: 'Cooperativa Copey de Dota',
      active: true,
      seeded: true,
      createdAt: '2026-09-16T00:00:00.000Z',
      createdBy: 'system',
      uses: 0,
    },
    {
      code: 'IM-PLANTA-DEMO',
      label: 'Acompañamiento técnico Rural Commerce',
      active: true,
      seeded: true,
      createdAt: '2026-09-16T00:00:00.000Z',
      createdBy: 'system',
      uses: 0,
    },
  ];
}

export function normalizeInviteCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

function generateCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const alnum = `${alphabet}23456789`;
  const bytes = randomBytes(6);
  const letters = Array.from({ length: 4 }, (_, index) => alphabet[bytes[index] % alphabet.length]).join('');
  const tail = `${alnum[bytes[4] % alnum.length]}${alnum[bytes[5] % alnum.length]}`;
  return `IM-${letters}-${tail}`;
}

export async function readPlantaInvites(): Promise<PlantaInvite[]> {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    const list = Array.isArray(parsed) ? (parsed as PlantaInvite[]) : [];
    for (const seed of demoInvites()) {
      if (!list.some((item) => normalizeInviteCode(item.code) === seed.code)) {
        list.unshift(seed);
      }
    }
    return list;
  } catch {
    return demoInvites();
  }
}

async function writePlantaInvites(invites: PlantaInvite[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(invites, null, 2), 'utf8');
}

export async function findPlantaInvite(code: string) {
  const normalized = normalizeInviteCode(code);
  const invites = await readPlantaInvites();
  return invites.find((item) => normalizeInviteCode(item.code) === normalized) || null;
}

export async function redeemPlantaInvite(input: { code: string; name: string }) {
  const normalized = normalizeInviteCode(input.code);
  const name = input.name.trim().slice(0, 120);
  if (!normalized || !name) {
    return { ok: false as const, reason: 'missing' as const };
  }

  const invites = await readPlantaInvites();
  let index = invites.findIndex((item) => normalizeInviteCode(item.code) === normalized);

  if (index === -1 && (normalized === PLANTA_DEMO_CODE || normalized === 'IM-PLANTA-DEMO')) {
    const seed = demoInvites().find((item) => item.code === normalized);
    if (seed) {
      invites.unshift(seed);
      index = 0;
    }
  }

  if (index === -1) {
    return { ok: false as const, reason: 'invalid' as const };
  }

  const invite = invites[index];
  if (!invite.active) {
    return { ok: false as const, reason: 'inactive' as const };
  }

  const now = new Date().toISOString();
  invites[index] = {
    ...invite,
    uses: (invite.uses || 0) + 1,
    lastUsedAt: now,
    lastUsedBy: name,
  };
  await writePlantaInvites(invites);
  return { ok: true as const, invite: invites[index] };
}

export async function createPlantaInvite(input: { label: string; createdBy: string }) {
  const invites = await readPlantaInvites();
  let code = generateCode();
  while (invites.some((item) => item.code === code)) {
    code = generateCode();
  }

  const invite: PlantaInvite = {
    code,
    label: input.label.trim().slice(0, 160) || 'Planta compartida',
    active: true,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    uses: 0,
  };
  invites.unshift(invite);
  await writePlantaInvites(invites);
  return invite;
}
