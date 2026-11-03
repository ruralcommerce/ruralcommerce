'use client';

import {
  PROFILE_DEFAULT_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
  TEAM_ROLE_PERMISSIONS,
  type IntranetProfile,
  type IntranetRole,
} from '@/lib/intranet/types';
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
        <div className="space-y-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm leading-6 text-[#1E1E1E]/70">
              Matriz por <strong>perfil</strong> y rol. Al crear un usuario se aplican estos permisos; luego se
              pueden ajustar por persona. El menú solo muestra lo permitido; las APIs también bloquean.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-[#071F5E]">Por perfil</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {(Object.keys(PROFILE_DEFAULT_PERMISSIONS) as IntranetProfile[]).map((profile) => (
                <div key={profile} className="rounded-xl border border-[#071F5E]/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#009179]">{profile}</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-[#071F5E]">
                    {PROFILE_DEFAULT_PERMISSIONS[profile].map((p) => (
                      <li key={p}>· {p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-[#071F5E]">Staff interno — por rol</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {(Object.keys(ROLE_DEFAULT_PERMISSIONS) as IntranetRole[]).map((role) => (
                <div key={role} className="rounded-xl border border-[#071F5E]/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#009179]">{role}</p>
                  <ul className="mt-3 max-h-56 space-y-1.5 overflow-y-auto text-sm text-[#071F5E]">
                    {ROLE_DEFAULT_PERMISSIONS[role].map((p) => (
                      <li key={p}>· {p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-[#071F5E]">Equipo de proyecto — por rol</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {(['master', 'admin', 'technician'] as const).map((role) => (
                <div key={role} className="rounded-xl border border-[#071F5E]/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#009179]">{role}</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-[#071F5E]">
                    {TEAM_ROLE_PERMISSIONS[role].map((p) => (
                      <li key={p}>· {p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </IntranetGate>
  );
}
