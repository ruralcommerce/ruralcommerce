'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MNS_COURSE, MNS_FICHAS } from '@/lib/mns/content';
import { fichaIdAtScreen, inferPlayIndex, MNS_PLAY_SCREENS } from '@/lib/mns/play';
import type {
  MnsAnswers,
  MnsCheckSnapshot,
  MnsFieldDef,
  MnsFieldHelp,
  MnsFieldValue,
  MnsFichaId,
  MnsWorkRoute,
} from '@/lib/mns/types';
import { MnsCheck, MnsCheckDoneSummary } from './MnsCheck';
import { fieldPlayFilled, MnsFieldPlay } from './MnsFieldPlay';

type Gate = 'intro' | 'name' | 'pre' | 'play' | 'post' | 'done';

type LocalSession = {
  participantId: string;
  name: string;
  companyName: string;
  workRoute: MnsWorkRoute;
  productLabel: string;
  answers: MnsAnswers;
  currentFicha: MnsFichaId;
  playIndex: number;
  completedAt?: string | null;
  preCheck?: MnsCheckSnapshot | null;
  postCheck?: MnsCheckSnapshot | null;
  gate?: Gate;
};

function storageKey(code: string) {
  return `mns-mapa:${code.trim().toUpperCase()}`;
}

function loadLocal(code: string): LocalSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(code));
    if (!raw) return null;
    const data = JSON.parse(raw) as LocalSession & { fichaIndex?: number; stepIndex?: number; phase?: string };
    if (!data?.participantId || !data?.name) return null;
    if (typeof data.companyName !== 'string') data.companyName = '';
    // migrate old shape
    if (typeof data.playIndex !== 'number') {
      data.playIndex = inferPlayIndex({ answers: data.answers || {}, savedIndex: 0 });
    }
    return data;
  } catch {
    return null;
  }
}

function saveLocal(code: string, data: LocalSession) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(code), JSON.stringify(data));
  } catch {
    // ignore
  }
}

function clearLocal(code: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(storageKey(code));
  } catch {
    // ignore
  }
}

function asString(v: MnsFieldValue | undefined): string {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const rec = v as Record<string, string>;
    return (rec.text || rec.somos || Object.values(rec).find((x) => Boolean(x?.trim())) || '').trim();
  }
  if (Array.isArray(v)) return v.join(', ');
  return '';
}

function fieldFilled(field: MnsFieldDef, value: MnsFieldValue | undefined): boolean {
  return fieldPlayFilled(field, value);
}

function ArrowIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/marca/ui/arrow-up-right.svg" alt="" width={18} height={18} className="brightness-0 invert" />
  );
}

function WorkshopHeader({ locale }: { locale: string }) {
  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center justify-between bg-[#071F5E] px-6 text-white sm:h-20 sm:px-10 lg:px-16">
      <a href={`/${locale}`} className="inline-flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-branco.png" alt="Rural Commerce" className="h-8 w-auto sm:h-10" />
      </a>
      <span className="absolute left-1/2 -translate-x-1/2 text-[13px] font-extralight tracking-[0.02em] sm:text-[15px]">
        MNS Internacional
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
  primaryTeal,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  primaryTeal?: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:gap-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-[14px] border border-[#8D99AE] bg-transparent px-5 text-sm font-bold text-[#071F5E] sm:min-h-[52px]"
        >
          Volver
        </button>
      ) : null}
      <button
        type="button"
        disabled={nextDisabled}
        onClick={onNext}
        className={`inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-[14px] px-5 text-sm font-bold text-[#F2F2F2] disabled:opacity-40 sm:min-h-[52px] ${
          primaryTeal ? 'bg-[#52ADAD]' : 'bg-[#071F5E]'
        }`}
      >
        {nextLabel}
        <ArrowIcon />
      </button>
    </div>
  );
}

