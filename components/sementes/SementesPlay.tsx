'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Briefcase, Coins, Info, Leaf, Package, Users } from 'lucide-react';
import { sementesCopy, sementesLocale } from '@/lib/sementes-copy';
import type { SementeImpact, SementeOwnerView, SementePath } from '@/lib/sementes-types';
import { SementesCard } from '@/components/sementes/SementesCard';
import { SementesRecorder } from '@/components/sementes/SementesRecorder';
import { SementesHud, SementesLogo, SementesStage } from '@/components/sementes/SementesWave';
import { SementesTitle } from '@/components/sementes/SementesTitle';
import {
  readSementesToken,
  sementesJson,
  useSementesLock,
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

function SemGuide({
  speaker,
  title,
  text,
  info,
  whyClose,
  infoAria,
}: {
  speaker: string;
  title: string;
  text?: string;
  info?: string;
  whyClose: string;
  infoAria: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sem-guide">
      <div className="sem-guide-top">
        <p className="sem-guide-name">{speaker}</p>
        {info ? (
          <button
            type="button"
            className={`sem-info ${open ? 'is-on' : ''}`}
            aria-label={infoAria}
            aria-expanded={open}
            onClick={() => {
              setOpen((value) => !value);
              vibrate();
            }}
          >
            <Info className="h-3.5 w-3.5" strokeWidth={2.6} />
          </button>
        ) : null}
      </div>
      <h1 className="sem-display">{title}</h1>
      {text ? <p className="sem-prompt">{text}</p> : null}
      {open && info ? (
        <div className="sem-why">
          <p>{info}</p>
          <button type="button" className="sem-why-ok" onClick={() => setOpen(false)}>
            {whyClose}
          </button>
        </div>
      ) : null}
    </div>
  );
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
  const [introBeat, setIntroBeat] = useState(0);
  const [flipAt, setFlipAt] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const saveTimer = useRef<number | null>(null);
  useSementesLock();

  const hook = solution.trim() || problem.trim();
  const remaining = Math.max(0, SPRINT_MS - (now - startedAt));
  const mm = String(Math.floor(remaining / 60000)).padStart(2, '0');
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');

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
    if (step !== 1) return;
    function onKey(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (key === 'a' || key === '1') {
        setPath('produto');
        go(2, { path: 'produto' });
      }
      if (key === 'b' || key === '2') {
        setPath('servico');
        go(2, { path: 'servico' });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

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
  const introReady =
    introBeat === 0 ? name.trim().length >= 2 : introBeat === 1 ? whatsapp.replace(/\D/g, '').length >= 8 : pin.length === 4;

  if (titleOpen && !seed) {
    return (
      <div className="sementes-app sementes-arena relative overflow-hidden">
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
    <div className="sementes-app sementes-arena relative flex flex-col overflow-hidden">
      <SementesStage />
      <SementesHud />
      <header className="sem-top relative z-10">
        <SementesLogo size="sm" />
        <div className="text-right">
          {seed ? <p className="sem-timer text-sm font-semibold text-[#A5D9EF]">{mm}:{ss}</p> : null}
          <p className="text-[11px] text-white/50">
            {saveState === 'saving' ? t.saving : saveState === 'saved' ? t.saved : seed ? t.saveNow : t.missionTag}
          </p>
        </div>
      </header>
      <div className="sem-xp relative z-10">
        {Array.from({ length: 7 }).map((_, index) => (
          <span key={index} className={`sem-seed-dot ${step > index ? 'is-on' : ''}`} />
        ))}
      </div>

      {flipCountdown > 0 && flipCountdown <= 8 ? (
        <div className="relative z-20 mx-auto mt-2 rounded-full bg-[#009179] px-4 py-2 text-center text-xs font-bold text-white">
          {t.flipSoon} · {flipCountdown}
        </div>
      ) : null}

      <main className="sem-arena-main relative z-10">
        {step === 0 ? (
          <section className="sem-step w-full">
            <SemGuide
              key={introBeat}
              speaker={t.guideName}
              title={introBeat === 0 ? t.nameLabel : introBeat === 1 ? t.whatsappLabel : t.pinLabel}
              text={introBeat === 2 ? t.pinHint : t.playerSetupText}
              info={introBeat === 0 ? t.nameInfo : introBeat === 1 ? t.whatsappInfo : t.pinInfo}
              whyClose={t.whyClose}
              infoAria={t.infoAria}
            />
            {introBeat === 0 ? (
              <input
                className="sem-say"
                value={name}
                placeholder={t.namePlaceholder}
                autoFocus
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && introReady) {
                    setIntroBeat(1);
                    vibrate();
                  }
                }}
              />
            ) : null}
            {introBeat === 1 ? (
              <input
                className="sem-say"
                inputMode="tel"
                value={whatsapp}
                placeholder={t.whatsappPlaceholder}
                autoFocus
                autoComplete="tel"
                onChange={(e) => setWhatsapp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && introReady) {
                    setIntroBeat(2);
                    vibrate();
                  }
                }}
              />
            ) : null}
            {introBeat === 2 ? (
              <input
                className="sem-say tracking-[0.4em]"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                placeholder="••••"
                autoFocus
                autoComplete="one-time-code"
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && introReady && !busy) void plant();
                }}
              />
            ) : null}
            {error ? <p className="mt-3 text-sm text-[#A5D9EF]">{error}</p> : null}
            <div className="sem-actions">
              {introBeat > 0 ? (
                <button type="button" className="sem-ghost" onClick={() => setIntroBeat((beat) => beat - 1)}>
                  {t.back}
                </button>
              ) : null}
              <button
                type="button"
                className="sem-cta"
                disabled={!introReady || busy}
                onClick={() => {
                  if (introBeat < 2) {
                    setIntroBeat((beat) => beat + 1);
                    vibrate();
                    return;
                  }
                  void plant();
                }}
              >
                {introBeat < 2 ? t.next : t.plantCta}
              </button>
            </div>
            <Link href={`/${locale}/sementes/entrar`} className="sem-resume">
              {t.resumeSeed}
            </Link>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="sem-step w-full">
            <SemGuide speaker={t.guideName} title={t.pathTitle} text={t.pathText} info={t.pathInfo} whyClose={t.whyClose} infoAria={t.infoAria} />
            <div className="sem-class-row">
              <button
                type="button"
                className={`sem-class ${path === 'produto' ? 'is-on' : ''}`}
                onClick={() => {
                  setPath('produto');
                  go(2, { path: 'produto' });
                }}
              >
                <span className="sem-class-key">A</span>
                <Package className="sem-class-icon" />
                <p className="sem-display text-xl">{t.produto}</p>
                <p className="text-[11px] leading-4 text-white/65">{t.produtoHint}</p>
              </button>
              <button
                type="button"
                className={`sem-class ${path === 'servico' ? 'is-on' : ''}`}
                onClick={() => {
                  setPath('servico');
                  go(2, { path: 'servico' });
                }}
              >
                <span className="sem-class-key">B</span>
                <Briefcase className="sem-class-icon" />
                <p className="sem-display text-xl">{t.servico}</p>
                <p className="text-[11px] leading-4 text-white/65">{t.servicoHint}</p>
              </button>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="sem-step w-full">
            <SemGuide speaker={t.guideName} title={t.problemTitle} text={t.problemHint} info={t.problemInfo} whyClose={t.whyClose} infoAria={t.infoAria} />
            <div className="sem-dialogue">
              <textarea
                value={problem}
                placeholder={t.problemPlaceholder}
                onChange={(e) => {
                  setProblem(e.target.value);
                  queueSave({ problem: e.target.value, step: 2 });
                }}
              />
            </div>
            <div className="sem-actions">
              <button type="button" className="sem-ghost" onClick={() => setStep(1)}>
                {t.back}
              </button>
              <button type="button" className="sem-cta" disabled={problem.trim().length < 8} onClick={() => go(3, { problem })}>
                {t.next}
              </button>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="sem-step w-full">
            <SemGuide speaker={t.guideName} title={t.solutionTitle} text={t.solutionHint} info={t.solutionInfo} whyClose={t.whyClose} infoAria={t.infoAria} />
            <div className="sem-dialogue">
              <textarea
                value={solution}
                placeholder={t.solutionPlaceholder}
                onChange={(e) => {
                  setSolution(e.target.value);
                  queueSave({ solution: e.target.value, step: 3 });
                }}
              />
            </div>
            <div className="sem-actions">
              <button type="button" className="sem-ghost" onClick={() => setStep(2)}>
                {t.back}
              </button>
              <button type="button" className="sem-cta" disabled={solution.trim().length < 8} onClick={() => go(4, { solution })}>
                {t.next}
              </button>
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="sem-step w-full">
            <SemGuide speaker={t.guideName} title={t.impactTitle} text={t.impactHint} info={t.impactInfo} whyClose={t.whyClose} infoAria={t.infoAria} />
            <div className="sem-orbs">
              {(
                [
                  ['economico', t.economico, t.economicoHint, Coins],
                  ['ambiental', t.ambiental, t.ambientalHint, Leaf],
                  ['social', t.social, t.socialHint, Users],
                ] as const
              ).map(([key, label, hint, Icon]) => (
                <button
                  key={key}
                  type="button"
                  className={`sem-orb ${impacts.includes(key) ? 'is-on' : ''}`}
                  onClick={() => toggleImpact(key)}
                >
                  <Icon className="h-6 w-6 text-[#52ADAD]" />
                  <span className="sem-orb-label">{label}</span>
                  <span className="sem-orb-hint">{hint}</span>
                </button>
              ))}
            </div>
            <input
              className="sem-say"
              value={impactNote}
              placeholder={t.impactPlaceholder}
              onChange={(e) => {
                setImpactNote(e.target.value);
                queueSave({ impactNote: e.target.value, impacts, step: 4 });
              }}
            />
            <div className="sem-actions">
              <button type="button" className="sem-ghost" onClick={() => setStep(3)}>
                {t.back}
              </button>
              <button
                type="button"
                className="sem-cta"
                disabled={!impacts.length || impactNote.trim().length < 6}
                onClick={() => go(5, { impacts, impactNote })}
              >
                {t.next}
              </button>
            </div>
          </section>
        ) : null}

        {step === 5 ? (
          <section className="sem-step w-full">
            <SemGuide speaker={t.guideName} title={t.fuelTitle} text={t.fuelHint} info={t.fuelInfo} whyClose={t.whyClose} infoAria={t.infoAria} />
            <div className="sem-inventory">
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
            <input
              className="sem-say"
              value={fuel}
              placeholder={t.fuelPlaceholder}
              onChange={(e) => {
                setFuel(e.target.value);
                queueSave({ fuel: e.target.value, fuelChips, step: 5 });
              }}
            />
            <div className="sem-actions">
              <button type="button" className="sem-ghost" onClick={() => setStep(4)}>
                {t.back}
              </button>
              <button
                type="button"
                className="sem-cta"
                disabled={!fuel.trim() && !fuelChips.length}
                onClick={() => go(6, { fuel, fuelChips })}
              >
                {t.next}
              </button>
            </div>
          </section>
        ) : null}

        {step === 6 ? (
          <section className="sem-step w-full">
            <SemGuide speaker={t.guideName} title={t.recordTitle} text={t.recordHint} info={t.recordInfo} whyClose={t.whyClose} infoAria={t.infoAria} />
            <div className="mt-4 w-full">
              <SementesRecorder copy={t} disabled={busy} onReady={(file) => void uploadVideo(file)} />
            </div>
            {error ? <p className="mt-2 text-sm text-[#A5D9EF]">{error}</p> : null}
            {busy ? <p className="mt-2 text-sm text-[#8DCFCF]">{t.recordUploading}</p> : null}
            <div className="sem-actions">
              <button type="button" className="sem-ghost" onClick={() => setStep(5)}>
                {t.back}
              </button>
              <button type="button" className="sem-cta" disabled={busy} onClick={() => void publish()}>
                {seed?.hasVideo ? t.doneTitle : t.recordSkip}
              </button>
            </div>
          </section>
        ) : null}

        {step === 7 ? (
          <section className="sem-step w-full">
            <SemGuide speaker={t.guideName} title={t.doneTitle} text={t.doneText} info={t.doneInfo} whyClose={t.whyClose} infoAria={t.infoAria} />
            <div className="mt-5 text-left">
              <SementesCard alias={liveSeed.alias} path={path} hook={hook} impacts={impacts} />
            </div>
            <div className="sem-actions">
              <Link href={`/${locale}/sementes/carta`} className="sem-ghost flex items-center justify-center">
                {t.mySeed}
              </Link>
              <Link href={`/${locale}/sementes/palco`} className="sem-cta flex items-center justify-center">
                {t.seePalco}
              </Link>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
