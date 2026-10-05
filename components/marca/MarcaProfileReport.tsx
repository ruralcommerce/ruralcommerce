'use client';

import { useMemo, useRef, useState } from 'react';
import type { MarcaContract, MarcaImage, MarcaVisualProfile } from '@/lib/marca/types';
import { normalizeToneLabel } from '@/lib/marca/labels';
import { buildOnePageCopy } from '@/lib/marca/profile';
import {
  buildFinalWorkshopMoodboard,
  type FinalWorkshopMoodboard,
} from '@/lib/marca/moodboard';
import { MarcaButton, MarcaPanel } from './MarcaShell';
import { FinalWorkshopMoodboardView } from './FinalWorkshopMoodboard';

function TagList({ label, items, tone }: { label: string; items: string[]; tone: 'strong' | 'mid' | 'low' | 'no' }) {
  if (!items.length) return null;
  const color =
    tone === 'strong'
      ? 'bg-[var(--rc-accent)]/12 text-[var(--rc-accent)]'
      : tone === 'mid'
        ? 'bg-[var(--rc-primary)]/8 text-[var(--rc-primary)]'
        : tone === 'low'
          ? 'bg-[#EEF3F7] text-[var(--rc-text)]/70'
          : 'bg-[#1E1E1E]/08 text-[#1E1E1E]/70';

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--rc-text)]/55">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((tag) => (
          <span key={tag} className={`rounded-md px-3 py-1.5 text-sm font-medium ${color}`}>
            {normalizeToneLabel(tag)}
          </span>
        ))}
      </div>
    </div>
  );
}

