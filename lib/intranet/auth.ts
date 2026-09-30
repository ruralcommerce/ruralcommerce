import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import type { IntranetPermission, IntranetRole, IntranetSession } from './types';

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
    if (!data.email || !data.permissions) return null;
    return {
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      permissions: data.permissions,
    };
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
      permissions: [
        'dashboard',
        'users.manage',
        'collaborators.manage',
        'permissions.manage',
        'tools.access',
        'tools.marca',
        'tools.sementes',
      ],
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

export function requireStaff(): boolean {
  return Boolean(getSessionFromCookies(cookies()));
}

export function requireSession(): IntranetSession | null {
  return getSessionFromCookies(cookies());
}

export function sessionHas(session: IntranetSession | null, permission: IntranetPermission): boolean {
  if (!session) return false;
  if (session.role === 'admin') return true;
  return session.permissions.includes(permission);
}
