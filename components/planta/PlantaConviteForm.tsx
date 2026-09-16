'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPlantaPageCopy, plantaPath } from '@/lib/planta-guide';

export function PlantaConviteForm({ locale, initialName = '' }: { locale: string; initialName?: string }) {
  const t = getPlantaPageCopy(locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetCode = searchParams.get('code') || '';
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState(presetCode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const nextPath = useMemo(() => plantaPath(locale, 'inicio'), [locale]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/projeto/planta/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code }),
      });
      const data = (await response.json()) as { ok?: boolean };
      if (!response.ok || !data.ok) {
        setError(t.conviteError);
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError(t.conviteError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="mt-8 max-w-md space-y-4">
      <label className="block text-sm font-medium text-[#071F5E]">
        {t.conviteName}
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          maxLength={120}
          className="mt-2 w-full rounded-2xl border border-[#D9E3EC] bg-white px-4 py-3 text-base text-[#071F5E] outline-none focus:border-[#009179]"
        />
      </label>
      <label className="block text-sm font-medium text-[#071F5E]">
        {t.conviteCode}
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          required
          autoCapitalize="characters"
          spellCheck={false}
          className="mt-2 w-full rounded-2xl border border-[#D9E3EC] bg-white px-4 py-3 text-base tracking-[0.14em] text-[#071F5E] outline-none focus:border-[#009179]"
        />
      </label>
      {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-[#009179] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? t.conviteBusy : t.conviteCta}
      </button>
      <p className="text-sm leading-6 text-[#2F3336]/75">{t.conviteHint}</p>
    </form>
  );
}
