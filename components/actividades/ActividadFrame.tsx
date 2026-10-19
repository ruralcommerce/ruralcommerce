'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';

export function ActividadFrame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#F4F7FA] px-4 py-8 text-[#1E1E1E]">
      <div className="mx-auto w-full max-w-md">
        <Image src="/images/logo.png" alt="Rural Commerce" width={160} height={44} className="mb-6 h-9 w-auto" />
        <div className="rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(7,31,94,0.08)] sm:p-6">{children}</div>
      </div>
    </main>
  );
}

export function ActividadMeta({
  placeLabel,
  whenLabel,
  projectLabel,
  place,
  when,
  project,
}: {
  placeLabel: string;
  whenLabel: string;
  projectLabel: string;
  place?: string;
  when?: string;
  project?: string;
}) {
  const rows = [
    project ? [projectLabel, project] : null,
    place ? [placeLabel, place] : null,
    when ? [whenLabel, when] : null,
  ].filter((row): row is [string, string] => Boolean(row));

  if (!rows.length) return null;
  return (
    <dl className="mt-4 space-y-2 rounded-2xl bg-[#F4F7FA] px-3 py-3 text-sm">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#009179]">{label}</dt>
          <dd className="text-[#071F5E]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
