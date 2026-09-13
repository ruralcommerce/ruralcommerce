'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Coins, Leaf, Users } from 'lucide-react';
import { sementesCopy, sementesLocale } from '@/lib/sementes-copy';
import type { SementeImpact, SementeOwnerView, SementePath } from '@/lib/sementes-types';
import { SementesCard } from '@/components/sementes/SementesCard';
import { SementesRecorder } from '@/components/sementes/SementesRecorder';
import { SementesHud, SementesLogo, SementesStage } from '@/components/sementes/SementesWave';
import { SementesTitle } from '@/components/sementes/SementesTitle';
import {
  readSementesToken,
  sementesJson,
  writeSementesToken,
} from '@/components/sementes/sementes-session';

const SPRINT_MS = 15 * 60 * 1000;

function vibrate() {
  try {
    navigator.vibrate?.(18);
  } catch {
    /* ignore */
  }
}

export function SementesPlay({ locale }: { locale: string }) {
  const t = sementesCopy(locale);
  const [token, setToken] = useState('');
  const [seed, setSeed] = useState<SementeOwnerView | null>(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [pin, setPin] = useState('');
  const [path, setPath] = useState<SementePath | undefined>();
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [impacts, setImpacts] = useState<SementeImpact[]>([]);
  const [impactNote, setImpactNote] = useState('');
  const [fuel, setFuel] = useState('');
  const [fuelChips, setFuelChips] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [titleOpen, setTitleOpen] = useState(true);
  const [flipAt, setFlipAt] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const saveTimer = useRef<number | null>(null);

  const hook = solution.trim() || problem.trim();
  const remaining = Math.max(0, SPRINT_MS - (now - startedAt));
  const mm = String(Math.floor(remaining / 60000)).padStart(2, '0');
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
  const progress = seed ? Math.min(100, (Math.max(step, 1) / 7) * 100) : 8;

  function hydrate(next: SementeOwnerView, nextToken?: string) {
    setSeed(next);
    setName(next.name);
    setPath(next.path);
    setProblem(next.problem);
    setSolution(next.solution);
    setImpacts(next.impacts);
    setImpactNote(next.impactNote);
    setFuel(next.fuel);
    setFuelChips(next.fuelChips);
    setStep(next.status === 'draft' ? Math.max(1, next.step) : 7);
    if (nextToken) {
      setToken(nextToken);
      writeSementesToken(nextToken);
      setTitleOpen(false);
    }
  }

  useEffect(() => {
    const existing = readSementesToken();
    if (!existing) return;
    void sementesJson<{ seed: SementeOwnerView }>('/api/sementes/session', {
      method: 'POST',
      body: JSON.stringify({ action: 'resume', token: existing }),
    })
      .then((data) => hydrate(data.seed, existing))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      void fetch('/api/sementes/palco')
        .then((res) => res.json())
        .then((data) => {
          if (data?.room?.flipAt) setFlipAt(data.room.flipAt);
        })
        .catch(() => undefined);
    }, 2500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!flipAt || !seed || step >= 6) return;
    const when = new Date(flipAt).getTime();
    if (when - Date.now() < 12000) {
      setStep(6);
      vibrate();
    }
  }, [flipAt, seed, step]);

  function queueSave(patch: Record<string, unknown>) {
    if (!token) return;
    setSaveState('saving');
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void sementesJson<{ seed: SementeOwnerView }>('/api/sementes/draft', {
        method: 'PUT',
        token,
        body: JSON.stringify(patch),
      })
        .then((data) => {
          setSeed(data.seed);
          setSaveState('saved');
        })
        .catch(() => setSaveState('idle'));
    }, 500);
  }

  const liveSeed = useMemo(
    () => ({
      alias: seed?.alias || '',
      path,
      hook,
      impacts,
    }),
    [seed?.alias, path, hook, impacts]
  );

  async function plant() {
    setBusy(true);
    setError('');
    try {
      const data = await sementesJson<{ token: string; seed: SementeOwnerView }>('/api/sementes/session', {
        method: 'POST',
        body: JSON.stringify({
          action: 'plant',
          name,
          whatsapp,
          pin,
          locale: sementesLocale(locale),
        }),
      });
      hydrate(data.seed, data.token);
      setStartedAt(Date.now());
      vibrate();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.welcomeText);
    } finally {
      setBusy(false);
    }
  }

  function go(next: number, patch?: Record<string, unknown>) {
    setStep(next);
    vibrate();
    if (patch) queueSave({ ...patch, step: next });
    else if (token) queueSave({ step: next });
  }

  function toggleImpact(key: SementeImpact) {
    const next = impacts.includes(key) ? impacts.filter((item) => item !== key) : [...impacts, key];
    setImpacts(next);
    queueSave({ impacts: next, step: 4 });
  }

  function toggleChip(chip: string) {
    const next = fuelChips.includes(chip) ? fuelChips.filter((item) => item !== chip) : [...fuelChips, chip];
    setFuelChips(next);
    queueSave({ fuelChips: next, fuel, step: 5 });
  }

  async function uploadVideo(file: File) {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const data = await sementesJson<{ seed: SementeOwnerView }>('/api/sementes/video', {
        method: 'POST',
        token,
        body: form,
      });
      setSeed(data.seed);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.recordNeedCam);
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      const data = await sementesJson<{ seed: SementeOwnerView }>('/api/sementes/palco', {
        method: 'POST',
        token,
      });
      hydrate(data.seed, token);
      setStep(7);
      vibrate();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.doneText);
    } finally {
      setBusy(false);
    }
  }

  const flipCountdown = flipAt ? Math.max(0, Math.ceil((new Date(flipAt).getTime() - now) / 1000)) : 0;

  if (titleOpen && !seed) {
    return (
      <div className="sementes-app relative min-h-dvh overflow-hidden">
        <SementesTitle
          brand={t.brand}
          pressStart={t.pressStart}
          missionTag={t.missionTag}
          onStart={() => {
            vibrate();
            setTitleOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="sementes-app relative flex min-h-dvh flex-col overflow-hidden">
      <SementesStage />
      <SementesHud />
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 pb-2 pt-[max(0.9rem,env(safe-area-inset-top))]">
        <SementesLogo size="sm" />
        <div className="text-right">
          {seed ? <p className="sem-timer text-sm font-semibold text-[#A5D9EF]">{mm}:{ss}</p> : null}
          <p className="text-[11px] text-white/50">
            {saveState === 'saving' ? t.saving : saveState === 'saved' ? t.saved : seed ? t.saveNow : t.missionTag}
          </p>
        </div>
      </div>
      <div className="relative z-10 px-4">
        <div className="sem-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 flex gap-1.5">
          {Array.from({ length: 7 }).map((_, index) => (
            <span key={index} className={`sem-seed-dot ${step > index ? 'is-on' : ''}`} />
          ))}
        </div>
      </div>

      {flipCountdown > 0 && flipCountdown <= 8 ? (
        <div className="relative z-20 mx-4 mt-3 rounded-2xl bg-[#009179] px-4 py-3 text-center text-sm font-bold text-white">
          {t.flipSoon} · {flipCountdown}
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        {step === 0 ? (
          <section className="sem-step flex flex-1 flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#52ADAD]">{t.missionTag}</p>
            <h1 className="sem-display mt-2 text-[2.1rem] leading-[0.95] sm:text-5xl">{t.playerSetup}</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/75">{t.playerSetupText}</p>
            <div className="sem-player-panel mt-5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">{t.nameLabel}</label>
              <input className="sem-input mt-2" value={name} placeholder={t.namePlaceholder} onChange={(e) => setName(e.target.value)} />
              <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">{t.whatsappLabel}</label>
              <input className="sem-input mt-2" inputMode="tel" value={whatsapp} placeholder={t.whatsappPlaceholder} onChange={(e) => setWhatsapp(e.target.value)} />
              <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">{t.pinLabel}</label>
              <input className="sem-input mt-2" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} />
              <p className="mt-2 text-xs text-white/45">{t.pinHint}</p>
            </div>
            {error ? <p className="mt-3 text-sm text-[#A5D9EF]">{error}</p> : null}
            <button type="button" className="sem-cta mt-auto" disabled={busy} onClick={() => void plant()}>
              {t.plantCta}
            </button>
            <Link href={`/${locale}/sementes/entrar`} className="mt-3 text-center text-sm text-white/60 underline">
              {t.entrarTitle}
            </Link>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="sem-step space-y-4">
            <h1 className="sem-display text-4xl leading-none">{t.pathTitle}</h1>
            <p className="text-sm text-white/70">{t.pathText}</p>
            <button
              type="button"
              className={`sem-path w-full ${path === 'produto' ? 'is-on' : ''}`}
              onClick={() => {
                setPath('produto');
                go(2, { path: 'produto' });
              }}
            >
              <p className="sem-display text-2xl">{t.produto}</p>
              <p className="mt-1 text-sm text-white/70">{t.produtoHint}</p>
            </button>
            <button
              type="button"
              className={`sem-path w-full ${path === 'servico' ? 'is-on' : ''}`}
              onClick={() => {
                setPath('servico');
                go(2, { path: 'servico' });
              }}
            >
              <p className="sem-display text-2xl">{t.servico}</p>
              <p className="mt-1 text-sm text-white/70">{t.servicoHint}</p>
            </button>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="sem-step flex flex-1 flex-col">
            <h1 className="sem-display text-3xl leading-none sm:text-4xl">{t.problemTitle}</h1>
            <p className="mt-3 text-sm text-white/70">{t.problemHint}</p>
            <textarea
              className="sem-area mt-5"
              value={problem}
              placeholder={t.problemPlaceholder}
              onChange={(e) => {
                setProblem(e.target.value);
                queueSave({ problem: e.target.value, step: 2 });
              }}
            />
            <div className="mt-auto flex gap-2 pt-4">
              <button type="button" className="sem-ghost" onClick={() => setStep(1)}>
                {t.back}
              </button>
              <button type="button" className="sem-cta flex-1" disabled={problem.trim().length < 8} onClick={() => go(3, { problem })}>
                {t.next}
              </button>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="sem-step flex flex-1 flex-col">
            <h1 className="sem-display text-3xl leading-none sm:text-4xl">{t.solutionTitle}</h1>
            <p className="mt-3 text-sm text-white/70">{t.solutionHint}</p>
            <textarea
              className="sem-area mt-5"
              value={solution}
              placeholder={t.solutionPlaceholder}
              onChange={(e) => {
                setSolution(e.target.value);
                queueSave({ solution: e.target.value, step: 3 });
              }}
            />
            <div className="mt-auto flex gap-2 pt-4">
              <button type="button" className="sem-ghost" onClick={() => setStep(2)}>
                {t.back}
              </button>
              <button type="button" className="sem-cta flex-1" disabled={solution.trim().length < 8} onClick={() => go(4, { solution })}>
                {t.next}
              </button>
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="sem-step flex flex-1 flex-col">
            <h1 className="sem-display text-3xl leading-none">{t.impactTitle}</h1>
            <p className="mt-3 text-sm text-white/70">{t.impactHint}</p>
            <div className="mt-4 grid gap-2">
              {(
                [
                  ['economico', t.economico, Coins],
                  ['ambiental', t.ambiental, Leaf],
                  ['social', t.social, Users],
                ] as const
              ).map(([key, label, Icon]) => (
                <button
                  key={key}
                  type="button"
                  className={`sem-impact flex items-center gap-3 text-left ${impacts.includes(key) ? 'is-on' : ''}`}
                  onClick={() => toggleImpact(key)}
                >
                  <Icon className="h-5 w-5 text-[#52ADAD]" />
                  <span className="text-sm font-semibold">{label}</span>
                </button>
              ))}
            </div>
            <label className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">{t.impactNoteLabel}</label>
            <textarea
              className="sem-area mt-2 min-h-[5.5rem]"
              value={impactNote}
              placeholder={t.impactPlaceholder}
              onChange={(e) => {
                setImpactNote(e.target.value);
                queueSave({ impactNote: e.target.value, impacts, step: 4 });
              }}
            />
            <div className="mt-auto flex gap-2 pt-4">
              <button type="button" className="sem-ghost" onClick={() => setStep(3)}>
                {t.back}
              </button>
              <button
                type="button"
                className="sem-cta flex-1"
                disabled={!impacts.length || impactNote.trim().length < 6}
                onClick={() => go(5, { impacts, impactNote })}
              >
                {t.next}
              </button>
            </div>
          </section>
        ) : null}

        {step === 5 ? (
          <section className="sem-step flex flex-1 flex-col">
            <h1 className="sem-display text-3xl leading-none">{t.fuelTitle}</h1>
            <p className="mt-3 text-sm text-white/70">{t.fuelHint}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {t.fuelChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={`sem-chip ${fuelChips.includes(chip) ? 'is-on' : ''}`}
                  onClick={() => toggleChip(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
            <textarea
              className="sem-area mt-4 min-h-[5.5rem]"
              value={fuel}
              placeholder={t.fuelPlaceholder}
              onChange={(e) => {
                setFuel(e.target.value);
                queueSave({ fuel: e.target.value, fuelChips, step: 5 });
              }}
            />
            <div className="mt-auto flex gap-2 pt-4">
              <button type="button" className="sem-ghost" onClick={() => setStep(4)}>
                {t.back}
              </button>
              <button
                type="button"
                className="sem-cta flex-1"
                disabled={!fuel.trim() && !fuelChips.length}
                onClick={() => go(6, { fuel, fuelChips })}
              >
                {t.next}
              </button>
            </div>
          </section>
        ) : null}

        {step === 6 ? (
          <section className="sem-step flex flex-1 flex-col">
            <h1 className="sem-display text-3xl leading-none">{t.recordTitle}</h1>
            <p className="mt-3 text-sm text-white/70">{t.recordHint}</p>
            <div className="mt-4">
              <SementesRecorder copy={t} disabled={busy} onReady={(file) => void uploadVideo(file)} />
            </div>
            {error ? <p className="mt-2 text-sm text-[#A5D9EF]">{error}</p> : null}
            {busy ? <p className="mt-2 text-sm text-[#8DCFCF]">{t.recordUploading}</p> : null}
            <div className="mt-auto flex gap-2 pt-4">
              <button type="button" className="sem-ghost" onClick={() => setStep(5)}>
                {t.back}
              </button>
              <button type="button" className="sem-cta flex-1" disabled={busy} onClick={() => void publish()}>
                {seed?.hasVideo ? t.doneTitle : t.recordSkip}
              </button>
            </div>
          </section>
        ) : null}

        {step === 7 ? (
          <section className="sem-step flex flex-1 flex-col">
            <h1 className="sem-display text-4xl leading-none">{t.doneTitle}</h1>
            <p className="mt-3 text-sm text-white/75">{t.doneText}</p>
            <div className="mt-5">
              <SementesCard alias={liveSeed.alias} path={path} hook={hook} impacts={impacts} />
            </div>
            <div className="mt-auto grid gap-2 pt-5">
              <Link href={`/${locale}/sementes/palco`} className="sem-cta flex items-center justify-center">
                {t.seePalco}
              </Link>
              <Link href={`/${locale}/sementes/carta`} className="sem-ghost flex items-center justify-center">
                {t.mySeed}
              </Link>
            </div>
          </section>
        ) : null}

        {step > 1 && step < 6 ? (
          <div className="mt-4">
            <SementesCard compact alias={liveSeed.alias} path={path} hook={hook} impacts={impacts} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
