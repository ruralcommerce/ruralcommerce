'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { sementesCopy } from '@/lib/sementes-copy';
import type { SementePublicCard } from '@/lib/sementes-types';
import { SementesCard } from '@/components/sementes/SementesCard';
import { SementesHud, SementesLogo, SementesStage } from '@/components/sementes/SementesWave';
import { readSementesDevice, sementesJson, useSementesLock } from '@/components/sementes/sementes-session';

export function SementesPalco({ locale }: { locale: string }) {
  const t = sementesCopy(locale);
  const [cards, setCards] = useState<SementePublicCard[]>([]);
  const [bursts, setBursts] = useState<Record<string, number>>({});
  useSementesLock('fill');

  async function refresh() {
    const data = await sementesJson<{ cards: SementePublicCard[] }>('/api/sementes/palco');
    setCards(data.cards || []);
  }

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 2500);
    return () => window.clearInterval(id);
  }, []);

  async function fire(publicId: string) {
    try {
      const data = await sementesJson<{ card: SementePublicCard }>('/api/sementes/heat', {
        method: 'POST',
        body: JSON.stringify({ publicId, deviceId: readSementesDevice() }),
      });
      setBursts((current) => ({ ...current, [publicId]: Date.now() }));
      setCards((current) => current.map((card) => (card.publicId === publicId ? data.card : card)));
    } catch {
      /* already fired */
    }
  }

  return (
    <div className="sementes-app sementes-arena sementes-scroll relative overflow-y-auto">
      <SementesStage />
      <SementesHud />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-[max(1.2rem,env(safe-area-inset-top))]">
        <SementesLogo size="sm" />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <h1 className="sem-display text-4xl sm:text-6xl">{t.palcoTitle}</h1>
          <p className="text-sm text-[#A5D9EF]">
            {cards.length} {t.palcoCount}
          </p>
        </div>
        <p className="mt-3 max-w-xl text-sm text-white/65">{t.anonymousNote}</p>
        {!cards.length ? (
          <div className="mt-16">
            <p className="text-lg text-white/70">{t.palcoEmpty}</p>
            <a href={`/${locale}/sementes`} className="sem-cta mt-6 inline-flex items-center">
              {t.plantCta}
            </a>
          </div>
        ) : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.publicId} className="sem-palco-card relative p-1">
              <SementesCard
                alias={card.alias}
                path={card.path}
                hook={card.hook}
                impacts={card.impacts}
                heat={card.heat}
              />
              <button
                type="button"
                className="relative mt-2 flex w-full items-center justify-center gap-2 rounded-b-[22px] py-3 text-sm font-bold text-[#A5D9EF]"
                onClick={() => void fire(card.publicId)}
              >
                <Flame className="h-4 w-4" />
                {t.fire}
                {bursts[card.publicId] ? <span className="sem-heat-burst absolute -top-2 text-lg">🔥</span> : null}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
