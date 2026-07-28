/** Browser session for project candidates (same tab; password kept only in sessionStorage). */

export const CANDIDATE_SESSION_KEY = 'rc_candidate_session';

export type CandidateSession = {
  id?: string;
  email: string;
  password?: string;
  status?: string;
  locale?: string;
  name?: string;
  agreementSigned?: boolean;
};

export function readCandidateSession(): CandidateSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CANDIDATE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CandidateSession;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCandidateSession(session: CandidateSession) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(CANDIDATE_SESSION_KEY, JSON.stringify(session));
}

export function patchCandidateSession(patch: Partial<CandidateSession>) {
  const current = readCandidateSession();
  if (!current?.email && !patch.email) return;
  writeCandidateSession({ ...current, ...patch, email: patch.email || current?.email || '' });
}

export function clearCandidateSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(CANDIDATE_SESSION_KEY);
}
