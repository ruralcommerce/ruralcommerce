import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const MARCA_STAFF_COOKIE = 'rc-marca-staff';

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

export function createStaffToken(): string {
  const payload = `staff:${Date.now()}`;
  const sig = createHmac('sha256', secret()).update(payload).digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

export function verifyStaffToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [payload, sig] = decoded.split('.');
    if (!payload || !sig) return false;
    const expected = createHmac('sha256', secret()).update(payload).digest('hex');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isStaffAuthenticatedFromCookieStore(
  cookieStore: { get: (name: string) => { value: string } | undefined }
): boolean {
  return verifyStaffToken(cookieStore.get(MARCA_STAFF_COOKIE)?.value);
}

export function requireStaff(): boolean {
  return isStaffAuthenticatedFromCookieStore(cookies());
}
