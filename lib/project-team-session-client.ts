const STORAGE_KEY = 'rc_team_session';

export type TeamSessionState = {
  token: string;
  memberId: string;
  name: string;
  email: string;
  role: string;
};

export function readTeamSession(): TeamSessionState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TeamSessionState;
    if (!parsed.token || !parsed.memberId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeTeamSession(session: TeamSessionState) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearTeamSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}
