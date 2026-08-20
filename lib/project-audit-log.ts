import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export type AuditAction =
  | 'diagnosis_submit'
  | 'diagnosis_update'
  | 'status_change'
  | 'tag_change'
  | 'team_login'
  | 'team_invite'
  | 'team_invite_complete';

export type AuditEntry = {
  id: string;
  at: string;
  action: AuditAction;
  actorType: 'team' | 'candidate' | 'system';
  actorId: string;
  actorName?: string;
  targetRecordId: string;
  metadata?: Record<string, unknown>;
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'project-audit-log.json');

async function readAuditLog(): Promise<AuditEntry[]> {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeAuditLog(entries: AuditEntry[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(entries.slice(-5000), null, 2), 'utf8');
}

export async function appendAuditEntry(entry: Omit<AuditEntry, 'id' | 'at'>) {
  const entries = await readAuditLog();
  const next: AuditEntry = {
    ...entry,
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
  };
  entries.push(next);
  await writeAuditLog(entries);
  return next;
}
