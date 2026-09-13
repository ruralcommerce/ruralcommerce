'use client';

import { useEffect, useMemo, useState } from 'react';
import { sementesCopy } from '@/lib/sementes-copy';
import type { SementeStatus, SementeTeamView } from '@/lib/sementes-types';
import { SementesHud, SementesLogo, SementesStage } from '@/components/sementes/SementesWave';
import { sementesJson, useSementesLock } from '@/components/sementes/sementes-session';

const TEAM_KEY = 'rc_sementes_team';

type TeamSeed = SementeTeamView & { videoUrl?: string };

export function SementesMesa({ locale }: { locale: string }) {
  const t = sementesCopy(locale);
  useSementesLock('fill');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [seeds, setSeeds] = useState<TeamSeed[]>([]);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [watching, setWatching] = useState<TeamSeed | null>(null);

  useEffect(() => {
    const existing = window.sessionStorage.getItem(TEAM_KEY) || '';
    if (existing) {
      setToken(existing);
      void load(existing);
    }
  }, []);

  async function load(nextToken: string) {
    const data = await sementesJson<{ seeds: TeamSeed[] }>('/api/sementes/team', { token: nextToken });
    setSeeds(data.seeds || []);
  }

  async function login() {
    setError('');
    try {
      const data = await sementesJson<{ token: string }>('/api/sementes/team', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', password }),
      });
      window.sessionStorage.setItem(TEAM_KEY, data.token);
      setToken(data.token);
      await load(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.mesaPassword);
    }
  }

  async function setStatus(publicId: string, status: SementeStatus) {
    const data = await sementesJson<{ seed: TeamSeed }>('/api/sementes/team', {
      method: 'POST',
      token,
      body: JSON.stringify({ action: 'status', publicId, status }),
    });
    setSeeds((current) => current.map((seed) => (seed.publicId === publicId ? { ...seed, ...data.seed } : seed)));
  }

  async function flip() {
    await sementesJson('/api/sementes/team', {
      method: 'POST',
      token,
      body: JSON.stringify({ action: 'flip' }),
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return seeds;
    return seeds.filter((seed) =>
      `${seed.alias} ${seed.name} ${seed.hook} ${seed.whatsapp}`.toLowerCase().includes(q)
    );
  }, [query, seeds]);

  if (!token) {
    return (
      <div className="sementes-app sementes-arena relative">
        <SementesStage />
        <SementesHud />
        <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
          <SementesLogo />
          <h1 className="sem-display mt-6 text-4xl">{t.mesaTitle}</h1>
          <input
            className="sem-input mt-6"
            type="password"
            placeholder={t.mesaPassword}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? <p className="mt-3 text-sm text-[#A5D9EF]">{error}</p> : null}
          <button type="button" className="sem-cta mt-4" onClick={() => void login()}>
            {t.mesaEnter}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sementes-app sementes-shell-light sementes-scroll relative min-h-full overflow-y-auto">
      <header className="relative overflow-hidden bg-[#071F5E] text-white">
        <SementesStage />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-8">
          <div>
            <SementesLogo size="sm" />
            <h1 className="sem-display mt-4 text-4xl text-white">{t.mesaTitle}</h1>
            <p className="mt-2 text-sm text-white/70">{seeds.length} {t.palcoCount}</p>
          </div>
          <button type="button" className="sem-cta" onClick={() => void flip()}>
            {t.mesaFlip}
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <input
          className="w-full rounded-2xl border border-[#D9E3EC] bg-white px-4 py-3 text-sm"
          placeholder="alias, nome, ideia…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="mt-5 overflow-hidden rounded-[28px] border border-[#E6EBF1] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F4F4F4] text-[11px] uppercase tracking-[0.14em] text-[#1D6359]">
              <tr>
                <th className="px-4 py-3">Índice</th>
                <th className="px-4 py-3">Semente</th>
                <th className="px-4 py-3">Pessoa</th>
                <th className="px-4 py-3">Ideia</th>
                <th className="px-4 py-3">Verso</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((seed) => (
                <tr key={seed.publicId} className="border-t border-[#EEF2F6] align-top">
                  <td className="px-4 py-3 font-bold text-[#071F5E]">{seed.score}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#071F5E]">{seed.alias}</p>
                    <p className="text-xs text-[#1D6359]">{seed.status} · 🔥 {seed.heat}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{seed.name}</p>
                    <a className="text-xs text-[#009179]" href={`https://wa.me/${seed.whatsapp}`} target="_blank" rel="noreferrer">
                      {seed.whatsapp}
                    </a>
                  </td>
                  <td className="px-4 py-3 max-w-xs text-[#2F3336]">{seed.hook}</td>
                  <td className="px-4 py-3">
                    {seed.videoUrl ? (
                      <button type="button" className="font-semibold text-[#009179]" onClick={() => setWatching(seed)}>
                        play
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button type="button" className="rounded-full bg-[#E7F3F3] px-2 py-1 text-xs" onClick={() => void setStatus(seed.publicId, 'shortlisted')}>
                        {t.shortlist}
                      </button>
                      <button type="button" className="rounded-full bg-[#52ADAD] px-2 py-1 text-xs font-bold text-[#071F5E]" onClick={() => void setStatus(seed.publicId, 'mentorship')}>
                        {t.mentorship}
                      </button>
                      <button type="button" className="rounded-full px-2 py-1 text-xs text-[#2E4066]" onClick={() => void setStatus(seed.publicId, 'wait')}>
                        {t.wait}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {watching?.videoUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setWatching(null)}>
          <video className="max-h-[86vh] max-w-sm rounded-[28px]" src={watching.videoUrl} controls autoPlay playsInline onClick={(e) => e.stopPropagation()} />
        </div>
      ) : null}
    </div>
  );
}
