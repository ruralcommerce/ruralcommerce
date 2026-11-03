import type { IntranetPermission, IntranetSession } from './types';

/** Client-safe permission check (no next/headers). */
function sessionHas(session: IntranetSession, permission: IntranetPermission) {
  if (session.role === 'admin' && session.profile === 'staff_interno') return true;
  return session.permissions.includes(permission);
}

export type IntranetNavModule = {
  id: string;
  label: string;
  href: (locale: string) => string;
  permission: IntranetPermission;
  /** hide from beneficiario even if somehow granted */
  staffOnly?: boolean;
};

export const INTRANET_NAV_MODULES: IntranetNavModule[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: (locale) => `/${locale}/intranet/dashboard`,
    permission: 'dashboard',
    staffOnly: true,
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    href: (locale) => `/${locale}/intranet/usuarios`,
    permission: 'users.manage',
    staffOnly: true,
  },
  {
    id: 'colaboradores',
    label: 'Colaboradores',
    href: (locale) => `/${locale}/intranet/colaboradores`,
    permission: 'collaborators.manage',
    staffOnly: true,
  },
  {
    id: 'permisos',
    label: 'Permisos',
    href: (locale) => `/${locale}/intranet/permisos`,
    permission: 'permissions.manage',
    staffOnly: true,
  },
  {
    id: 'herramientas',
    label: 'Herramientas',
    href: (locale) => `/${locale}/intranet/herramientas`,
    permission: 'tools.access',
    staffOnly: true,
  },
  {
    id: 'proyecto',
    label: 'Proyecto',
    href: (locale) => `/${locale}/intranet/proyecto`,
    permission: 'projeto.access',
  },
  {
    id: 'mi-recorrido',
    label: 'Mi recorrido',
    href: (locale) => `/${locale}/intranet/mi-recorrido`,
    permission: 'benef.access',
  },
];

export function navModulesForSession(locale: string, session: IntranetSession) {
  return INTRANET_NAV_MODULES.filter((mod) => {
    if (mod.staffOnly && session.profile === 'beneficiario') return false;
    if (mod.id === 'mi-recorrido' && session.profile === 'staff_interno' && !session.permissions.includes('benef.access')) {
      return false;
    }
    return sessionHas(session, mod.permission);
  }).map((mod) => ({
    id: mod.id,
    label: mod.label,
    href: mod.href(locale),
    permission: mod.permission,
  }));
}
