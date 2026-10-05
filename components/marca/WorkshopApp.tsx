'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MARCA_PALETTE_META,
  MARCA_TONES,
  type MarcaPublicImage,
  type MarcaPublicWorkshop,
  type MarcaTone,
} from '@/lib/marca/types';
import { ParticipantMoodboard } from './ParticipantMoodboard';

type Step = 'intro' | 'name' | 'colors' | 'estilo' | 'result';

const PALETTE_ORDER: MarcaTone[] = ['sobrio', 'terroso', 'vibrante', 'pastel'];

type SavedSession = {
  participantId: string;
  name: string;
  step: Step;
  paletteTones: string[];
  styleImageIds: string[];
  completedAt?: string | null;
};

function sessionKey(code: string) {
  return `marca-oficina:${code.trim().toUpperCase()}`;
}

function loadSession(code: string): SavedSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(sessionKey(code));
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedSession;
    if (!data?.participantId || !data?.name) return null;
    return data;
  } catch {
    return null;
  }
}

function saveSession(code: string, data: SavedSession) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(sessionKey(code), JSON.stringify(data));
  } catch {
    // ignore quota
  }
}

function clearSession(code: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(sessionKey(code));
  } catch {
    // ignore
  }
}

function inferStep(data: {
  completedAt?: string | null;
  paletteTones?: string[];
  styleImageIds?: string[];
  savedStep?: Step;
}): Step {
  if (data.completedAt) return 'result';
  if (data.savedStep === 'result' || data.savedStep === 'estilo' || data.savedStep === 'colors') {
    return data.savedStep;
  }
  if (data.styleImageIds?.length) return 'estilo';
  if (data.paletteTones?.length) return 'estilo';
  return 'colors';
}

function isPt(locale: string) {
  return locale === 'pt-BR';
}

function ArrowIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/marca/ui/arrow-up-right.svg" alt="" width={18} height={18} className="brightness-0 invert" />
  );
}

function WorkshopHeader({ locale }: { locale: string }) {
  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center justify-between bg-[#071F5E] px-4 text-white sm:h-20 sm:px-[12.85%]">
      <a href={`/${locale}`} className="inline-flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-branco.png" alt="Rural Commerce" className="h-8 w-auto sm:h-10" />
      </a>
      <span className="absolute left-1/2 -translate-x-1/2 text-[13px] font-extralight tracking-[0.02em] sm:text-[15px]">
        Oficina de marca
      </span>
      <a href={`/${locale}`} className="text-[13px] font-extralight tracking-[0.02em] hover:opacity-80 sm:text-[15px]">
        Sitio
      </a>
    </header>
  );
}

function NavRow({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  pt,
  primaryTeal,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  pt: boolean;
  primaryTeal?: boolean;
}) {
  return (
    <div className="mt-6 flex shrink-0 flex-col gap-2 sm:flex-row sm:gap-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-[14px] border border-[#8D99AE] bg-transparent px-5 text-sm font-bold text-[#071F5E]"
        >
          {pt ? 'Voltar' : 'Volver'}
        </button>
      ) : null}
      <button
        type="button"
        disabled={nextDisabled}
        onClick={onNext}
        className={`inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-[14px] px-5 text-sm font-bold text-[#F2F2F2] disabled:opacity-40 ${
          primaryTeal ? 'bg-[#52ADAD]' : 'bg-[#071F5E]'
        }`}
      >
        {nextLabel}
        <ArrowIcon />
      </button>
    </div>
  );
}

