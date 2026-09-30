'use client';

import Image from 'next/image';
import Link from 'next/link';
import { intranetTools } from '@/lib/intranet/tools';
import type { IntranetSession } from '@/lib/intranet/types';
import { IntranetGate } from './IntranetGate';

export function IntranetToolsPage({ locale }: { locale: string }) {
  return (
    <IntranetGate
      locale={locale}
      title="Herramientas"
      breadcrumb="Páginas / Herramientas"
      permission="tools.access"
    >
      {(session) => <ToolsBody locale={locale} session={session} />}
    </IntranetGate>
  );
}

function ToolsBody({ locale, session }: { locale: string; session: IntranetSession }) {
  const tools = intranetTools(locale).filter(
    (t) => session.role === 'admin' || session.permissions.includes(t.permission)
  );

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm leading-6 text-[#1E1E1E]/70">
        Elige una herramienta. Solo ves las que tu rol permite.
      </p>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        {tools[0] ? (
          <Link href={tools[0].href} className="group overflow-hidden rounded-2xl border border-[#071F5E]/8">
            <div className="relative aspect-video bg-[#EEF3F7]">
              <Image src={tools[0].image} alt="" fill className="object-cover" sizes="720px" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071F5E]/75 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#52ADAD]">Módulo activo</p>
                <h2 className="mt-1 text-2xl font-bold">{tools[0].title}</h2>
                <p className="mt-2 max-w-lg text-sm text-white/85">{tools[0].description}</p>
              </div>
            </div>
          </Link>
        ) : null}
        <div className="space-y-3">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="flex gap-3 rounded-xl border border-[#071F5E]/10 p-3 transition hover:border-[#009179]"
            >
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-[#EEF3F7]">
                <Image src={tool.image} alt="" fill className="object-cover" sizes="120px" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#009179]">{tool.id}</p>
                <h3 className="font-bold text-[#071F5E]">{tool.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-[#1E1E1E]/60">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
