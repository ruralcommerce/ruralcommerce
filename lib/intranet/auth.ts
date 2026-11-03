import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import {
  ROLE_DEFAULT_PERMISSIONS,
  type IntranetPermission,
  type IntranetProfile,
  type IntranetRole,
  type IntranetScope,
  type IntranetSession,
} from './types';

export const INTRANET_COOKIE = 'rc-intranet';
/** legacy cookie from marca v1 */
export const LEGACY_MARCA_COOKIE = 'rc-marca-staff';

function secret() {
  return (
    process.env.RC_INTRANET_SECRET ||
    process.env.EDITOR_BASIC_PASSWORD ||
    'ruralcommerce-intranet-dev'
  );
}

export function expectedIntranetPassword() {
  return process.env.RC_INTRANET_PASSWORD || process.env.EDITOR_BASIC_PASSWORD || 'ruralcommerce123';
}

export function createSessionToken(session: IntranetSession): string {
  const payload = JSON.stringify({
    ...session,
    t: Date.now(),
  });
  const sig = createHmac('sha256', secret()).update(payload).digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

function normalizeSession(data: Partial<IntranetSession> & { email?: string; permissions?: IntranetPermission[] }): IntranetSession | null {
  if (!data.email || !data.permissions) return null;
  return {
    userId: data.userId || '',
    name: data.name || data.email,
    email: data.email,
    role: (data.role || 'viewer') as IntranetRole,
    profile: (data.profile || 'staff_interno') as IntranetProfile,
    permissions: data.permissions,
    scope: (data.scope || {}) as IntranetScope,
  };
}

export function verifySessionToken(token: string | undefined | null): IntranetSession | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const lastDot = decoded.lastIndexOf('.');
    if (lastDot < 0) return null;
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    const expected = createHmac('sha256', secret()).update(payload).digest('hex');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const data = JSON.parse(payload) as IntranetSession & { t?: number };
    return normalizeSession(data);
  } catch {
    return null;
  }
}

/** Legacy token without session payload still counts as admin bootstrap */
function verifyLegacyToken(token: string | undefined | null): IntranetSession | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [payload, sig] = decoded.split('.');
    if (!payload || !sig || !payload.startsWith('staff:')) return null;
    const expected = createHmac('sha256', secret()).update(payload).digest('hex');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return {
      userId: 'usr_admin',
      name: 'Equipo Rural Commerce',
      email: 'equipo@ruralcommerceglobal.com',
      role: 'admin' as IntranetRole,
      profile: 'staff_interno',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.admin],
      scope: {},
    };
  } catch {
    return null;
  }
}

export function getSessionFromCookies(
  cookieStore: { get: (name: string) => { value: string } | undefined }
): IntranetSession | null {
  return (
    verifySessionToken(cookieStore.get(INTRANET_COOKIE)?.value) ||
    verifyLegacyToken(cookieStore.get(LEGACY_MARCA_COOKIE)?.value) ||
    verifyLegacyToken(cookieStore.get(INTRANET_COOKIE)?.value)
  );
}

/** Read intranet session from a Request Cookie header (API routes). */
export function getSessionFromRequest(request: Request): IntranetSession | null {
  const header = request.headers.get('cookie') || '';
  const parts = header.split(';').map((p) => p.trim());
  const map = new Map<string, string>();
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    map.set(part.slice(0, eq), decodeURIComponent(part.slice(eq + 1)));
  }
  return (
    verifySessionToken(map.get(INTRANET_COOKIE)) ||
    verifyLegacyToken(map.get(LEGACY_MARCA_COOKIE)) ||
    verifyLegacyToken(map.get(INTRANET_COOKIE))
  );
}

export function requireStaff(): boolean {
  return Boolean(getSessionFromCookies(cookies()));
}

export function requireSession(): IntranetSession | null {
  return getSessionFromCookies(cookies());
}

export function sessionHas(session: IntranetSession | null, permission: IntranetPermission): boolean {
  if (!session) return false;
  // Full bypass only for staff_interno admins
  if (session.role === 'admin' && session.profile === 'staff_interno') return true;
  // Legacy sessions without profile still treat admin as full access
  if (session.role === 'admin' && !session.profile) return true;
  return session.permissions.includes(permission);
}

export function sessionHasAny(
  session: IntranetSession | null,
  permissions: IntranetPermission[]
): boolean {
  return permissions.some((p) => sessionHas(session, p));
}

export function requirePermission(permission: IntranetPermission): IntranetSession | null {
  const session = requireSession();
  if (!sessionHas(session, permission)) return null;
  return session;
}

export function requireAnyPermission(permissions: IntranetPermission[]): IntranetSession | null {
  const session = requireSession();
  if (!sessionHasAny(session, permissions)) return null;
  return session;
}

export function scopeAllowsInscription(session: IntranetSession, inscriptionId: string): boolean {
  if (session.profile === 'beneficiario') {
    const allowed = session.scope?.inscriptionId || session.userId;
    return Boolean(allowed && (session.scope.inscriptionId === inscriptionId));
  }
  if (sessionHas(session, 'projeto.inscripciones') || sessionHas(session, 'projeto.access')) {
    return true;
  }
  return false;
}
