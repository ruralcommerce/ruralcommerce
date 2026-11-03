export {
  requireStaff,
  expectedIntranetPassword,
  INTRANET_COOKIE as MARCA_STAFF_COOKIE,
  requireSession,
  sessionHas,
} from '@/lib/intranet/auth';

import { requireSession, sessionHas } from '@/lib/intranet/auth';

/** Marca staff APIs — needs tools.marca (admin staff_interno still bypasses via sessionHas). */
export function requireMarcaStaff(): boolean {
  const session = requireSession();
  return sessionHas(session, 'tools.marca');
}
