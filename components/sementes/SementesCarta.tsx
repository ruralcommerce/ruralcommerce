'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { sementesCopy } from '@/lib/sementes-copy';
import type { SementeOwnerView } from '@/lib/sementes-types';
import { SementesCard } from '@/components/sementes/SementesCard';
import { SementesHud, SementesLogo, SementesStage } from '@/components/sementes/SementesWave';
import {
  readSementesToken,
  sementesJson,
  writeSementesToken,
} from '@/components/sementes/sementes-session';

async function downloadCard(seed: SementeOwnerView) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const gradient = ctx.createLinearGradient(0, 0, 0, 1350);
  gradient.addColorStop(0, '#0e345b');
  gradient.addColorStop(0.55, '#071f5e');
  gradient.addColorStop(1, '#00071b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.fillStyle = 'rgba(0,145,121,0.22)';
  ctx.beginPath();
  ctx.arc(900, 160, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '600 28px Lexend, sans-serif';
  ctx.fillText((seed.path === 'servico' ? 'SERVIÇO' : 'PRODUTO') + ' · SEMENTES DA INOVAÇÃO', 80, 120);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 72px Arboria, Lexend, sans-serif';
  ctx.fillText(seed.alias, 80, 230);
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.font = '400 36px Lexend, sans-serif';
  wrapText(ctx, seed.hook || seed.solution, 80, 330, 920, 48);
  ctx.fillStyle = '#52adad';
  ctx.font = '600 28px Lexend, sans-serif';
  ctx.fillText(seed.impacts.map((item) => item).join('  ·  ') || 'semente', 80, 1180);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '500 22px Lexend, sans-serif';
  ctx.fillText('Rural Commerce  ·  palco anônimo', 80, 1260);
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${seed.alias.replace(/\s+/g, '-').toLowerCase()}.png`;
  a.click();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let cursor = y;
  for (const word of words) {
    const test = `${line}${word} `;
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, x, cursor);
      line = `${word} `;
      cursor += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, cursor);
}

export function SementesCarta({ locale, mode = 'carta' }: { locale: string; mode?: 'carta' | 'entrar' }) {
  const t = sementesCopy(locale);
  const [token, setToken] = useState('');
  const [seed, setSeed] = useState<SementeOwnerView | null>(null);
  const [whatsapp, setWhatsapp] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const existing = readSementesToken();
    if (!existing || mode === 'entrar') return;
    void load(existing);
  }, [mode]);

  async function load(nextToken: string) {
    try {
      const data = await sementesJson<{ seed: SementeOwnerView }>('/api/sementes/draft', { token: nextToken });
      setToken(nextToken);
      writeSementesToken(nextToken);
      setSeed(data.seed);
      if (data.seed.hasVideo) {
        const video = await sementesJson<{ url: string }>('/api/sementes/video?publicId=' + data.seed.publicId, {
          token: nextToken,
        });
        setVideoUrl(video.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.entrarText);
    }
  }

  async function entrar() {
    setError('');
    try {
      const data = await sementesJson<{ token: string; seed: SementeOwnerView }>('/api/sementes/session', {
        method: 'POST',
        body: JSON.stringify({ action: 'entrar', whatsapp, pin }),
      });
      await load(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.entrarText);
    }
  }

  return (
    <div className="sementes-app relative min-h-dvh overflow-hidden">
      <SementesStage />
      <SementesHud />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-12 pt-[max(1.2rem,env(safe-area-inset-top))]">
        <SementesLogo size="sm" />
        <h1 className="sem-display mt-6 text-4xl">{seed ? t.cartaTitle : t.entrarTitle}</h1>
        {!seed ? (
          <>
            <p className="mt-3 text-sm text-white/70">{t.entrarText}</p>
            <input className="sem-input mt-6" inputMode="tel" placeholder={t.whatsappLabel} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            <input className="sem-input mt-3" inputMode="numeric" maxLength={4} placeholder={t.pinLabel} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} />
            {error ? <p className="mt-3 text-sm text-[#A5D9EF]">{error}</p> : null}
            <button type="button" className="sem-cta mt-5" onClick={() => void entrar()}>
              {t.entrarCta}
            </button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-white/60">
              {seed.name} · {seed.status}
            </p>
            <button type="button" className="mt-5 text-left" onClick={() => setFlipped((value) => !value)}>
              <div className={`sem-card-3d ${flipped ? 'is-back' : ''}`}>
                <div className="sem-card-face">
                  <SementesCard alias={seed.alias} path={seed.path} hook={seed.hook} impacts={seed.impacts} heat={seed.heat} />
                </div>
              </div>
            </button>
            {videoUrl ? (
              <video className="mt-4 w-full rounded-[24px] bg-black" src={videoUrl} controls playsInline />
            ) : (
              <p className="mt-4 text-sm text-white/55">{t.recordHint}</p>
            )}
            <div className="mt-6 grid gap-2">
              <button type="button" className="sem-cta" onClick={() => void downloadCard(seed)}>
                {t.exportPng}
              </button>
              {videoUrl ? (
                <a className="sem-ghost flex items-center justify-center" href={videoUrl} download>
                  {t.exportVideo}
                </a>
              ) : null}
              <Link href={`/${locale}/sementes`} className="sem-ghost flex items-center justify-center">
                {t.editSeed}
              </Link>
              <Link href={`/${locale}/sementes/palco`} className="text-center text-sm text-white/60 underline">
                {t.seePalco}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
