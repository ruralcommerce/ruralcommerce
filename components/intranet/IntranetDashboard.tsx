'use client';

import Image from 'next/image';
import Link from 'next/link';
import { intranetTools } from '@/lib/intranet/tools';
import type { IntranetSession } from '@/lib/intranet/types';
import { IntranetGate } from './IntranetGate';

export function IntranetDashboard({ locale }: { locale: string }) {
  return (
    <IntranetGate locale={locale} title="Dashboard" breadcrumb="Páginas / Dashboard" permission="dashboard">
      {(session) => <DashboardBody locale={locale} session={session} />}
    </IntranetGate>
  );
}

function DashboardBody({ locale, session }: { locale: string; session: IntranetSession }) {
  const tools = intranetTools(locale).filter(
    (t) => session.role === 'admin' || session.permissions.includes(t.permission)
  );
  const canManageUsers = session.role === 'admin' || session.permissions.includes('users.manage');

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#009179]">Resumen</p>
        <h2 className="mt-2 text-xl font-bold text-[#071F5E]">Hola, {session.name.split(' ')[0]}</h2>
        <p className="mt-1 text-sm text-[#1E1E1E]/60">
          Rol: <span className="font-semibold text-[#071F5E]">{session.role}</span>
          {tools.length > 0 ? (
            <>
              {' · '}
              {tools.length} herramienta{tools.length === 1 ? '' : 's'} disponible
              {tools.length === 1 ? '' : 's'}
            </>
          ) : null}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href={`/${locale}/intranet/herramientas`}
            className="inline-flex items-center justify-center rounded-xl bg-[#009179] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Ir a herramientas
          </Link>
          {canManageUsers ? (
            <Link
              href={`/${locale}/intranet/usuarios`}
              className="inline-flex items-center justify-center rounded-xl border border-[#071F5E]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#071F5E]"
            >
              Gestionar usuarios
            </Link>
          ) : null}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-bold text-[#071F5E]">Accesos rápidos</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[16/10] bg-[#EEF3F7]">
                <Image
                  src={tool.image}
                  alt=""
                  fill
                  className="object-cover transition group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, 360px"
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-[#071F5E]">{tool.title}</h4>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#1E1E1E]/65">{tool.description}</p>
                <span className="mt-3 inline-flex rounded-lg bg-[#071F5E] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white">
                  Abrir
                </span>
              </div>
            </Link>
          ))}
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#071F5E]/20 bg-white/60 p-4 text-center sm:min-h-[220px]">
            <span className="text-3xl font-light text-[#071F5E]/35">+</span>
            <p className="mt-2 text-sm font-semibold text-[#071F5E]/55">Más herramientas pronto</p>
          </div>
        </div>
      </div>
    </div>
  );
}
