import { readFile } from 'fs/promises';
import path from 'path';
import { verifyPassword } from '@/lib/project-password';

const DATA_FILE = path.join(process.cwd(), 'data', 'project-inscriptions.json');

export type InscriptionRecord = Record<string, unknown>;

export async function readInscriptionRecords(): Promise<InscriptionRecord[]> {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as InscriptionRecord[]) : [];
  } catch {
    return [];
  }
}

export function sanitizeInscriptionRecord(record: InscriptionRecord) {
  const user = ((record.user as Record<string, unknown>) || {}) as Record<string, unknown>;
  const { passwordHash, ...safeUser } = user;
  return { ...record, user: safeUser };
}

export function findInscriptionByEmail(records: InscriptionRecord[], email: string) {
  const normalized = email.trim().toLowerCase();
  return records.find((item) => {
    const user = (item.user as Record<string, unknown>) || {};
    const userEmail = typeof user.email === 'string' ? user.email : '';
    return userEmail.toLowerCase() === normalized;
  });
}

export function inscriptionEmail(record: InscriptionRecord) {
  const user = (record.user as Record<string, unknown>) || {};
  return typeof user.email === 'string' ? user.email : '';
}

export function inscriptionProfile(record: InscriptionRecord) {
  return ((record.profile as Record<string, unknown>) || {}) as Record<string, unknown>;
}

export function isApprovedWithAgreement(record: InscriptionRecord) {
  if (record.status !== 'approved') return false;
  const agreement = (inscriptionProfile(record).agreement as Record<string, unknown>) || {};
  return agreement.signed === true;
}

export async function authenticateCandidate(email: string, password: string) {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  if (!trimmedEmail || !trimmedPassword) {
    return { ok: false as const, status: 400, message: 'E-mail e senha são obrigatórios.' };
  }

  const records = await readInscriptionRecords();
  const record = findInscriptionByEmail(records, trimmedEmail);
  if (!record) {
    return { ok: false as const, status: 404, message: 'Nenhuma inscrição encontrada com este e-mail.' };
  }

  const user = ((record.user as Record<string, unknown>) || {}) as Record<string, unknown>;
  const passwordHash = typeof user.passwordHash === 'string' ? user.passwordHash : '';
  if (!passwordHash || !verifyPassword(trimmedPassword, passwordHash)) {
    return { ok: false as const, status: 401, message: 'Senha inválida.' };
  }

  return { ok: true as const, record, records };
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '';
}
