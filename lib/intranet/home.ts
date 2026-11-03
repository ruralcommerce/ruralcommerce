import type { IntranetPermission, IntranetSession } from './types';

function has(session: IntranetSession, permission: IntranetPermission) {
  if (session.role === 'admin' && session.profile === 'staff_interno') return true;
  return session.permissions.includes(permission);
}

/** Post-login home path under /{locale}/intranet/... */
export function intranetHomePath(locale: string, session: IntranetSession): string {
  const base = `/${locale}/intranet`;

  if (session.profile === 'beneficiario') return `${base}/mi-recorrido`;
  if (session.profile === 'equipe_projeto') return `${base}/proyecto`;

  if (has(session, 'dashboard') || has(session, 'tools.access')) {
    return `${base}/dashboard`;
  }
  if (has(session, 'projeto.access')) return `${base}/proyecto`;
  if (has(session, 'benef.access')) return `${base}/mi-recorrido`;
  return `${base}/dashboard`;
}
