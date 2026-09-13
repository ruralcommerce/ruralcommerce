'use client';

import { SementesHud, SementesLogo, SementesStage } from '@/components/sementes/SementesWave';

export function SementesTitle({
  brand,
  pressStart,
  missionTag,
  onStart,
}: {
  brand: string;
  pressStart: string;
  missionTag: string;
  onStart: () => void;
}) {
  return (
    <button type="button" className="sementes-title" onClick={onStart}>
      <SementesStage />
      <SementesHud />
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-between px-6 py-[max(1.4rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
        <SementesLogo size="lg" />
        <div className="flex flex-col items-center text-center">
          <div className="sementes-title-orbit">
            <img src="/images/icone-branco.png" alt="" className="sementes-title-icon" />
          </div>
          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#52ADAD]">{missionTag}</p>
          <h1 className="sem-display mt-3 max-w-[12ch] text-[3.2rem] leading-[0.88] sm:text-7xl">{brand}</h1>
        </div>
        <p className="sem-press-start">{pressStart}</p>
      </div>
    </button>
  );
}
