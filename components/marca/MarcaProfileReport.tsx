'use client';

import { useMemo, useRef, useState } from 'react';
import type { MarcaContract, MarcaImage, MarcaVisualProfile } from '@/lib/marca/types';
import { normalizeToneLabel } from '@/lib/marca/labels';
import { buildOnePageCopy } from '@/lib/marca/profile';
import { buildFinalWorkshopMoodboard } from '@/lib/marca/moodboard';
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
  words,
  freeText,
  imageById,
}: {
  name: string;
  picks: string[];
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
  const [generationKey, setGenerationKey] = useState(0);
  const finalRef = useRef<HTMLDivElement>(null);
  const imageById = useMemo(() => Object.fromEntries(catalog.map((img) => [img.id, img])), [catalog]);

  const onePage = buildOnePageCopy({
    clientName: contract.clientName || 'Marca',
    strong: profile.strong,
    words: profile.wordFrequency?.map((w) => w.word) || profile.words.selected || [],
    freeTexts: profile.freeTexts?.map((f) => f.text) || [],
  });

  const finalBoard = useMemo(
    () => (showFinal ? buildFinalWorkshopMoodboard(contract, catalog, profile) : null),
    // generationKey forces rebuild after refresh / re-click
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showFinal, contract, catalog, profile, generationKey]
  );

  async function generateFinal() {
    setGenerating(true);
    try {
      await onRefresh?.();
      setGenerationKey((k) => k + 1);
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
              Abajo: moodboard de cada persona. El moodboard final de la oficina se genera aparte — junta lo más
              elegido (imágenes, paleta, palabras e historias) en una composición nueva.
            </p>
          </div>
          <MarcaButton onClick={() => void generateFinal()} disabled={generating}>
            {generating ? 'Generando…' : 'Generar moodboard final de la oficina'}
          </MarcaButton>
        </div>
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
        {finalBoard ? (
          <FinalWorkshopMoodboardView board={finalBoard} onClose={() => setShowFinal(false)} />
        ) : (
          <MarcaPanel>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
              Moodboard final de la oficina
            </p>
            <p className="mt-2 text-sm text-[var(--rc-text)]/70">
              Todavía no generado. Pulsa el botón para crear la sistematización visual a partir de todos los
              votos e historias.
            </p>
            <div className="mt-4">
              <MarcaButton onClick={() => void generateFinal()} disabled={generating}>
                {generating ? 'Generando…' : 'Generar ahora'}
              </MarcaButton>
            </div>
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
                picks={Object.values(p.sectionPicks || {}).filter(Boolean) as string[]}
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
