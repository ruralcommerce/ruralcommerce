'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PlantaAuthProvider, usePlantaAuth } from '@/lib/planta-auth';

export function PlantaInvitePanel({ locale }: { locale: string }) {
  return (
    <PlantaAuthProvider>
      <PlantaInvitePanelInner locale={locale} />
    </PlantaAuthProvider>
  );
}

function PlantaInvitePanelInner({ locale }: { locale: string }) {
  const { invites, createInvite, markIntranetAccess } = usePlantaAuth();
  const [label, setLabel] = useState('');
  const [org, setOrg] = useState('Cooperativa · Copey');
  const [last, setLast] = useState<string | null>(null);

  useEffect(() => {
    markIntranetAccess();
  }, [markIntranetAccess]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    markIntranetAccess();
    const invite = createInvite(label, org);
    setLast(invite.code);
    setLabel('');
  }

  return (
    <section className="rounded-3xl border border-[#E6EBF1] bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D6359]">Planta Copey</p>
      <h2 className="mt-2 text-xl font-semibold text-[#071F5E]">Convites a la planta compartida</h2>
      <p className="mt-2 text-sm leading-6 text-[#2F3336]/75">
        La guía de 22 m² no entra con Mi perfil. Genere un código y envíelo a quien deba entrar.
      </p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Para quién"
          className="rounded-xl border border-[#E6EBF1] px-3 py-2 text-sm"
        />
        <input
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          placeholder="Organización"
          className="rounded-xl border border-[#E6EBF1] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-full bg-[#52ADAD] px-4 py-2 text-sm font-semibold text-[#071F5E] sm:col-span-2"
        >
          Generar código
        </button>
      </form>
      {last ? (
        <p className="mt-3 text-sm">
          Código nuevo: <strong>{last}</strong> · enlace{' '}
          <code className="break-all text-xs">
            /{locale}/planta/convite?codigo={last}
          </code>
        </p>
      ) : null}
      <ul className="mt-4 space-y-2 text-sm">
        {invites.map((invite) => (
          <li key={invite.code} className="rounded-xl bg-[#F5F7FA] px-3 py-2">
            <strong>{invite.code}</strong> — {invite.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
