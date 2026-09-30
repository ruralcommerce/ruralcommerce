'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MarcaCustomer, MarcaPublicImage, MarcaPublicWorkshop, MarcaVoteValue, MarcaWords } from '@/lib/marca/types';
import { getMarcaIntro } from '@/lib/marca/intro';
import { MarcaButton, MarcaInput, MarcaPanel, MarcaShell, MarcaTextarea } from './MarcaShell';

type Step = 'join' | 'intro' | 'radar' | 'words' | 'customer' | 'special' | 'done';

const VOTE_OPTIONS: { value: MarcaVoteValue; label: string }[] = [
  { value: 'no', label: 'No combina' },
  { value: 'neutral', label: 'Neutro / no sé' },
  { value: 'yes', label: 'Combina' },
];

const BUY_FOR = ['Consumir en casa', 'Regalar', 'Llevar de viaje', 'Revender', 'Otro'];

function ChipInput({
  label,
  hint,
  values,
  onChange,
}: {
  label: string;
  hint: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  function add() {
    const word = draft.trim();
    if (!word) return;
    if (values.some((v) => v.toLocaleLowerCase() === word.toLocaleLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...values, word]);
    setDraft('');
  }

  return (
    <div>
      <p className="text-sm font-semibold text-[var(--rc-primary)]">{label}</p>
      <p className="mt-1 text-xs text-[var(--rc-text)]/60">{hint}</p>
      <div className="mt-3 flex gap-2">
        <MarcaInput
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Escribe y Enter"
        />
        <MarcaButton variant="ghost" onClick={add}>
          +
        </MarcaButton>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => onChange(values.filter((v) => v !== word))}
            className="rounded-md bg-[var(--rc-accent)]/12 px-3 py-1.5 text-sm font-medium text-[var(--rc-accent)]"
          >
            {word} ×
          </button>
        ))}
      </div>
    </div>
  );
}