function TipSheet({
  title,
  help,
  onClose,
}: {
  title: string;
  help: MnsFieldHelp;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#071F5E]/35 p-3 sm:items-center">
      <div className="max-h-[80dvh] w-full max-w-lg overflow-hidden rounded-[18px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 bg-[#071F5E] px-5 py-4 text-white">
          <div>
            <p className="text-[11px] font-light uppercase tracking-[0.16em] text-white/70">Asistente</p>
            <p className="mt-1 text-base font-bold leading-snug">{title}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
            Cerrar
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto px-5 py-4 text-sm leading-6 text-[#071F5E]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#009179]">Para qué sirve</p>
            <p className="mt-1">{help.paraQue}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#009179]">Cómo completarlo</p>
            <p className="mt-1">{help.como}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#009179]">Ejemplo</p>
            <p className="mt-1">{help.ejemplo}</p>
          </div>
          {help.alerta ? (
            <div className="rounded-[12px] bg-[#071F5E]/6 px-3 py-2 text-[13px]">{help.alerta}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function MnsWorkshopApp({ locale, code }: { locale: string; code: string }) {
  const normalized = code.trim().toUpperCase();
  const [gate, setGate] = useState<Gate>('intro');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [workRoute, setWorkRoute] = useState<MnsWorkRoute>('negocio');
  const [participantId, setParticipantId] = useState('');
  const [sessionTitle, setSessionTitle] = useState(MNS_COURSE.shortName);
  const [groupName, setGroupName] = useState('');
  const [answers, setAnswers] = useState<MnsAnswers>({});
  const [playIndex, setPlayIndex] = useState(0);
  const [preCheck, setPreCheck] = useState<MnsCheckSnapshot | null>(null);
  const [postCheck, setPostCheck] = useState<MnsCheckSnapshot | null>(null);
  const [savedSession, setSavedSession] = useState<LocalSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [joining, setJoining] = useState(false);
  const [forceNew, setForceNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [tip, setTip] = useState<{ title: string; help: MnsFieldHelp } | null>(null);

  const screen = MNS_PLAY_SCREENS[playIndex];

  useEffect(() => {
    setSavedSession(loadLocal(normalized));
    setHydrated(true);
  }, [normalized]);

  // Lock the document so widescreen never gets a page scrollbar under the fixed shell.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/mns/session/${encodeURIComponent(normalized)}`);
      if (!res.ok) {
        setLoadError(res.status === 404 ? 'Código no encontrado. Pide el código al facilitador.' : 'Sala no disponible.');
        return;
      }
      const data = (await res.json()) as { session: { title: string; groupName?: string; status: string } };
      setSessionTitle(data.session.title || MNS_COURSE.shortName);
      setGroupName(data.session.groupName || '');
      if (data.session.status === 'closed' && !loadLocal(normalized)) {
        setLoadError('Esta sala está cerrada.');
      }
    })();
  }, [normalized]);

  const snapshot = useCallback(
    (patch?: Partial<LocalSession>): LocalSession => ({
      participantId,
      name,
      companyName,
      workRoute,
      productLabel: asString(answers.ficha1?.producto) || '',
      answers,
      currentFicha: fichaIdAtScreen(playIndex),
      playIndex,
      completedAt: null,
      preCheck,
      postCheck,
      gate,
      ...patch,
    }),
    [answers, companyName, gate, name, participantId, playIndex, postCheck, preCheck, workRoute]
  );

  const persist = useCallback(
    async (patch?: Partial<LocalSession> & { complete?: boolean; sync?: boolean }) => {
      const next = snapshot(patch);
      saveLocal(normalized, next);
      setSavedSession(next);
      if (!next.participantId || patch?.sync === false) return;
      setSaving(true);
      try {
        await fetch(`/api/mns/session/${encodeURIComponent(normalized)}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: next.participantId,
            answers: next.answers,
            currentFicha: next.currentFicha,
            workRoute: next.workRoute,
            productLabel: next.productLabel,
            companyName: next.companyName,
            preCheck: next.preCheck,
            postCheck: next.postCheck,
            complete: Boolean(patch?.complete),
          }),
        });
      } catch {
        // local keeps working
      } finally {
        setSaving(false);
      }
    },
    [normalized, snapshot]
  );

  useEffect(() => {
    if (!participantId || !name) return;
    if (gate === 'intro' || gate === 'name') return;
    saveLocal(
      normalized,
      snapshot({
        gate,
        playIndex,
        answers,
        preCheck,
        postCheck,
        completedAt: gate === 'done' ? new Date().toISOString() : null,
      })
    );
  }, [answers, gate, name, normalized, participantId, playIndex, postCheck, preCheck, snapshot]);

  function getFieldValue(fichaId: MnsFichaId, fieldId: string): MnsFieldValue | undefined {
    return answers[fichaId]?.[fieldId];
  }

  function setFieldValue(fichaId: MnsFichaId, fieldId: string, value: MnsFieldValue) {
    setAnswers((prev) => ({
      ...prev,
      [fichaId]: {
        ...(prev[fichaId] || {}),
        [fieldId]: value,
      },
    }));
  }

  function applyJoined(data: {
    participantId: string;
    name: string;
    companyName?: string;
    answers?: MnsAnswers;
    workRoute?: MnsWorkRoute;
    preCheck?: MnsCheckSnapshot | null;
    postCheck?: MnsCheckSnapshot | null;
    completedAt?: string | null;
    playIndex?: number;
  }, fresh: boolean) {
    setParticipantId(data.participantId);
    setName(data.name);
    setCompanyName(data.companyName || '');
    const nextAnswers = fresh ? {} : data.answers || {};
    setAnswers(nextAnswers);
    setWorkRoute(fresh ? workRoute : data.workRoute || workRoute);
    setPreCheck(fresh ? null : data.preCheck || null);
    setPostCheck(fresh ? null : data.postCheck || null);
    const idx = fresh
      ? 0
      : inferPlayIndex({ answers: nextAnswers, savedIndex: data.playIndex });
    setPlayIndex(idx);

    if (fresh) {
      setGate('pre');
      return;
    }
    if (data.completedAt || data.postCheck?.completedAt) {
      setGate('done');
      return;
    }
    if (!data.preCheck?.completedAt) {
      setGate('pre');
      return;
    }
    setGate('play');
  }

  async function joinAndContinue(opts?: { forceNew?: boolean; fromSession?: LocalSession }) {
    const session = opts?.fromSession;
    const joinName = (session?.name || name).trim();
    const joinCompany = (session?.companyName || companyName).trim();
    if (!joinName && !session?.participantId) return;
    if (!session && (!joinName || !joinCompany)) {
      setLoadError('Escribe el nombre del representante y el de la empresa.');
      return;
    }
    const shouldForceNew = Boolean(opts?.forceNew || (!session && forceNew));
    setJoining(true);
    setLoadError('');
    try {
      const res = await fetch(`/api/mns/session/${encodeURIComponent(normalized)}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: joinName,
          companyName: joinCompany,
          forceNew: shouldForceNew,
          participantId: shouldForceNew ? undefined : session?.participantId,
          workRoute: shouldForceNew ? 'negocio' : session?.workRoute || 'negocio',
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setLoadError(err.error || 'No se pudo entrar a la sala.');
        return;
      }
      const data = (await res.json()) as {
        participantId: string;
        name: string;
        companyName?: string;
        answers?: MnsAnswers;
        workRoute?: MnsWorkRoute;
        preCheck?: MnsCheckSnapshot | null;
        postCheck?: MnsCheckSnapshot | null;
        completedAt?: string | null;
      };
      const serverAnswers = data.answers || {};
      const hasServerAnswers = Object.keys(serverAnswers).length > 0;
      applyJoined(
        {
          participantId: data.participantId,
          name: data.name || joinName,
          companyName: data.companyName || joinCompany,
          answers: shouldForceNew ? {} : hasServerAnswers ? serverAnswers : session?.answers || {},
          workRoute: shouldForceNew ? workRoute : data.workRoute || session?.workRoute,
          preCheck: shouldForceNew ? null : data.preCheck || session?.preCheck || null,
          postCheck: shouldForceNew ? null : data.postCheck || session?.postCheck || null,
          completedAt: shouldForceNew ? null : data.completedAt || session?.completedAt,
          playIndex: shouldForceNew ? 0 : session?.playIndex,
        },
        shouldForceNew
      );
      setForceNew(false);
      setSavedSession(null);
    } finally {
      setJoining(false);
    }
  }

  function startFresh() {
    clearLocal(normalized);
    setSavedSession(null);
    setParticipantId('');
    setAnswers({});
    setPreCheck(null);
    setPostCheck(null);
    setPlayIndex(0);
    setName('');
    setCompanyName('');
    setForceNew(true);
    setGate('name');
  }

  async function continueSaved() {
    if (!savedSession) return;
    await joinAndContinue({ fromSession: savedSession });
  }

  async function submitPre(result: MnsCheckSnapshot) {
    setPreCheck(result);
    setPlayIndex(0);
    setGate('play');
    await persist({ preCheck: result, gate: 'play', playIndex: 0, currentFicha: 'ficha1' });
  }

  async function submitPost(result: MnsCheckSnapshot) {
    setPostCheck(result);
    setGate('done');
    await persist({ postCheck: result, gate: 'done', complete: true });
  }

  async function goNextPlay() {
    if (!screen) return;
    if (screen.kind === 'field' && !fieldFilled(screen.field, getFieldValue(screen.ficha.id, screen.field.id))) {
      return;
    }
    if (playIndex >= MNS_PLAY_SCREENS.length - 1) {
      setGate('post');
      await persist({ gate: 'post', playIndex, answers });
      return;
    }
    const next = playIndex + 1;
    setPlayIndex(next);
    await persist({ playIndex: next, answers, currentFicha: fichaIdAtScreen(next), gate: 'play' });
  }

  function goBackPlay() {
    if (playIndex <= 0) {
      setGate('pre');
      return;
    }
    setPlayIndex((i) => i - 1);
  }

  const progressLabel = useMemo(() => {
    if (gate !== 'play' || !screen) return '';
    return `Ficha ${screen.ficha.number} · ${screen.ficha.title}`;
  }, [gate, screen]);

  if (loadError && !savedSession) {
    return (
      <div className="fixed inset-0 z-40 flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#FBFAF8]">
        <WorkshopHeader locale={locale} />
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-[#071F5E]">{loadError}</div>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="fixed inset-0 z-40 flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#FBFAF8]">
        <WorkshopHeader locale={locale} />
        <div className="flex flex-1 items-center justify-center text-sm text-[#071F5E]/70">Cargando sala…</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#FBFAF8] text-[#071F5E]">
      <WorkshopHeader locale={locale} />

      {gate === 'intro' ? (
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/marca/ui/oficina-hero.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/88 via-white/62 to-transparent" />
          <div className="relative z-10 flex h-full w-full items-center px-6 py-6 sm:px-10 sm:py-8 lg:px-16">
            <div className="w-full max-w-xl">
              <p className="text-base font-normal tracking-[0.02em] text-[#071F5E] sm:text-[23px]">
                {groupName || MNS_COURSE.edition}
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight tracking-[0.01em] text-[#071F5E] sm:text-[42px] sm:leading-[1.15] lg:text-[46px] lg:leading-[48px]">
                {sessionTitle || 'Mapa de Negocio Sostenible'}
              </h1>
              <p className="mt-5 max-w-md text-[15px] leading-6 text-[#071F5E] sm:text-[17px] sm:leading-[23px]">
                Cuatro dinámicas cortas: se explica, se ve un ejemplo y hacés una cosa concreta. Mismo producto
                en todo el mapa. El detalle está en el (!).
              </p>

              {savedSession ? (
                <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
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
                    Empezar de nuevo
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setGate('name')}
                  className="mt-8 inline-flex min-h-[66px] w-full max-w-sm items-center justify-center gap-2 rounded-[14px] bg-[#071F5E] px-5 text-base font-bold text-[#F2F2F2]"
                >
                  Comenzar la dinámica
                  <ArrowIcon />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {gate === 'name' ? (
        <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col items-center justify-center overflow-y-auto overscroll-contain px-6 py-4 text-center sm:py-6">
          <p className="text-sm font-light tracking-[0.02em] text-[#071F5E] sm:text-base lg:text-[23px]">
            ANTES DE EMPEZAR
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-[0.01em] text-[#071F5E] sm:text-3xl lg:text-[40px] lg:leading-[1.15]">
            Representante y empresa
          </h2>
          <p className="mt-2 max-w-md text-sm text-[#071F5E] sm:text-[15px] lg:text-[17px]">
            Usaremos estos datos para guardar tu avance. Si ya empezaste, usa los mismos nombres para continuar.
          </p>

          <label className="mt-5 w-full text-left text-xs font-bold uppercase tracking-[0.12em] text-[#071F5E]/55 sm:mt-6">
            Nombre del representante
            <input
              className="mt-2 w-full min-h-[52px] rounded-[14px] border border-[#8D99AE] bg-white px-4 text-center text-sm font-normal normal-case tracking-normal text-[#071F5E] placeholder:text-[#72777A]/50 sm:min-h-[60px]"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>

          <label className="mt-3 w-full text-left text-xs font-bold uppercase tracking-[0.12em] text-[#071F5E]/55">
            Nombre de la empresa
            <input
              className="mt-2 w-full min-h-[52px] rounded-[14px] border border-[#8D99AE] bg-white px-4 text-center text-sm font-normal normal-case tracking-normal text-[#071F5E] placeholder:text-[#72777A]/50 sm:min-h-[60px]"
              placeholder="Empresa o emprendimiento"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void joinAndContinue();
              }}
            />
          </label>

          {loadError ? <p className="mt-3 text-sm text-[#b42318]">{loadError}</p> : null}

          <button
            type="button"
            disabled={!name.trim() || !companyName.trim() || joining}
            onClick={() => void joinAndContinue()}
            className="mt-4 inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#071F5E] px-5 text-base font-bold text-[#F2F2F2] disabled:opacity-40 sm:min-h-[60px]"
          >
            {joining ? 'Entrando…' : 'Continuar'}
            <ArrowIcon />
          </button>
          <button
            type="button"
            className="mt-2 text-sm font-semibold text-[#071F5E]/60 underline-offset-2 hover:underline"
            onClick={() => setGate('intro')}
          >
            Volver
          </button>
        </div>
      ) : null}

      {gate === 'pre' ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <MnsCheck moment="pre" initial={preCheck?.answers} onSubmit={submitPre} submitting={joining || saving} />
        </div>
      ) : null}

      {gate === 'post' ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <MnsCheck moment="post" initial={postCheck?.answers} onSubmit={submitPost} submitting={saving} />
        </div>
      ) : null}

      {gate === 'done' ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <MnsCheckDoneSummary
            pre={preCheck}
            post={postCheck}
            onReview={() => {
              setPlayIndex(0);
              setGate('play');
            }}
          />
        </div>
      ) : null}

      {gate === 'play' && screen ? (
        <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden px-4 pt-3 sm:px-8 sm:pt-4">
          <div className="mb-2 flex shrink-0 items-center justify-between gap-3 text-xs text-[#071F5E]/55 sm:mb-3">
            <span>{progressLabel}</span>
            <span>
              {playIndex + 1}/{MNS_PLAY_SCREENS.length}
              {saving ? ' · guardando' : ''}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-1">
            {screen.kind === 'chapter' ? (
              <>
                <div className="text-center">
                  <p className="text-sm font-light tracking-[0.02em] sm:text-base lg:text-[23px]">
                    DINÁMICA {screen.ficha.number} · DÍA {screen.ficha.day}
                  </p>
                  <div className="mt-1 flex items-start justify-center gap-2">
                    <h2 className="text-2xl font-bold leading-tight tracking-[0.01em] sm:text-3xl lg:text-[40px] lg:leading-[1.15]">
                      {screen.ficha.title}
                    </h2>
                    <button
                      type="button"
                      aria-label="Ver propósito y tip"
                      onClick={() =>
                        setTip({
                          title: screen.ficha.title,
                          help: {
                            paraQue: screen.ficha.proposito,
                            como: 'Trabajá la consigna con el mismo producto y oportunidad del mapa.',
                            ejemplo: screen.ficha.tipRevision,
                          },
                        })
                      }
                      className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#071F5E]/25 bg-white text-sm font-bold text-[#071F5E] hover:border-[#52ADAD] hover:text-[#009179]"
                    >
                      !
                    </button>
                  </div>
                </div>

                <div className="mt-5 rounded-[18px] bg-white p-4 shadow-[-7px_5px_13px_-5px_rgba(0,0,0,0.12)] sm:mt-6 sm:p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#009179]">Consigna</p>
                  <p className="mt-2 text-[15px] leading-6 text-[#071F5E]">{screen.ficha.consigna}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {[
                      { t: 'Explicar', d: screen.ficha.proposito },
                      { t: 'Ejemplo', d: 'Tocá el (!) para ver el caso de práctica.' },
                      { t: 'Hacer', d: 'Tres pantallas cortas. Una decisión por pantalla.' },
                    ].map((row) => (
                      <div key={row.t} className="rounded-[12px] bg-[#FBFAF8] px-3 py-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#009179]">{row.t}</p>
                        <p className="mt-1 text-xs leading-4 text-[#071F5E]/75 line-clamp-3">{row.d}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  {MNS_FICHAS.map((f) => (
                    <div
                      key={f.id}
                      className={`rounded-[14px] px-2 py-2.5 text-center text-[11px] font-semibold sm:text-xs ${
                        f.id === screen.ficha.id ? 'bg-[#071F5E] text-white' : 'bg-white text-[#071F5E]/55'
                      }`}
                    >
                      {f.number}
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {screen.kind === 'field' ? (
              <>
                <div className="text-center">
                  <p className="text-sm font-light tracking-[0.02em] sm:text-base lg:text-[23px]">
                    PASO {screen.fieldOrdinal + 1} DE {screen.fieldsInFicha}
                  </p>
                  <div className="mt-1 flex items-start justify-center gap-2">
                    <h2 className="text-2xl font-bold leading-tight tracking-[0.01em] sm:text-3xl lg:text-[34px] lg:leading-[1.15]">
                      {screen.field.label}
                    </h2>
                    <button
                      type="button"
                      aria-label="Ver cómo y ejemplo"
                      onClick={() => setTip({ title: screen.field.label, help: screen.field.help })}
                      className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#071F5E]/25 bg-white text-sm font-bold text-[#071F5E] hover:border-[#52ADAD] hover:text-[#009179]"
                    >
                      !
                    </button>
                  </div>
                </div>

                <div className="mt-4 sm:mt-5">
                  <MnsFieldPlay
                    field={screen.field}
                    value={getFieldValue(screen.ficha.id, screen.field.id)}
                    onChange={(v) => setFieldValue(screen.ficha.id, screen.field.id, v)}
                  />
                </div>
              </>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-[#071F5E]/6 bg-[#FBFAF8] pb-4 pt-2 sm:pb-5">
            {screen.kind === 'chapter' ? (
              <NavRow
                onBack={playIndex > 0 ? goBackPlay : undefined}
                onNext={() => void goNextPlay()}
                nextLabel="Empezar esta dinámica"
                primaryTeal
              />
            ) : (
              <NavRow
                onBack={goBackPlay}
                onNext={() => void goNextPlay()}
                nextLabel={
                  playIndex >= MNS_PLAY_SCREENS.length - 1 ? 'Ir a comprobación final' : 'Continuar'
                }
                nextDisabled={!fieldFilled(screen.field, getFieldValue(screen.ficha.id, screen.field.id))}
                primaryTeal
              />
            )}
          </div>
        </div>
      ) : null}

      {tip ? <TipSheet title={tip.title} help={tip.help} onClose={() => setTip(null)} /> : null}
    </div>
  );
}
