import type { MarcaVisualProfile } from '@/lib/marca/types';
import { normalizeToneLabel } from '@/lib/marca/labels';
import { buildOnePageCopy } from '@/lib/marca/profile';
import { MarcaPanel } from './MarcaShell';

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

export function MarcaProfileReport({
  profile,
  clientName,
  imageSrcById,
}: {
  profile: MarcaVisualProfile;
  clientName?: string;
  imageSrcById?: Record<string, string>;
}) {
  const onePage = buildOnePageCopy({
    clientName: clientName || 'Marca',
    strong: profile.strong,
    words: profile.wordFrequency?.map((w) => w.word) || profile.words.selected || [],
    freeTexts: profile.freeTexts?.map((f) => f.text) || [],
  });

  return (
    <div className="space-y-5">
      <MarcaPanel>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
          Moodboard del taller
        </p>
        <p className="mt-2 text-sm text-[var(--rc-text)]/70">
          {profile.completedCount} de {profile.participantCount} participantes con respuestas
        </p>
        {imageSrcById && profile.topImageIds?.length ? (
          <div className="mt-4 grid grid-cols-3 gap-1 overflow-hidden rounded-xl sm:grid-cols-4">
            {profile.topImageIds.slice(0, 8).map((id) => (
              <div key={id} className="relative aspect-square bg-[#EEF3F7]">
                {imageSrcById[id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageSrcById[id]} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-6 space-y-5">
          <TagList label="Más elegido en el taller" items={profile.strong} tone="strong" />
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
          One-page sugerido de marca
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