function ImageCard({
  image,
  vote,
  onVote,
}: {
  image: MarcaPublicImage;
  vote?: MarcaVoteValue;
  onVote: (value: MarcaVoteValue) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--rc-primary)]/10 bg-white">
      <div className="relative aspect-[4/3] bg-[var(--rc-bg)]">
        {image.src ? (
          <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="(max-width:768px) 100vw, 420px" />
        ) : (
          <div
            className="absolute inset-0 flex items-end p-5"
            style={{ background: `linear-gradient(160deg, ${image.moodColor || '#071F5E'}, #00071B)` }}
          >
            <p className="text-lg font-semibold text-white/90">{image.alt}</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        {VOTE_OPTIONS.map((opt) => {
          const active = vote === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onVote(opt.value)}
              className={`rounded-md px-2 py-2.5 text-xs font-semibold transition sm:text-sm ${
                active
                  ? opt.value === 'yes'
                    ? 'bg-[var(--rc-accent)] text-white'
                    : opt.value === 'no'
                      ? 'bg-[var(--rc-primary)] text-white'
                      : 'bg-[#D9E3EC] text-[var(--rc-primary)]'
                  : 'bg-[var(--rc-bg)] text-[var(--rc-text)]/75 hover:bg-[#E8EEF4]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function WorkshopApp({ locale, code }: { locale: string; code: string }) {
  const [workshop, setWorkshop] = useState<MarcaPublicWorkshop | null>(null);
  const [loadError, setLoadError] = useState('');
  const [step, setStep] = useState<Step>('join');
  const [name, setName] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [votes, setVotes] = useState<Record<string, MarcaVoteValue>>({});
  const [words, setWords] = useState<MarcaWords>({ people: [], places: [], product: [] });
  const [customer, setCustomer] = useState<MarcaCustomer>({});
  const [specialMeaning, setSpecialMeaning] = useState('');
  const [saving, setSaving] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/marca/workshop/${encodeURIComponent(code)}`);
      if (!res.ok) {
        setLoadError('Esta oficina no existe o ya no está disponible.');
        return;
      }
      const data = (await res.json()) as { workshop: MarcaPublicWorkshop };
      setWorkshop(data.workshop);
    })();
  }, [code]);

  const images = workshop?.images || [];
  const current = images[index];
  const votedCount = useMemo(() => Object.keys(votes).length, [votes]);

  const persist = useCallback(
    async (patch: {
      votes?: Record<string, MarcaVoteValue>;
      words?: MarcaWords;
      customer?: MarcaCustomer;
      specialMeaning?: string;
      complete?: boolean;
    }) => {
      if (!participantId) return;
      setSaving(true);
      try {
        await fetch(`/api/marca/workshop/${encodeURIComponent(code)}/respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId, ...patch }),
        });
      } finally {
        setSaving(false);
      }
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
      setLoadError('No se pudo entrar a la oficina.');
      return;
    }
    const data = (await res.json()) as { participantId: string };
    setParticipantId(data.participantId);
    setStep('intro');
  }

  function voteCurrent(value: MarcaVoteValue) {
    if (!current) return;
    const next = { ...votes, [current.id]: value };
    setVotes(next);
    void persist({ votes: { [current.id]: value } });
    if (index < images.length - 1) {
      setIndex((i) => i + 1);
    }
  }

  if (loadError) {
    return (
      <MarcaShell locale={locale} title="Oficina" subtitle={loadError}>
        <MarcaPanel>
          <p className="text-sm text-[var(--rc-text)]/70">Pide el link actualizado al equipo de Rural Commerce.</p>
        </MarcaPanel>
      </MarcaShell>
    );
  }

  if (!workshop) {
    return (
      <MarcaShell locale={locale} title="Oficina de marca" subtitle="Cargando…">
        <MarcaPanel>
          <p className="text-sm text-[var(--rc-text)]/70">Preparando la dinámica…</p>
        </MarcaPanel>
      </MarcaShell>
    );
  }

  const intro = getMarcaIntro(locale);

  return (
    <MarcaShell
      locale={locale}
      eyebrow={workshop.clientName}
      title={workshop.title}
      subtitle={
        step === 'intro'
          ? intro.kicker
          : step === 'radar'
            ? 'Mira cada imagen y di si combina con la marca que imaginan.'
            : step === 'words'
              ? 'Palabras que son solo de ustedes.'
              : step === 'customer'
                ? 'Unas preguntas cortas sobre quién compra.'
                : step === 'special'
                  ? 'Una última pregunta abierta.'
                  : 'Dinámica de construcción de marca'
      }
    >
      {step === 'join' ? (
        <MarcaPanel className="max-w-lg">
          <form onSubmit={join} className="space-y-4">
            <p className="text-sm leading-6 text-[var(--rc-text)]/75">
              No hay respuestas correctas. Es un juego visual para descubrir el perfil de la marca.
            </p>
            <label className="block text-sm font-semibold text-[var(--rc-primary)]">
              Tu nombre
              <MarcaInput className="mt-2" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
            </label>
            <MarcaButton type="submit">Empezar</MarcaButton>
          </form>
        </MarcaPanel>
      ) : null}

      {step === 'intro' ? (
        <MarcaPanel className="max-w-2xl space-y-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rc-accent)]">
            {intro.kicker}
          </p>
          <h2 className="text-2xl font-bold text-[var(--rc-primary)] sm:text-3xl">{intro.title}</h2>
          {intro.paragraphs.map((p) => (
            <p key={p} className="text-sm leading-7 text-[var(--rc-text)]/80">
              {p}
            </p>
          ))}
          <ul className="space-y-2 border-l-2 border-[var(--rc-accent)] pl-4">
            {intro.bullets.map((b) => (
              <li key={b} className="text-sm leading-6 text-[var(--rc-primary)]">
                {b}
              </li>
            ))}
          </ul>
          <MarcaButton onClick={() => setStep('radar')}>{intro.cta}</MarcaButton>
        </MarcaPanel>
      ) : null}

      {step === 'radar' && current ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-[var(--rc-text)]/50">
            <span>
              Imagen {index + 1} / {images.length}
            </span>
            <span>{votedCount} marcadas</span>
          </div>
          <ImageCard image={current} vote={votes[current.id]} onVote={voteCurrent} />
          <div className="flex flex-wrap gap-2">
            <MarcaButton variant="ghost" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
              Anterior
            </MarcaButton>
            <MarcaButton
              variant="ghost"
              disabled={index >= images.length - 1}
              onClick={() => setIndex((i) => Math.min(images.length - 1, i + 1))}
            >
              Siguiente
            </MarcaButton>
            <MarcaButton
              variant="primary"
              disabled={votedCount < Math.min(5, images.length)}
              onClick={() => setStep('words')}
            >
              Continuar
            </MarcaButton>
          </div>
        </div>
      ) : null}

      {step === 'words' ? (
        <MarcaPanel className="space-y-8">
          <ChipInput
            label="Personas"
            hint="Nombres, apellidos, apodos"
            values={words.people}
            onChange={(people) => setWords((w) => ({ ...w, people }))}
          />
          <ChipInput
            label="Lugares"
            hint="Propiedad, comunidad, río, montaña, ciudad…"
            values={words.places}
            onChange={(places) => setWords((w) => ({ ...w, places }))}
          />
          <ChipInput
            label="Producto y trabajo"
            hint="Productos, ingredientes, herramientas, etapas"
            values={words.product}
            onChange={(product) => setWords((w) => ({ ...w, product }))}
          />
          <div className="flex flex-wrap gap-2">
            <MarcaButton variant="ghost" onClick={() => setStep('radar')}>
              Volver
            </MarcaButton>
            <MarcaButton
              onClick={() => {
                void persist({ words });
                setStep('customer');
              }}
            >
              Continuar
            </MarcaButton>
          </div>
        </MarcaPanel>
      ) : null}

      {step === 'customer' ? (
        <MarcaPanel className="max-w-xl space-y-5">
          <div>
            <p className="text-sm font-semibold text-[var(--rc-primary)]">¿Ya venden?</p>
            <div className="mt-2 flex gap-2">
              <MarcaButton
                variant={customer.alreadySells === true ? 'primary' : 'ghost'}
                onClick={() => setCustomer((c) => ({ ...c, alreadySells: true }))}
              >
                Sí
              </MarcaButton>
              <MarcaButton
                variant={customer.alreadySells === false ? 'primary' : 'ghost'}
                onClick={() => setCustomer((c) => ({ ...c, alreadySells: false }))}
              >
                Todavía no
              </MarcaButton>
            </div>
          </div>

          {customer.alreadySells ? (
            <>
              <label className="block text-sm font-semibold text-[var(--rc-primary)]">
                ¿Qué venden?
                <MarcaInput
                  className="mt-2"
                  value={customer.whatSells || ''}
                  onChange={(e) => setCustomer((c) => ({ ...c, whatSells: e.target.value }))}
                />
              </label>
              <div>
                <p className="text-sm font-semibold text-[var(--rc-primary)]">¿Ya preguntaron qué opinan sus clientes?</p>
                <div className="mt-2 flex gap-2">
                  <MarcaButton
                    variant={customer.askedClients === true ? 'primary' : 'ghost'}
                    onClick={() => setCustomer((c) => ({ ...c, askedClients: true }))}
                  >
                    Sí
                  </MarcaButton>
                  <MarcaButton
                    variant={customer.askedClients === false ? 'primary' : 'ghost'}
                    onClick={() => setCustomer((c) => ({ ...c, askedClients: false }))}
                  >
                    No aún
                  </MarcaButton>
                </div>
              </div>
              {customer.askedClients ? (
                <label className="block text-sm font-semibold text-[var(--rc-primary)]">
                  En una frase, ¿qué dicen?
                  <MarcaTextarea
                    className="mt-2"
                    rows={3}
                    value={customer.clientPraise || ''}
                    onChange={(e) => setCustomer((c) => ({ ...c, clientPraise: e.target.value }))}
                  />
                </label>
              ) : null}
            </>
          ) : null}

          <div>
            <p className="text-sm font-semibold text-[var(--rc-primary)]">¿Para qué compran (o comprarían)?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {BUY_FOR.map((option) => {
                const active = customer.buyFor?.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setCustomer((c) => {
                        const currentList = c.buyFor || [];
                        return {
                          ...c,
                          buyFor: active ? currentList.filter((x) => x !== option) : [...currentList, option],
                        };
                      })
                    }
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      active ? 'bg-[var(--rc-accent)] text-white' : 'bg-[var(--rc-bg)] text-[var(--rc-primary)]'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block text-sm font-semibold text-[var(--rc-primary)]">
            Cuando alguien vea el producto por primera vez, queremos que piense o sienta…
            <MarcaTextarea
              className="mt-2"
              rows={3}
              value={customer.wantFeel || ''}
              onChange={(e) => setCustomer((c) => ({ ...c, wantFeel: e.target.value }))}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <MarcaButton variant="ghost" onClick={() => setStep('words')}>
              Volver
            </MarcaButton>
            <MarcaButton
              onClick={() => {
                void persist({ customer });
                setStep('special');
              }}
            >
              Continuar
            </MarcaButton>
          </div>
        </MarcaPanel>
      ) : null}

      {step === 'special' ? (
        <MarcaPanel className="max-w-xl space-y-4">
          <label className="block text-sm font-semibold text-[var(--rc-primary)]">
            ¿Existe alguna color, imagen o elemento con un significado especial para ustedes?
            <MarcaTextarea
              className="mt-2"
              rows={4}
              value={specialMeaning}
              onChange={(e) => setSpecialMeaning(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <MarcaButton variant="ghost" onClick={() => setStep('customer')}>
              Volver
            </MarcaButton>
            <MarcaButton
              disabled={saving}
              onClick={async () => {
                await persist({ specialMeaning, complete: true });
                setStep('done');
              }}
            >
              {saving ? 'Guardando…' : 'Terminar'}
            </MarcaButton>
          </div>
        </MarcaPanel>
      ) : null}

      {step === 'done' ? (
        <MarcaPanel className="max-w-lg">
          <h2 className="text-2xl font-bold text-[var(--rc-primary)]">Listo, {name}</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--rc-text)]/75">
            Gracias. El equipo de Rural Commerce usa estas respuestas para montar el perfil visual de la marca.
            No hay nada más que hacer aquí.
          </p>
        </MarcaPanel>
      ) : null}
    </MarcaShell>
  );
}
