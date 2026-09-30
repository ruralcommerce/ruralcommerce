import type { MarcaVisualProfile } from '@/lib/marca/types';
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
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function WordBlock({ title, words }: { title: string; words: string[] }) {
  if (!words.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--rc-text)]/55">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--rc-primary)]">{words.join(' · ')}</p>
    </div>
  );
}

export function MarcaProfileReport({ profile }: { profile: MarcaVisualProfile }) {
  return (
    <div className="space-y-5">
      <MarcaPanel>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
          Perfil visual del negocio
        </p>
        <p className="mt-2 text-sm text-[var(--rc-text)]/70">
          {profile.completedCount} de {profile.participantCount} participantes con respuestas
        </p>
        <div className="mt-6 space-y-5">
          <TagList label="Fuerte afinidad con" items={profile.strong} tone="strong" />
          <TagList label="Afinidad moderada" items={profile.moderate} tone="mid" />
          <TagList label="Baja afinidad" items={profile.low} tone="low" />
          <TagList label="Rechazos" items={profile.rejections} tone="no" />
        </div>
      </MarcaPanel>

      {(profile.words.people.length || profile.words.places.length || profile.words.product.length) > 0 ? (
        <MarcaPanel>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
            Palabras que son solo nuestras
          </p>
          <div className="mt-5 space-y-4">
            <WordBlock title="Personas" words={profile.words.people} />
            <WordBlock title="Lugares" words={profile.words.places} />
            <WordBlock title="Producto y trabajo" words={profile.words.product} />
          </div>
        </MarcaPanel>
      ) : null}

      {profile.specialMeanings.length > 0 ? (
        <MarcaPanel>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
            Significados especiales
          </p>
          <ul className="mt-4 space-y-3">
            {profile.specialMeanings.map((item) => (
              <li key={`${item.name}-${item.text}`} className="text-sm leading-6">
                <span className="font-semibold text-[var(--rc-primary)]">{item.name}: </span>
                <span className="text-[var(--rc-text)]/80">{item.text}</span>
              </li>
            ))}
          </ul>
        </MarcaPanel>
      ) : null}

      {profile.customerNotes.length > 0 ? (
        <MarcaPanel>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
            Quién compra / qué sienten
          </p>
          <ul className="mt-4 space-y-4">
            {profile.customerNotes.map((item) => (
              <li key={item.name} className="rounded-xl bg-[var(--rc-bg)] p-4 text-sm leading-6">
                <p className="font-semibold text-[var(--rc-primary)]">{item.name}</p>
                {item.customer.alreadySells != null ? (
                  <p className="mt-1 text-[var(--rc-text)]/75">
                    ¿Ya vende? {item.customer.alreadySells ? 'Sí' : 'No'}
                    {item.customer.whatSells ? ` — ${item.customer.whatSells}` : ''}
                  </p>
                ) : null}
                {item.customer.clientPraise ? (
                  <p className="mt-1 text-[var(--rc-text)]/75">Elogian: {item.customer.clientPraise}</p>
                ) : null}
                {item.customer.wantFeel ? (
                  <p className="mt-1 text-[var(--rc-text)]/75">Quieren que sientan: {item.customer.wantFeel}</p>
                ) : null}
                {item.customer.buyFor?.length ? (
                  <p className="mt-1 text-[var(--rc-text)]/75">Compra para: {item.customer.buyFor.join(', ')}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </MarcaPanel>
      ) : null}
    </div>
  );
}
