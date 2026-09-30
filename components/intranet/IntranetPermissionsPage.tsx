'use client';

import { ROLE_DEFAULT_PERMISSIONS, type IntranetRole } from '@/lib/intranet/types';
import { IntranetGate } from './IntranetGate';

export function IntranetPermissionsPage({ locale }: { locale: string }) {
  return (
    <IntranetGate
      locale={locale}
      title="Permisos"
      breadcrumb="Páginas / Permisos"
      permission="permissions.manage"
    >
      {() => (
        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm leading-6 text-[#1E1E1E]/70">
            Matriz base por rol. Al crear un usuario se aplican estos permisos; luego se pueden ajustar por persona.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {(Object.keys(ROLE_DEFAULT_PERMISSIONS) as IntranetRole[]).map((role) => (
              <div key={role} className="rounded-xl border border-[#071F5E]/10 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#009179]">{role}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-[#071F5E]">
                  {ROLE_DEFAULT_PERMISSIONS[role].map((p) => (
                    <li key={p}>· {p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </IntranetGate>
  );
}
