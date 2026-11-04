'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { MNS_COURSE, MNS_FICHAS } from '@/lib/mns/content';

export default function MnsHomePage() {
  const params = useParams();
  const locale = String(params.locale || 'es');
  const router = useRouter();
  const [code, setCode] = useState('');

  function enter(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (!cleaned) return;
    router.push(`/${locale}/mns/${encodeURIComponent(cleaned)}`);
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#FBFAF8] text-[#071F5E]">
      <header className="relative z-20 flex h-16 shrink-0 items-center justify-between bg-[#071F5E] px-6 text-white sm:h-20 sm:px-10">
        <Link href={`/${locale}`} className="inline-flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-branco.png" alt="Rural Commerce" className="h-8 w-auto sm:h-10" />
        </Link>
        <span className="text-[13px] font-extralight tracking-[0.02em] sm:text-[15px]">MNS Internacional</span>
        <Link href={`/${locale}`} className="text-[13px] font-extralight hover:opacity-80 sm:text-[15px]">
          Sitio
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-10">
        <p className="text-base font-light tracking-[0.02em] sm:text-[23px]">{MNS_COURSE.edition}</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-[42px] sm:leading-[1.15]">{MNS_COURSE.name}</h1>
        <p className="mt-4 text-[15px] leading-6 text-[#071F5E]/75 sm:text-[17px]">{MNS_COURSE.market}</p>

        <form onSubmit={enter} className="mt-8">
          <label className="text-sm font-semibold" htmlFor="mns-code">
            Código de la sala
          </label>
          <input
            id="mns-code"
            className="mt-2 w-full min-h-[66px] rounded-[14px] border border-[#8D99AE] bg-white px-4 text-center text-base tracking-[0.14em] uppercase outline-none focus:border-[#52ADAD]"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="A3K9MP"
            autoCapitalize="characters"
            autoCorrect="off"
          />
          <button
            type="submit"
            className="mt-4 inline-flex min-h-[66px] w-full items-center justify-center rounded-[14px] bg-[#071F5E] px-5 text-base font-bold text-[#F2F2F2]"
          >
            Entrar a la dinámica
          </button>
        </form>

        <div className="mt-8 grid gap-2">
          {MNS_FICHAS.map((f) => (
            <div key={f.id} className="rounded-[14px] bg-white px-4 py-3 shadow-[-7px_5px_13px_-5px_rgba(0,0,0,0.08)]">
              <p className="text-sm font-bold">
                {f.number}. {f.title}
              </p>
              <p className="text-xs text-[#071F5E]/55">Día {f.day}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
