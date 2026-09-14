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
  useSementesLock,
  writeSementesToken,
} from '@/components/sementes/sementes-session';

async function renderCardPng(seed: SementeOwnerView, t: ReturnType<typeof sementesCopy>) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1620;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const gradient = ctx.createLinearGradient(0, 0, 0, 1620);
  gradient.addColorStop(0, '#0e345b');
  gradient.addColorStop(0.55, '#071f5e');
  gradient.addColorStop(1, '#00071b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1620);
  ctx.fillStyle = 'rgba(0,145,121,0.22)';
  ctx.beginPath();
  ctx.arc(900, 160, 180, 0, Math.PI * 2);
  ctx.fill();

  const pathLabel = seed.path === 'servico' ? t.servico : seed.path === 'produto' ? t.produto : 'Semente';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '600 28px Lexend, sans-serif';
  ctx.fillText(`${pathLabel.toUpperCase()} · SEMENTES DA INOVAÇÃO`, 80, 110);

  let y = 180;
  const idea = (seed.solution || seed.hook || '').trim();
  y = drawBlock(ctx, t.cardIdea.toUpperCase(), idea, 80, y, 920, true);
  y = drawBlock(ctx, t.cardProblem.toUpperCase(), seed.problem, 80, y + 18, 920, false);
  const impactLine = seed.impacts.map((item) => t[item]).filter(Boolean).join('  ·  ');
  y = drawBlock(ctx, t.cardImpact.toUpperCase(), [impactLine, seed.impactNote].filter(Boolean).join('\n'), 80, y + 18, 920, false);
  const test = [seed.fuel, ...(seed.fuelChips || [])].filter((item) => item && item.trim()).join(' · ');
  y = drawBlock(ctx, t.cardTest.toUpperCase(), test, 80, y + 18, 920, false);

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '500 22px Lexend, sans-serif';
  ctx.fillText('Rural Commerce  ·  palco sem nome', 80, 1540);
  return canvas.toDataURL('image/png');
}

function cardSlug(seed: SementeOwnerView) {
  return (seed.solution || seed.hook || 'semente').slice(0, 40).replace(/\s+/g, '-').toLowerCase();
}

async function downloadCard(seed: SementeOwnerView, t: ReturnType<typeof sementesCopy>) {
  const url = await renderCardPng(seed, t);
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.download = `${cardSlug(seed)}.png`;
  a.click();
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  label: string,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  hero: boolean
) {
  const body = (text || '').trim();
  if (!body) return y;
  ctx.fillStyle = '#8DCFCF';
  ctx.font = '600 22px Lexend, sans-serif';
  ctx.fillText(label, x, y);
  ctx.fillStyle = hero ? '#ffffff' : 'rgba(255,255,255,0.88)';
  ctx.font = hero ? '700 42px Arboria, Lexend, sans-serif' : '400 32px Lexend, sans-serif';
  return wrapText(ctx, body, x, y + (hero ? 58 : 48), maxWidth, hero ? 52 : 42);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.replace(/\n/g, ' \n ').split(' ');
  let line = '';
  let cursor = y;
  for (const word of words) {
    if (word === '\n') {
      ctx.fillText(line, x, cursor);
      line = '';
      cursor += lineHeight;
      continue;
    }
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
  return cursor;
}

export function SementesCarta({ locale, mode = 'carta' }: { locale: string; mode?: 'carta' | 'entrar' }) {
  const t = sementesCopy(locale);
  const [token, setToken] = useState('');
  const [seed, setSeed] = useState<SementeOwnerView | null>(null);
  const [whatsapp, setWhatsapp] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [open, setOpen] = useState(false);
  useSementesLock(seed ? 'lock' : 'fill');

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

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
    <div
      className={`sementes-app sementes-arena relative ${
        seed ? 'h-full overflow-hidden' : 'sementes-scroll overflow-y-auto'
      }`}
    >
      <SementesStage />
      <SementesHud />
      {!seed ? (
        <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-12 pt-[max(1.2rem,env(safe-area-inset-top))]">
          <SementesLogo size="sm" />
          <h1 className="sem-display mt-6 text-4xl">{t.entrarTitle}</h1>
          <p className="mt-3 text-sm text-white/70">{t.entrarText}</p>
          <input className="sem-input mt-6" inputMode="tel" placeholder={t.whatsappLabel} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          <input className="sem-input mt-3" inputMode="numeric" maxLength={4} placeholder={t.pinLabel} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} />
          {error ? <p className="mt-3 text-sm text-[#A5D9EF]">{error}</p> : null}
          <button type="button" className="sem-cta mt-5" onClick={() => void entrar()}>
            {t.entrarCta}
          </button>
        </div>
      ) : (
        <div className="sem-carta">
          <header className="sem-carta-top">
            <SementesLogo size="sm" />
            <h1 className="sem-display">{t.cartaTitle}</h1>
            <p>
              {seed.name} · {seed.status}
            </p>
          </header>
          <div className="sem-carta-board">
            <div className="sem-carta-front">
              <SementesCard
                path={seed.path}
                idea={seed.solution || seed.hook}
                problem={seed.problem}
                impactNote={seed.impactNote}
                fuel={seed.fuel}
                fuelChips={seed.fuelChips}
                impacts={seed.impacts}
                heat={seed.heat}
                copy={t}
              />
            </div>
            <div className="sem-carta-verso">
              {videoUrl ? (
                <video src={videoUrl} controls playsInline />
              ) : (
                <p className="sem-carta-verso-empty">{t.recordHint}</p>
              )}
            </div>
          </div>
          <div className="sem-carta-actions">
            <button type="button" className="sem-cta" onClick={() => setOpen(true)}>
              {t.viewCard}
            </button>
            <button type="button" className="sem-ghost" onClick={() => void downloadCard(seed, t)}>
              {t.exportPng}
            </button>
            {videoUrl ? (
              <a className="sem-ghost" href={videoUrl} download>
                {t.exportVideo}
              </a>
            ) : null}
            <Link href={`/${locale}/sementes`} className="sem-ghost">
              {t.editSeed}
            </Link>
            <Link href={`/${locale}/sementes/palco`} className="sem-carta-link">
              {t.seePalco}
            </Link>
          </div>
        </div>
      )}
      {open && seed ? (
        <div className="sem-carta-modal" role="dialog" aria-modal="true" aria-label={t.viewCard}>
          <button type="button" className="sem-carta-modal-back" onClick={() => setOpen(false)} aria-label={t.closeCard} />
          <div className="sem-carta-modal-sheet">
            <SementesCard
              path={seed.path}
              idea={seed.solution || seed.hook}
              problem={seed.problem}
              impactNote={seed.impactNote}
              fuel={seed.fuel}
              fuelChips={seed.fuelChips}
              impacts={seed.impacts}
              heat={seed.heat}
              copy={t}
            />
            {videoUrl ? <video className="sem-carta-modal-video" src={videoUrl} controls playsInline /> : null}
            <div className="sem-carta-modal-actions">
              <button type="button" className="sem-ghost" onClick={() => setOpen(false)}>
                {t.closeCard}
              </button>
              <button type="button" className="sem-cta" onClick={() => void downloadCard(seed, t)}>
                {t.exportPng}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
