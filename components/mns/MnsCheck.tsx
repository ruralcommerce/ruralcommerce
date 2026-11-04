'use client';

import { useMemo, useState } from 'react';
import {
  MNS_CHECK_QUESTIONS,
  scoreCheck,
  type MnsCheckAnswers,
  type MnsCheckMoment,
} from '@/lib/mns/assessment';
import type { MnsCheckSnapshot } from '@/lib/mns/types';

function ArrowIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/marca/ui/arrow-up-right.svg" alt="" width={18} height={18} className="brightness-0 invert" />
  );
}

export function MnsCheck({
  moment,
  initial,
  onSubmit,
  submitting,
}: {
  moment: MnsCheckMoment;
  initial?: MnsCheckAnswers;
  onSubmit: (result: MnsCheckSnapshot) => void | Promise<void>;
  submitting?: boolean;
}) {
  const [answers, setAnswers] = useState<MnsCheckAnswers>(() => ({ ...(initial || {}) }));
  const [qIndex, setQIndex] = useState(0);
  const q = MNS_CHECK_QUESTIONS[qIndex];
  const answered = useMemo(
    () => MNS_CHECK_QUESTIONS.every((item) => Boolean(answers[item.id])),
    [answers]
  );

  const isPre = moment === 'pre';
  const eyebrow = isPre ? 'PUNTO DE PARTIDA' : 'COMPROBACIÓN FINAL';
  const title = isPre ? '¿Qué criterio traes hoy?' : '¿Qué cambió después del mapa?';
  const lead = isPre
    ? 'Cuatro situaciones rápidas. No es un examen: solo medimos el punto de partida antes de las dinámicas.'
    : 'Las mismas cuatro situaciones del inicio. Así vemos la mejora de criterio.';

  async function finish() {
    if (!answered) return;
    const scored = scoreCheck(answers);
    await onSubmit({
      answers,
      score: scored.score,
      max: scored.max,
      completedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col overflow-hidden px-4 pt-4 sm:px-8 sm:pt-5">
      <div className="shrink-0 text-center">
        <p className="text-sm font-light tracking-[0.02em] sm:text-base lg:text-[23px]">
          {eyebrow} · {qIndex + 1}/{MNS_CHECK_QUESTIONS.length}
        </p>
        <h2 className="mt-1 text-2xl font-bold leading-tight tracking-[0.01em] sm:text-3xl lg:text-[40px] lg:leading-[1.15]">
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-5 sm:text-[15px] lg:text-[17px] lg:leading-[23px]">
          {lead}
        </p>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain sm:mt-5">
        <div className="rounded-[18px] bg-white p-4 shadow-[-7px_5px_13px_-5px_rgba(0,0,0,0.12)] sm:p-5">
          {q.context ? <p className="text-sm leading-5 text-[#071F5E]/60">{q.context}</p> : null}
          <h3 className="mt-1 text-lg font-bold leading-snug text-[#071F5E] sm:text-xl lg:text-2xl">{q.prompt}</h3>
          <div className="mt-4 grid gap-2.5">
            {q.options.map((opt) => {
              const on = answers[q.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                  className={`rounded-[16px] border px-4 py-3.5 text-left text-[15px] font-semibold transition ${
                    on
                      ? 'border-[#52ADAD] bg-[#52ADAD]/15 text-[#071F5E] ring-2 ring-[#52ADAD]'
                      : 'border-[#071F5E]/10 bg-[#FBFAF8] text-[#071F5E]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-[#071F5E]/6 bg-[#FBFAF8] pb-4 pt-2 sm:flex-row sm:gap-4 sm:pb-5">
        <button
          type="button"
          disabled={qIndex === 0}
          onClick={() => setQIndex((i) => Math.max(0, i - 1))}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-[14px] border border-[#8D99AE] bg-transparent px-5 text-sm font-bold text-[#071F5E] disabled:opacity-40 sm:min-h-[52px]"
        >
          Volver
        </button>
        {qIndex < MNS_CHECK_QUESTIONS.length - 1 ? (
          <button
            type="button"
            disabled={!answers[q.id]}
            onClick={() => setQIndex((i) => i + 1)}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#52ADAD] px-5 text-sm font-bold text-[#F2F2F2] disabled:opacity-40 sm:min-h-[52px]"
          >
            Continuar
            <ArrowIcon />
          </button>
        ) : (
          <button
            type="button"
            disabled={!answered || submitting}
            onClick={() => void finish()}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#071F5E] px-5 text-sm font-bold text-[#F2F2F2] disabled:opacity-40 sm:min-h-[52px]"
          >
            {isPre ? 'Empezar el mapa' : 'Ver mi mejora'}
            <ArrowIcon />
          </button>
        )}
      </div>
    </div>
  );
}

export function MnsCheckDoneSummary({
  pre,
  post,
  onReview,
}: {
  pre?: MnsCheckSnapshot | null;
  post?: MnsCheckSnapshot | null;
  onReview: () => void;
}) {
  const preScore = pre?.score;
  const postScore = post?.score;
  const max = post?.max || pre?.max || MNS_CHECK_QUESTIONS.length;
  const delta = preScore != null && postScore != null ? postScore - preScore : null;

  let message = 'Completaste el mapa y la comprobación.';
  if (delta != null) {
    if (delta > 0) message = `Mejoraste ${delta} acierto${delta === 1 ? '' : 's'} respecto al inicio.`;
    else if (delta === 0) {
      message = 'Mantienes el mismo puntaje; revisa las fichas si alguna situación aún genera duda.';
    } else {
      message = 'El post bajó respecto al pre: útil para ver qué criterio reforzar en el acompañamiento.';
    }
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-xl flex-col items-center justify-center overflow-y-auto overscroll-contain px-6 py-6 text-center">
      <p className="text-sm font-light tracking-[0.02em] sm:text-base lg:text-[23px]">MAPA COMPLETO</p>
      <h2 className="mt-1 text-2xl font-bold leading-tight tracking-[0.01em] sm:text-3xl lg:text-[40px] lg:leading-[1.15]">
        Propuesta, verificación, precio y recorrido
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-[#071F5E]/80 sm:text-[15px] lg:text-[17px]">{message}</p>

      <div className="mt-6 grid w-full grid-cols-3 gap-2">
        <ScoreTile label="Pre" value={preScore != null ? `${preScore}/${max}` : '—'} />
        <ScoreTile label="Post" value={postScore != null ? `${postScore}/${max}` : '—'} />
        <ScoreTile
          label="Mejora"
          value={delta == null ? '—' : delta > 0 ? `+${delta}` : `${delta}`}
          accent
        />
      </div>

      <p className="mt-5 max-w-md text-sm leading-5 text-[#071F5E]/65">
        Lo importante es saber qué puedes demostrar y cuál es el siguiente paso. Una ficha completa no sustituye la
        validación técnica de una operación real.
      </p>

      <button
        type="button"
        onClick={onReview}
        className="mt-6 inline-flex min-h-[48px] w-full max-w-sm items-center justify-center rounded-[14px] border border-[#071F5E]/30 bg-white px-5 text-sm font-bold text-[#071F5E] sm:min-h-[52px]"
      >
        Revisar mis respuestas
      </button>
    </div>
  );
}

function ScoreTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-[16px] px-2 py-4 ${
        accent ? 'bg-[#52ADAD]/15 ring-1 ring-[#52ADAD]/40' : 'bg-white shadow-[-7px_5px_13px_-5px_rgba(0,0,0,0.08)]'
      }`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#071F5E]/50">{label}</div>
      <div className={`mt-1 text-xl font-bold ${accent ? 'text-[#009179]' : 'text-[#071F5E]'}`}>{value}</div>
    </div>
  );
}