export function WorkshopApp({ locale, code }: { locale: string; code: string }) {
  const pt = isPt(locale);
  const [workshop, setWorkshop] = useState<MarcaPublicWorkshop | null>(null);
  const [loadError, setLoadError] = useState('');
  const [step, setStep] = useState<Step>('intro');
  const [name, setName] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [paletteTones, setPaletteTones] = useState<string[]>([]);
  const [styleImageIds, setStyleImageIds] = useState<string[]>([]);
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [joining, setJoining] = useState(false);
  const [forceNew, setForceNew] = useState(false);

  useEffect(() => {
    setSavedSession(loadSession(code));
    setHydrated(true);
  }, [code]);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/marca/workshop/${encodeURIComponent(code)}`);
      if (!res.ok) {
        setLoadError(pt ? 'Esta oficina não está disponível.' : 'Esta oficina no está disponible.');
        return;
      }
      const data = (await res.json()) as { workshop: MarcaPublicWorkshop };
      setWorkshop(data.workshop);
    })();
  }, [code, pt]);

  useEffect(() => {
    if (!participantId || !name) return;
    saveSession(code, {
      participantId,
      name,
      step,
      paletteTones,
      styleImageIds,
      completedAt: step === 'result' ? new Date().toISOString() : null,
    });
  }, [code, participantId, name, step, paletteTones, styleImageIds]);

  const persist = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!participantId) return;
      await fetch(`/api/marca/workshop/${encodeURIComponent(code)}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, ...patch }),
      });
    },
    [code, participantId]
  );

  function applyParticipant(data: {
    participantId: string;
    name: string;
    paletteTones?: string[];
    styleImageIds?: string[];
    completedAt?: string | null;
    stepHint?: Step;
  }) {
    setParticipantId(data.participantId);
    setName(data.name);
    setPaletteTones(data.paletteTones || []);
    setStyleImageIds(data.styleImageIds || []);
    const nextStep = inferStep({
      completedAt: data.completedAt,
      paletteTones: data.paletteTones,
      styleImageIds: data.styleImageIds,
      savedStep: data.stepHint,
    });
    setStep(nextStep);
  }

  async function joinAndContinue(opts?: { forceNew?: boolean; fromSession?: SavedSession }) {
    const session = opts?.fromSession;
    const joinName = (session?.name || name).trim();
    if (!joinName && !session?.participantId) return;
    const shouldForceNew = Boolean(opts?.forceNew || (!session && forceNew));
    setJoining(true);
    setLoadError('');
    try {
      const res = await fetch(`/api/marca/workshop/${encodeURIComponent(code)}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: joinName,
          forceNew: shouldForceNew,
          participantId: shouldForceNew ? undefined : session?.participantId,
        }),
      });
      if (!res.ok) {
        setLoadError(pt ? 'Não foi possível entrar.' : 'No se pudo entrar.');
        return;
      }
      const data = (await res.json()) as {
        participantId: string;
        name: string;
        resumed?: boolean;
        paletteTones?: string[];
        styleImageIds?: string[];
        completedAt?: string | null;
      };
      applyParticipant({
        participantId: data.participantId,
        name: data.name || joinName,
        paletteTones: shouldForceNew
          ? []
          : data.paletteTones?.length
            ? data.paletteTones
            : session?.paletteTones,
        styleImageIds: shouldForceNew
          ? []
          : data.styleImageIds?.length
            ? data.styleImageIds
            : session?.styleImageIds,
        completedAt: shouldForceNew ? null : data.completedAt || session?.completedAt,
        stepHint: shouldForceNew ? 'colors' : session?.step,
      });
      setForceNew(false);
      setSavedSession(null);
    } finally {
      setJoining(false);
    }
  }

  function startFresh() {
    clearSession(code);
    setSavedSession(null);
    setParticipantId('');
    setPaletteTones([]);
    setStyleImageIds([]);
    setName('');
    setForceNew(true);
    setStep('name');
  }

  async function continueSaved() {
    if (!savedSession) return;
    await joinAndContinue({ fromSession: savedSession });
  }

  function toggleTone(tone: MarcaTone) {
    setPaletteTones((prev) => {
      if (prev.includes(tone)) return prev.filter((t) => t !== tone);
      if (prev.length >= 2) return prev;
      return [...prev, tone];
    });
  }

  function toggleStyle(id: string) {
    setStyleImageIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const styleImages = useMemo(() => {
    if (!workshop) return [] as MarcaPublicImage[];
    const STYLE_CAP = 60;
    const isStyleSection = (section?: string) =>
      section === 'logo' || section === 'packaging' || !section;

    const pool = (workshop.images || []).filter(
      (img) => img.section !== 'palette' && isStyleSection(img.section)
    );
    // If catalog has few tagged logo/packaging, fall back to all non-palette images
    const source =
      pool.length >= 12
        ? pool
        : (workshop.images || []).filter((img) => img.section !== 'palette');

    const byId = new Set<string>();
    const bySrc = new Set<string>();
    const unique: MarcaPublicImage[] = [];
    for (const img of source) {
      if (!img?.id || byId.has(img.id)) continue;
      const srcKey = (img.src || '').trim().toLowerCase();
      if (srcKey && bySrc.has(srcKey)) continue;
      byId.add(img.id);
      if (srcKey) bySrc.add(srcKey);
      unique.push(img);
      if (unique.length >= STYLE_CAP) break;
    }
    return unique;
  }, [workshop]);

  const selectedStyleImages = useMemo(
    () => styleImageIds.map((id) => styleImages.find((i) => i.id === id) || workshop?.images.find((i) => i.id === id)).filter(Boolean) as MarcaPublicImage[],
    [styleImageIds, styleImages, workshop]
  );

  const paletteImages = useMemo(() => {
    const map: Partial<Record<string, string>> = {};
    for (const tone of MARCA_TONES) {
      map[tone] = `/images/marca/ui/palette-${tone}.jpg`;
      const fromCatalog = workshop?.sections?.palette?.find((i) => i.tone === tone);
      if (fromCatalog?.src) map[tone] = fromCatalog.src;
    }
    return map;
  }, [workshop]);

  async function finishEstilo() {
    const sectionPicks: Record<string, string> = {};
    const firstTone = paletteTones[0];
    if (firstTone) {
      const paletteImg = workshop?.sections?.palette?.find((i) => i.tone === firstTone);
      if (paletteImg) sectionPicks.palette = paletteImg.id;
    }
    const logoPick = selectedStyleImages.find((i) => i.section === 'logo');
    const packPick = selectedStyleImages.find((i) => i.section === 'packaging');
    if (logoPick) sectionPicks.logo = logoPick.id;
    else if (selectedStyleImages[0]) sectionPicks.logo = selectedStyleImages[0].id;
    if (packPick) sectionPicks.packaging = packPick.id;
    else if (selectedStyleImages[1]) sectionPicks.packaging = selectedStyleImages[1].id;

    await persist({
      paletteTones,
      styleImageIds,
      sectionPicks,
      complete: true,
    });
    setStep('result');
  }

  if (loadError) {
    return (
      <div className="flex h-[100dvh] flex-col bg-[#FBFAF8]">
        <WorkshopHeader locale={locale} />
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-[#071F5E]">{loadError}</div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="flex h-[100dvh] flex-col bg-[#FBFAF8]">
        <WorkshopHeader locale={locale} />
        <div className="flex flex-1 items-center justify-center text-sm text-[#071F5E]/70">
          {pt ? 'Carregando oficina…' : 'Cargando oficina…'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#FBFAF8] text-[#071F5E]">
      <WorkshopHeader locale={locale} />

      {step === 'intro' ? (
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/marca/ui/oficina-hero.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/45 to-transparent" />
          <div className="relative z-10 flex h-full max-w-xl flex-col justify-center px-6 sm:px-[12.85%]">
            <p className="text-base font-normal tracking-[0.02em] text-[#071F5E] sm:text-[23px]">
              {workshop.clientName}
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight tracking-[0.01em] text-[#071F5E] sm:text-[46px] sm:leading-[48px]">
              {workshop.title || (pt ? `Criação de marca ${workshop.clientName}` : `Creación de Marca ${workshop.clientName}`)}
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-6 text-[#071F5E] sm:text-[17px] sm:leading-[23px]">
              {pt
                ? 'Escolham o que mais representa o negócio e a marca que querem construir. Pensem no que querem comunicar e a quem querem chegar.'
                : 'Elijan lo que más represente su negocio y la marca que quieren construir. Piensen en qué quieren comunicar y a quién quieren llegar.'}
            </p>
            {hydrated && savedSession ? (
              <div className="mt-8 flex w-full max-w-[360px] flex-col gap-3">
                <button
                  type="button"
                  disabled={joining}
                  onClick={() => void continueSaved()}
                  className="inline-flex min-h-[66px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#071F5E] px-5 text-base font-bold text-[#F2F2F2] disabled:opacity-50"
                >
                  {`Continuar como ${savedSession.name}`}
                  <ArrowIcon />
                </button>
                <button
                  type="button"
                  disabled={joining}
                  onClick={startFresh}
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[14px] border border-[#071F5E]/30 bg-white/80 px-5 text-sm font-bold text-[#071F5E]"
                >
                  {pt ? 'Começar de novo' : 'Empezar de nuevo'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setStep('name')}
                className="mt-8 inline-flex min-h-[66px] w-full max-w-[328px] items-center justify-center gap-2 rounded-[14px] bg-[#071F5E] px-5 text-base font-bold text-[#F2F2F2]"
              >
                {pt ? 'Começar a dinâmica' : 'Comenzar la dinámica'}
                <ArrowIcon />
              </button>
            )}
          </div>
        </div>
      ) : null}

      {step === 'name' ? (
        <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-8 text-center">
          <p className="text-base font-light tracking-[0.02em] text-[#071F5E] sm:text-[23px]">
            {pt ? 'ANTES DE COMEÇAR' : 'ANTES DE EMPEZAR'}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-[0.01em] text-[#071F5E] sm:text-[46px] sm:leading-[48px]">
            {pt ? 'Como você se chama?' : '¿Cómo te llamas?'}
          </h2>
          <p className="mt-3 text-[15px] text-[#071F5E] sm:text-[17px]">
            {pt
              ? 'Usaremos seu nome para identificar suas respostas. Se já começou, use o mesmo nome para continuar.'
              : 'Usaremos tu nombre para identificar tus respuestas. Si ya empezaste, usa el mismo nombre para continuar.'}
          </p>
          <input
            className="mt-8 w-full min-h-[66px] rounded-[14px] border border-[#8D99AE] bg-white px-4 text-center text-sm text-[#071F5E] placeholder:text-[#72777A]/50"
            placeholder={pt ? 'Escreva seu nome' : 'Escribe tu nombre'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') void joinAndContinue();
            }}
          />
          <button
            type="button"
            disabled={!name.trim() || joining}
            onClick={() => void joinAndContinue()}
            className="mt-4 inline-flex min-h-[66px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#071F5E] px-5 text-base font-bold text-[#F2F2F2] disabled:opacity-40"
          >
            {joining ? (pt ? 'Entrando…' : 'Entrando…') : pt ? 'Continuar' : 'Continuar'}
            <ArrowIcon />
          </button>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-[#071F5E]/60 underline-offset-2 hover:underline"
            onClick={() => setStep('intro')}
          >
            {pt ? 'Voltar' : 'Volver'}
          </button>
        </div>
      ) : null}

      {step === 'colors' ? (
        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8">
          <div className="shrink-0 text-center">
            <p className="text-base font-light tracking-[0.02em] sm:text-[23px]">{pt ? 'CORES' : 'COLORES'}</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight tracking-[0.01em] sm:text-[46px] sm:leading-[48px]">
              {pt
                ? 'Que paleta de cores representa melhor o negócio?'
                : '¿Que paleta de colores representa mejor su negocio?'}
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-5 sm:text-[17px] sm:leading-[23px]">
              {pt
                ? 'Podem escolher até 2 opções. Pensem na marca que querem construir e nas pessoas a quem querem chegar.'
                : 'Pueden elegir hasta 2 opciones. Piensen en la marca que quieren construir y en las personas a las que quieren llegar.'}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {PALETTE_ORDER.map((tone) => {
              const meta = MARCA_PALETTE_META[tone];
              const selected = paletteTones.includes(tone);
              const src = `/images/marca/ui/palette-${tone}.jpg`;
              return (
                <div
                  key={tone}
                  className={`overflow-hidden rounded-[14px] bg-white shadow-[-7px_5px_13px_-5px_rgba(0,0,0,0.2)] ring-2 transition ${
                    selected ? 'ring-[#52ADAD]' : 'ring-transparent'
                  }`}
                >
                  <div className="aspect-[243/176] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="px-3 pb-3 pt-3">
                    <div className="flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/images/marca/ui/swatch-${tone}.svg`}
                        alt=""
                        width={169}
                        height={29}
                        className="h-[29px] w-[169px] max-w-full"
                      />
                    </div>
                    <p className="mt-2.5 text-center text-sm font-medium sm:text-[17px]">
                      {pt ? meta.labelPt : meta.labelEs}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleTone(tone)}
                      className={`mt-2 w-full rounded-[7px] py-2 text-xs font-medium sm:text-sm ${
                        selected ? 'bg-[#52ADAD] text-white' : 'bg-[#EFEFEF] text-[#071F5E]'
                      }`}
                    >
                      {selected ? (pt ? 'Selecionada' : 'Seleccionada') : pt ? 'Selecionar' : 'Seleccionar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <NavRow
            pt={pt}
            onBack={() => setStep('name')}
            onNext={async () => {
              await persist({ paletteTones });
              setStep('estilo');
            }}
            nextLabel={pt ? 'Continuar' : 'Continuar'}
            nextDisabled={paletteTones.length === 0}
            primaryTeal
          />
        </div>
      ) : null}

      {step === 'estilo' ? (
        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8">
          <div className="shrink-0 text-center">
            <p className="text-base font-light tracking-[0.02em] sm:text-[23px]">ESTILO VISUAL</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight tracking-[0.01em] sm:text-[46px] sm:leading-[48px]">
              {pt
                ? 'Que estilo de marca representa melhor o negócio?'
                : '¿Qué estilo de marca representa mejor su negocio?'}
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-5 sm:text-[17px] sm:leading-[23px]">
              {pt
                ? 'Podem escolher todas as opções que quiserem. Olhem cada imagem pensando no estilo da marca: as letras, as formas, a embalagem, as cores, o logo e tudo o que aparece em cada referência.'
                : 'Pueden elegir todas las opciones que quieran. Miren cada imagen pensando en el estilo de la marca: las letras, las formas, el empaque, los colores, el logo y todo lo que aparece en cada referencia.'}
            </p>
          </div>

          <p className="mt-2 shrink-0 text-center text-xs text-[#071F5E]/55">
            {styleImages.length} {pt ? 'referências' : 'referencias'}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5">
            {styleImages.map((img) => {
              const on = styleImageIds.includes(img.id);
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => toggleStyle(img.id)}
                  className={`group relative aspect-square overflow-hidden rounded-[15px] bg-[#EEF3F7] ring-2 transition ${
                    on ? 'ring-[#52ADAD]' : 'ring-transparent'
                  }`}
                >
                  {img.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const el = e.currentTarget;
                        el.style.display = 'none';
                        const fallback = el.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div
                    className="h-full w-full"
                    style={{
                      display: img.src ? 'none' : 'block',
                      background: img.moodColor || '#DDE3EA',
                    }}
                  />
                  <span
                    className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-md ${
                      on
                        ? 'border-white bg-[#071F5E] text-white'
                        : 'border-[#071F5E] bg-white text-transparent'
                    }`}
                    aria-hidden
                  >
                    {on ? <span className="text-sm font-bold leading-none">✓</span> : null}
                  </span>
                </button>
              );
            })}
          </div>

          <NavRow
            pt={pt}
            onBack={() => setStep('colors')}
            onNext={() => void finishEstilo()}
            nextLabel={pt ? 'Continuar' : 'Continuar'}
            nextDisabled={styleImageIds.length === 0}
            primaryTeal
          />
        </div>
      ) : null}

      {step === 'result' ? (
        <div className="mx-auto min-h-0 w-full max-w-5xl flex-1 overflow-hidden px-3 py-4 sm:px-6">
          <ParticipantMoodboard
            participantName={name}
            paletteTones={paletteTones}
            styleImages={selectedStyleImages}
            paletteImages={paletteImages}
            locale={locale}
            onBack={() => setStep('estilo')}
          />
        </div>
      ) : null}
    </div>
  );
}
