'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MARCA_SECTIONS,
  type MarcaPublicImage,
  type MarcaPublicWorkshop,
  type MarcaSection,
  type MarcaSectionPicks,
} from '@/lib/marca/types';
import { buildOnePageCopy } from '@/lib/marca/profile';
import { normalizeToneLabel } from '@/lib/marca/labels';

type Step = 'join' | 'intro' | MarcaSection | 'words' | 'story' | 'result';

function isPt(locale: string) {
  return locale === 'pt-BR';
}

function MoodboardGrid({
  images,
  words,
  title,
}: {
  images: MarcaPublicImage[];
  words: string[];
  title: string;
}) {
  const tiles = images.slice(0, 8);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className="mb-1 shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-[#009179]">{title}</p>
      <div className="grid min-h-0 flex-1 grid-cols-4 grid-rows-3 gap-1 overflow-hidden rounded-xl">
        {tiles.map((img, i) => (
          <div
            key={img.id}
            className={`relative overflow-hidden bg-[#EEF3F7] ${i === 0 ? 'col-span-2 row-span-2' : ''} ${
              i === 1 ? 'col-span-2' : ''
            }`}
          >
            {img.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full" style={{ background: img.moodColor || '#071F5E' }} />
            )}
            {img.tone ? (
              <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                {normalizeToneLabel(img.tone)}
              </span>
            ) : null}
          </div>
        ))}
        <div className="col-span-2 flex flex-wrap content-start gap-1 overflow-hidden bg-[#071F5E] p-2 text-white">
          {words.slice(0, 10).map((w) => (
            <span key={w} className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium">
              {w}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WorkshopApp({ locale, code }: { locale: string; code: string }) {
  const pt = isPt(locale);
  const [workshop, setWorkshop] = useState<MarcaPublicWorkshop | null>(null);
  const [loadError, setLoadError] = useState('');
  const [step, setStep] = useState<Step>('join');
  const [name, setName] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [picks, setPicks] = useState<MarcaSectionPicks>({});
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [recording, setRecording] = useState(false);
  const [audioDataUrl, setAudioDataUrl] = useState<string | undefined>();
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

  async function join(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/marca/workshop/${encodeURIComponent(code)}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      setLoadError(pt ? 'Não foi possível entrar.' : 'No se pudo entrar.');
      return;
    }
    const data = (await res.json()) as { participantId: string };
    setParticipantId(data.participantId);
    setStep('intro');
  }

  function pickImage(section: MarcaSection, imageId: string) {
    const next = { ...picks, [section]: imageId };
    setPicks(next);
    void persist({ sectionPicks: { [section]: imageId } });
  }

  function toggleWord(word: string) {
    setSelectedWords((prev) => {
      const next = prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word];
      return next;
    });
  }

  async function startAudio() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size) chunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const url = String(reader.result || '');
          setAudioDataUrl(url);
          void persist({ audioDataUrl: url });
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      // mic blocked — text is enough
    }
  }

  function stopAudio() {
    mediaRef.current?.stop();
    setRecording(false);
  }

  const resultImages = useMemo(() => {
    if (!workshop) return [] as MarcaPublicImage[];
    const ids = Object.values(picks).filter(Boolean) as string[];
    return ids
      .map((id) => workshop.images.find((img) => img.id === id))
      .filter(Boolean) as MarcaPublicImage[];
  }, [picks, workshop]);

  const onePage = useMemo(() => {
    if (!workshop) return null;
    const tones = resultImages.map((i) => i.tone || '').filter(Boolean);
    return buildOnePageCopy({
      clientName: workshop.clientName,
      strong: tones,
      words: selectedWords,
      freeTexts: freeText ? [freeText] : [],
    });
  }, [workshop, resultImages, selectedWords, freeText]);

  if (loadError) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#F2F2F2] p-4 text-center text-sm text-[#071F5E]">
        {loadError}
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#F2F2F2] text-sm text-[#071F5E]/70">
        {pt ? 'Carregando oficina…' : 'Cargando oficina…'}
      </div>
    );
  }

  const sectionMeta = MARCA_SECTIONS.find((s) => s.id === step);
  const sectionImages =
    step === 'palette' || step === 'logo' || step === 'packaging' ? workshop.sections[step] || [] : [];

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#F2F2F2] text-[#1E1E1E]">
      <header className="flex shrink-0 items-center justify-between bg-[#071F5E] px-3 py-2 text-white sm:px-4">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-branco.png" alt="Rural Commerce" className="h-7 w-auto sm:h-8" />
        </div>
        <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">
          <span>{pt ? 'Oficina de marca' : 'Oficina de marca'}</span>
          <a href={`/${locale}`} className="hover:text-white">
            Sitio
          </a>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden px-3 py-1.5 sm:px-4 sm:py-3">
        <div className="shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#009179]">{workshop.clientName}</p>
          <h1 className="truncate text-base font-bold leading-tight text-[#071F5E] sm:text-xl">{workshop.title}</h1>
        </div>

        <div className="mt-1.5 min-h-0 flex-1 overflow-hidden sm:mt-2">
          {step === 'join' ? (
            <form onSubmit={join} className="flex h-full flex-col justify-center gap-3">
              <p className="text-sm text-[#1E1E1E]/70">
                {pt
                  ? 'Vamos escolher imagens e palavras. Não há resposta certa — é o que combina com vocês.'
                  : 'Vamos a elegir imágenes y palabras. No hay respuesta correcta: es lo que combina con ustedes.'}
              </p>
              <input
                className="min-h-11 rounded-xl border border-[#071F5E]/15 bg-white px-4 text-sm"
                placeholder={pt ? 'Seu nome' : 'Tu nombre'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
              <button type="submit" className="min-h-11 rounded-xl bg-[#009179] text-sm font-bold text-white">
                {pt ? 'Começar' : 'Empezar'}
              </button>
            </form>
          ) : null}

          {step === 'intro' ? (
            <div className="flex h-full flex-col justify-center gap-3">
              <h2 className="text-xl font-bold text-[#071F5E]">
                {pt ? 'Uma marca é como se sente o que vocês fazem' : 'Una marca es cómo se siente lo que hacen'}
              </h2>
              <p className="text-sm leading-6 text-[#1E1E1E]/75">
                {pt
                  ? 'Em poucos passos: escolha o tom de cores, um estilo de logo, uma embalagem, palavras suas e conte um pouco da história. No fim montamos um moodboard.'
                  : 'En pocos pasos: elijan el tono de color, un estilo de logo, un embalaje, palabras propias y cuenten un poco la historia. Al final armamos un moodboard.'}
              </p>
              <button
                type="button"
                className="min-h-11 rounded-xl bg-[#071F5E] text-sm font-bold text-white"
                onClick={() => setStep('palette')}
              >
                {pt ? 'Ir às imagens' : 'Ir a las imágenes'}
              </button>
            </div>
          ) : null}

          {(step === 'palette' || step === 'logo' || step === 'packaging') && sectionMeta ? (
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              <p className="shrink-0 text-sm font-semibold leading-tight text-[#071F5E]">
                {pt ? sectionMeta.labelPt : sectionMeta.labelEs}
              </p>
              <p className="shrink-0 text-[11px] leading-snug text-[#1E1E1E]/65 sm:text-xs">
                {pt ? sectionMeta.hintPt : sectionMeta.hintEs}
              </p>
              <div className="mt-1.5 grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-1.5 sm:mt-2 sm:grid-cols-4 sm:grid-rows-1 sm:gap-2">
                {sectionImages.map((img) => {
                  const active = picks[step] === img.id;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => pickImage(step, img.id)}
                      className={`relative min-h-0 overflow-hidden rounded-xl border-2 ${
                        active ? 'border-[#009179] ring-2 ring-[#009179]/30' : 'border-transparent'
                      }`}
                    >
                      <div className="absolute inset-0">
                        {img.src ? (
                          <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width:640px) 50vw, 25vw" />
                        ) : (
                          <div className="absolute inset-0" style={{ background: img.moodColor || '#071F5E' }} />
                        )}
                        <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                          {normalizeToneLabel(img.tone || '')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-1.5 flex shrink-0 gap-2 sm:mt-2">
                <button
                  type="button"
                  className="min-h-10 flex-1 rounded-xl border border-[#071F5E]/15 bg-white text-sm font-semibold text-[#071F5E]"
                  onClick={() => {
                    if (step === 'palette') setStep('intro');
                    if (step === 'logo') setStep('palette');
                    if (step === 'packaging') setStep('logo');
                  }}
                >
                  {pt ? 'Voltar' : 'Volver'}
                </button>
                <button
                  type="button"
                  disabled={!picks[step]}
                  className="min-h-10 flex-[1.4] rounded-xl bg-[#009179] text-sm font-bold text-white disabled:opacity-40"
                  onClick={() => {
                    if (step === 'palette') setStep('logo');
                    else if (step === 'logo') setStep('packaging');
                    else setStep('words');
                  }}
                >
                  {pt ? 'Continuar' : 'Continuar'}
                </button>
              </div>
            </div>
          ) : null}

          {step === 'words' ? (
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              <p className="shrink-0 text-sm font-semibold leading-tight text-[#071F5E]">
                {pt ? 'Palavras que são só de vocês' : 'Palabras que son solo de ustedes'}
              </p>
              <p className="shrink-0 text-[11px] leading-snug text-[#1E1E1E]/65 sm:text-xs">
                {pt
                  ? 'Toque nas palavras que mais representam o negócio. Pode escolher várias.'
                  : 'Toquen las palabras que más representan el negocio. Pueden elegir varias.'}
              </p>
              <div className="mt-1.5 min-h-0 flex-1 overflow-hidden sm:mt-2">
                <div className="flex h-full flex-wrap content-start gap-1 overflow-y-auto pb-1 sm:gap-1.5">
                  {(workshop.wordBank || []).map((word) => {
                    const on = selectedWords.includes(word);
                    return (
                      <button
                        key={word}
                        type="button"
                        onClick={() => toggleWord(word)}
                        className={`rounded-full px-2 py-1 text-[11px] font-semibold sm:px-2.5 sm:py-1.5 sm:text-xs ${
                          on ? 'bg-[#009179] text-white' : 'bg-white text-[#071F5E] shadow-sm'
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-1.5 flex shrink-0 gap-2 sm:mt-2">
                <button
                  type="button"
                  className="min-h-10 flex-1 rounded-xl border border-[#071F5E]/15 bg-white text-sm font-semibold"
                  onClick={() => setStep('packaging')}
                >
                  {pt ? 'Voltar' : 'Volver'}
                </button>
                <button
                  type="button"
                  className="min-h-10 flex-[1.4] rounded-xl bg-[#009179] text-sm font-bold text-white"
                  onClick={() => {
                    void persist({ words: { selected: selectedWords, people: [], places: [], product: [] } });
                    setStep('story');
                  }}
                >
                  {pt ? 'Continuar' : 'Continuar'}
                </button>
              </div>
            </div>
          ) : null}

          {step === 'story' ? (
            <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-hidden sm:gap-2">
              <p className="shrink-0 text-sm font-semibold leading-tight text-[#071F5E]">
                {pt ? 'Contem um pouco mais — com liberdade' : 'Cuénten un poco más — con libertad'}
              </p>
              <p className="shrink-0 text-[11px] leading-snug text-[#1E1E1E]/65 sm:text-xs sm:leading-5">
                {pt
                  ? 'O que faz o negócio especial? O que querem que as pessoas sintam? Escrevam ou gravem um áudio curto.'
                  : '¿Qué hace especial al negocio? ¿Qué quieren que la gente sienta? Escriban o graben un audio corto.'}
              </p>
              <textarea
                className="min-h-0 flex-1 resize-none rounded-xl border border-[#071F5E]/15 bg-white p-3 text-sm"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={pt ? 'Escrevam aqui…' : 'Escriban aquí…'}
              />
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {!recording ? (
                  <button
                    type="button"
                    onClick={() => void startAudio()}
                    className="rounded-xl border border-[#071F5E]/15 bg-white px-3 py-2 text-xs font-semibold text-[#071F5E]"
                  >
                    {pt ? 'Gravar áudio' : 'Grabar audio'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopAudio}
                    className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    {pt ? 'Parar' : 'Detener'}
                  </button>
                )}
                {audioDataUrl ? <span className="text-xs text-[#009179]">{pt ? 'Áudio salvo' : 'Audio guardado'}</span> : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className="min-h-10 flex-1 rounded-xl border border-[#071F5E]/15 bg-white text-sm font-semibold"
                  onClick={() => setStep('words')}
                >
                  {pt ? 'Voltar' : 'Volver'}
                </button>
                <button
                  type="button"
                  className="min-h-10 flex-[1.4] rounded-xl bg-[#071F5E] text-sm font-bold text-white"
                  onClick={async () => {
                    await persist({ freeText, audioDataUrl, complete: true });
                    setStep('result');
                  }}
                >
                  {pt ? 'Ver resultado' : 'Ver resultado'}
                </button>
              </div>
            </div>
          ) : null}

          {step === 'result' && onePage ? (
            <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-hidden sm:gap-2">
              <div className="min-h-0 flex-[1.2] overflow-hidden">
                <MoodboardGrid
                  title={pt ? 'Seu moodboard' : 'Tu moodboard'}
                  images={resultImages}
                  words={selectedWords}
                />
              </div>
              <div className="max-h-[38%] shrink-0 overflow-hidden rounded-xl bg-white p-2.5 shadow-sm sm:p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#009179]">
                  {pt ? 'One-page sugerido de marca' : 'One-page sugerido de marca'}
                </p>
                <h3 className="mt-1 text-sm font-bold leading-tight text-[#071F5E]">{onePage.headline}</h3>
                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#1E1E1E]/75 sm:text-xs sm:leading-5">{onePage.promise}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#1E1E1E]/75 sm:text-xs sm:leading-5">{onePage.personality}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#1E1E1E]/75 sm:text-xs sm:leading-5">{onePage.voice}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
