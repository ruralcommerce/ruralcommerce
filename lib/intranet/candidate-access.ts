import { getSessionFromRequest, sessionHas } from '@/lib/intranet/auth';
import {
  findInscriptionByEmail,
  readInscriptionRecords,
  sanitizeInscriptionRecord,
  type InscriptionRecord,
} from '@/lib/project-candidate-auth';
import type { IntranetSession } from './types';

export async function resolveBeneficiaryRecord(
  request: Request,
  opts?: { email?: string; password?: string; requirePassword?: boolean }
): Promise<
  | { ok: true; record: InscriptionRecord; records: InscriptionRecord[]; session?: IntranetSession }
  | { ok: false; status: number; message: string }
> {
  const intranet = getSessionFromRequest(request);
  if (intranet && sessionHas(intranet, 'benef.access')) {
    const records = await readInscriptionRecords();
    const inscriptionId = intranet.scope?.inscriptionId;
    let record: InscriptionRecord | undefined;
    if (inscriptionId) {
      record = records.find((r) => r.id === inscriptionId);
    }
    if (!record) {
      record = findInscriptionByEmail(records, intranet.email) || undefined;
    }
    if (!record) {
      return { ok: false, status: 404, message: 'Inscrição não encontrada para esta conta.' };
    }
    return { ok: true, record, records, session: intranet };
  }

  // Legacy email+password path
  const email = (opts?.email || '').trim();
  const password = (opts?.password || '').trim();
  if (!email || !password) {
    return { ok: false, status: 401, message: 'Não autenticado.' };
  }

  const { authenticateCandidate } = await import('@/lib/project-candidate-auth');
  const auth = await authenticateCandidate(email, password);
  if (!auth.ok) return auth;
  return { ok: true, record: auth.record, records: auth.records };
}

export function publicBeneficiaryPayload(record: InscriptionRecord) {
  return sanitizeInscriptionRecord(record);
}
