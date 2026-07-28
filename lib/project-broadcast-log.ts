import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { BroadcastResult, BroadcastSegment } from '@/lib/project-broadcast';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-broadcast-log.json');

export type BroadcastLogEntry = {
  id: string;
  createdAt: string;
  subject: string;
  segment: BroadcastSegment;
  channels: string[];
  result: BroadcastResult;
  sentBy: 'team' | 'team-resend-convenio';
};

async function readLog(): Promise<BroadcastLogEntry[]> {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as BroadcastLogEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeLog(entries: BroadcastLogEntry[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(entries, null, 2), 'utf8');
}

export async function appendBroadcastLog(entry: Omit<BroadcastLogEntry, 'id' | 'createdAt'>) {
  const log = await readLog();
  const next: BroadcastLogEntry = {
    ...entry,
    id: `bc_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  log.unshift(next);
  await writeLog(log.slice(0, 50));
  return next;
}

export async function listRecentBroadcasts(limit = 5) {
  const log = await readLog();
  return log.slice(0, limit);
}
