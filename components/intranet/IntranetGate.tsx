'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { IntranetPermission, IntranetSession } from '@/lib/intranet/types';
import { IntranetLogin } from './IntranetLogin';
import { IntranetShell } from './IntranetShell';

export function IntranetGate({
  locale,
  title,
  breadcrumb,
  permission,
  children,
}: {
  locale: string;
  title: string;
  breadcrumb?: string;
  permission?: IntranetPermission;
  children: (session: IntranetSession) => ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<IntranetSession | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch('/api/intranet/staff');
      const data = (await res.json()) as { ok?: boolean; session?: IntranetSession };
      if (cancelled) return;
      if (!data.ok || !data.session) {
        setSession(null);
        return;
      }
      setSession(data.session);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FA] text-sm text-[#071F5E]/70">
        Cargando intranet…
      </div>
    );
  }

  if (!session) {
    return <IntranetLogin locale={locale} />;
  }

  const allowed =
    !permission || session.role === 'admin' || session.permissions.includes(permission);

  if (!allowed) {
    return (
      <IntranetShell locale={locale} session={session} title="Sin acceso" breadcrumb="Páginas / Acceso">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-[#071F5E]/80">No tienes permiso para esta sección.</p>
          <button
            type="button"
            className="mt-4 rounded-xl bg-[#009179] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => router.push(`/${locale}/intranet/dashboard`)}
          >
            Volver al dashboard
          </button>
        </div>
      </IntranetShell>
    );
  }

  return (
    <IntranetShell locale={locale} session={session} title={title} breadcrumb={breadcrumb}>
      {children(session)}
    </IntranetShell>
  );
}
