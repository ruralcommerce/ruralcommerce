import { createHmac, timingSafeEqual } from 'crypto';

export type TeamSessionPayload = {
  memberId: string;
  name: string;
  email: string;
  role: 'master' | 'technician' | 'admin' | 'legacy';
  exp: number;
};

function sessionSecret() {
  return (
    process.env.PROJETO_TEAM_SESSION_SECRET?.trim() ||
    process.env.PROJETO_TEAM_PASSWORD?.trim() ||
    'projeto-team-session-dev'
  );
}

export function signTeamSession(
  payload: Omit<TeamSessionPayload, 'exp'>,
  hours = 12
): string {
  const full: TeamSessionPayload = {
    ...payload,
    exp: Date.now() + hours * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(full)).toString('base64url');
  const signature = createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifyTeamSession(token: string): TeamSessionPayload | null {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TeamSessionPayload;
    if (!payload.memberId || !payload.email || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function readTeamSessionFromRequest(request: Request) {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  return verifyTeamSession(match[1].trim());
}
