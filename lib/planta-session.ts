import { createHmac, timingSafeEqual } from 'crypto';

export const PLANTA_COOKIE = 'rc_impulsacr_planta';
export const PLANTA_SESSION_HOURS = 24 * 30;

export type PlantaSessionPayload = {
  code: string;
  name: string;
  exp: number;
};

function sessionSecret() {
  return (
    process.env.PROJETO_PLANTA_SESSION_SECRET?.trim() ||
    process.env.PROJETO_TEAM_SESSION_SECRET?.trim() ||
    process.env.PROJETO_TEAM_PASSWORD?.trim() ||
    'planta-session-dev'
  );
}

export function signPlantaSession(payload: Omit<PlantaSessionPayload, 'exp'>, hours = PLANTA_SESSION_HOURS) {
  const full: PlantaSessionPayload = {
    ...payload,
    exp: Date.now() + hours * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(full)).toString('base64url');
  const signature = createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifyPlantaSession(token: string | undefined | null): PlantaSessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as PlantaSessionPayload;
    if (!payload.code || !payload.name || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function plantaCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: PLANTA_SESSION_HOURS * 60 * 60,
    secure: process.env.NODE_ENV === 'production',
  };
}