function ParticipantMoodCard({
  name,
  picks,
  tones,
  words,
  freeText,
  imageById,
}: {
  name: string;
  picks: string[];
  tones?: string[];
  words: string[];
  freeText?: string;
  imageById: Record<string, MarcaImage>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--rc-primary)]/10 bg-white">
      <div className="border-b border-[var(--rc-primary)]/8 px-3 py-2">
        <p className="text-sm font-bold text-[var(--rc-primary)]">{name}</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--rc-accent)]">
          Moodboard individual
        </p>
        {tones?.length ? (
          <p className="mt-1 text-[11px] text-[var(--rc-text)]/65">Paletas: {tones.join(', ')}</p>
        ) : null}
      </div>
      {picks.length ? (
        <div className="grid grid-cols-3 gap-0.5 bg-[#EEF3F7]">
          {picks.map((id) => {
            const img = imageById[id];
            return (
              <div key={id} className="relative aspect-square">
                {img?.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full" style={{ background: img?.moodColor || '#071F5E' }} />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="px-3 py-4 text-xs text-[var(--rc-text)]/55">Sin imágenes elegidas aún</p>
      )}
      {words.length ? (
        <div className="flex flex-wrap gap-1 px-3 py-2">
          {words.slice(0, 8).map((w) => (
            <span key={w} className="rounded bg-[var(--rc-accent)]/12 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--rc-accent)]">
              {w}
            </span>
          ))}
        </div>
      ) : null}
      {freeText ? (
        <p className="border-t border-[var(--rc-primary)]/8 px-3 py-2 text-[11px] leading-5 text-[var(--rc-text)]/75 line-clamp-3">
          {freeText}
        </p>
      ) : null}
    </div>
  );
}

export function MarcaProfileReport({
  profile,
  contract,
  catalog,
  onRefresh,
}: {
  profile: MarcaVisualProfile;
  contract: MarcaContract;
  catalog: MarcaImage[];
  onRefresh?: () => Promise<void> | void;
}) {
  const [showFinal, setShowFinal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [finalBoard, setFinalBoard] = useState<FinalWorkshopMoodboard | null>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const imageById = useMemo(() => Object.fromEntries(catalog.map((img) => [img.id, img])), [catalog]);

  const onePage = buildOnePageCopy({
    clientName: contract.clientName || 'Marca',
    strong: profile.strong,
    words: profile.wordFrequency?.map((w) => w.word) || profile.words.selected || [],
    freeTexts: profile.freeTexts?.map((f) => f.text) || [],
  });

  async function generateFinal(withAi: boolean) {
    setGenerating(true);
    setAiError('');
    try {
      await onRefresh?.();
      if (withAi) {
        const res = await fetch(`/api/marca/contracts/${contract.id}/generate-ai`, { method: 'POST' });
        const data = (await res.json().catch(() => ({}))) as {
          board?: FinalWorkshopMoodboard;
          error?: string;
        };
        if (!res.ok || !data.board) {
          setAiError(data.error || 'No se pudo generar con Gemini.');
          const local = await fetch(`/api/marca/contracts/${contract.id}`);
          const localData = (await local.json()) as { contract: MarcaContract; profile: MarcaVisualProfile };
          setFinalBoard(buildFinalWorkshopMoodboard(localData.contract, catalog, localData.profile));
        } else {
          setFinalBoard(data.board);
        }
      } else {
        const res = await fetch(`/api/marca/contracts/${contract.id}`);
        const data = (await res.json()) as { contract: MarcaContract; profile: MarcaVisualProfile };
        setFinalBoard(buildFinalWorkshopMoodboard(data.contract, catalog, data.profile));
      }
      setShowFinal(true);
      requestAnimationFrame(() => {
        finalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-5">
      <MarcaPanel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
              Resultados del taller
            </p>
            <p className="mt-2 text-sm text-[var(--rc-text)]/70">
              {profile.completedCount} de {profile.participantCount} participantes con respuestas
            </p>
            <p className="mt-2 max-w-xl text-xs leading-5 text-[var(--rc-text)]/60">
              Abajo: moodboard de cada persona. El moodboard final se genera con Gemini a partir de votos,
              palabras e historias — no es solo un recuento automático.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <MarcaButton onClick={() => void generateFinal(true)} disabled={generating}>
              {generating ? 'Generando con IA…' : 'Generar moodboard con IA'}
            </MarcaButton>
            <MarcaButton variant="ghost" onClick={() => void generateFinal(false)} disabled={generating}>
              Versión básica
            </MarcaButton>
          </div>
        </div>
        {aiError ? <p className="mt-3 text-xs text-red-600">{aiError}</p> : null}
        <div className="mt-5 space-y-4">
          <TagList label="Tonos más elegidos en el grupo" items={profile.strong} tone="strong" />
          <TagList label="También apareció" items={profile.moderate} tone="mid" />
        </div>
        {profile.bySection ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {Object.entries(profile.bySection).map(([section, scores]) => (
              <div key={section} className="rounded-xl bg-[var(--rc-bg)] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--rc-accent)]">{section}</p>
                <p className="mt-2 text-xs leading-5 text-[var(--rc-primary)]">
                  {scores.slice(0, 3).map((s) => `${normalizeToneLabel(s.tone)} (${s.count})`).join(' · ') || '—'}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </MarcaPanel>

      <div ref={finalRef}>
        {showFinal && finalBoard ? (
          <FinalWorkshopMoodboardView
            board={finalBoard}
            onClose={() => {
              setShowFinal(false);
              setFinalBoard(null);
            }}
          />
        ) : (
          <MarcaPanel>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
              Moodboard final de la oficina
            </p>
            <p className="mt-2 text-sm text-[var(--rc-text)]/70">
              Todavía no generado. Usa Gemini para sistematizar textos, paleta y dirección visual del taller.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <MarcaButton onClick={() => void generateFinal(true)} disabled={generating}>
                {generating ? 'Generando con IA…' : 'Generar con IA'}
              </MarcaButton>
              <MarcaButton variant="ghost" onClick={() => void generateFinal(false)} disabled={generating}>
                Versión básica
              </MarcaButton>
            </div>
            {aiError ? <p className="mt-3 text-xs text-red-600">{aiError}</p> : null}
          </MarcaPanel>
        )}
      </div>

      <MarcaPanel>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
          Moodboards por persona
        </p>
        <p className="mt-1 text-xs text-[var(--rc-text)]/60">
          Cada tarjeta muestra solo las elecciones de esa persona (no es el resultado del grupo).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {contract.participants.length === 0 ? (
            <p className="text-sm text-[var(--rc-text)]/55">Aún no hay participantes.</p>
          ) : (
            contract.participants.map((p) => (
              <ParticipantMoodCard
                key={p.id}
                name={p.name}
                picks={[
                  ...Object.values(p.sectionPicks || {}).filter(Boolean),
                  ...(p.styleImageIds || []),
                ].filter((v, i, a) => a.indexOf(v) === i) as string[]}
                tones={p.paletteTones || []}
                words={p.words?.selected || []}
                freeText={p.freeText}
                imageById={imageById}
              />
            ))
          )}
        </div>
      </MarcaPanel>

      {profile.wordFrequency?.length ? (
        <MarcaPanel>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
            Palabras más elegidas
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.wordFrequency.slice(0, 20).map((w) => (
              <span key={w.word} className="rounded-md bg-[var(--rc-accent)]/12 px-3 py-1.5 text-sm text-[var(--rc-accent)]">
                {w.word} · {w.count}
              </span>
            ))}
          </div>
        </MarcaPanel>
      ) : null}

      <MarcaPanel>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
          One-page sugerido (borrador rápido)
        </p>
        <p className="mt-1 text-xs text-[var(--rc-text)]/55">
          Vista previa. La versión completa vive dentro del moodboard final al generarlo.
        </p>
        <h3 className="mt-2 text-lg font-bold text-[var(--rc-primary)]">{onePage.headline}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--rc-text)]/80">{onePage.promise}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--rc-text)]/80">{onePage.personality}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--rc-text)]/80">{onePage.voice}</p>
      </MarcaPanel>

      {profile.freeTexts?.length ? (
        <MarcaPanel>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
            Historias libres
          </p>
          <ul className="mt-4 space-y-3">
            {profile.freeTexts.map((item) => (
              <li key={`${item.name}-${item.text.slice(0, 12)}`} className="text-sm leading-6">
                <span className="font-semibold text-[var(--rc-primary)]">{item.name}: </span>
                <span className="text-[var(--rc-text)]/80">{item.text}</span>
              </li>
            ))}
          </ul>
        </MarcaPanel>
      ) : null}
    </div>
  );
}
