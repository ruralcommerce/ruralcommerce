import { readFile } from 'fs/promises';
import path from 'path';
import type { ImpulsaPerson } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'project-inscriptions.json');

type RawInscription = {
  id?: unknown;
  status?: unknown;
  profile?: {
    name?: unknown;
    phone?: unknown;
    email?: unknown;
    organization?: unknown;
  };
  user?: {
    email?: unknown;
  };
};

function text(value: unknown, max = 200): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F]/g, '').trim().slice(0, max);
}

export async function listImpulsaPeople(): Promise<ImpulsaPerson[]> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const people: ImpulsaPerson[] = [];
  for (const item of parsed as RawInscription[]) {
    const id = text(item.id, 80);
    const status = text(item.status, 40);
    if (!id || (status !== 'approved' && status !== 'pending')) continue;
    const name = text(item.profile?.name, 160);
    if (!name) continue;
    people.push({
      id,
      name,
      phone: text(item.profile?.phone, 40),
      email: text(item.profile?.email, 254) || text(item.user?.email, 254),
      organization: text(item.profile?.organization, 200),
      status,
    });
  }

  people.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return people;
}
