'use client';

import { useEffect, useState } from 'react';
import { actividadCopy, formatActividadWhen } from '@/lib/actividades/copy';
import type { ActivityKind, ActivityStatus, GeoStatus, ParticipantState } from '@/lib/actividades/types';
import { ActividadFrame, ActividadMeta } from './ActividadFrame';
import { captureGeo, readDeviceId } from './geo-client';

type SalaActivity = {
  kind: ActivityKind;
  title: string;
  projectLabel: string;
  place: string;
  startsAt: string;
  status: ActivityStatus;
  checkInOpen: boolean;
  presentCount: number;
  listCount: number;
};

export function ActividadSala({ locale, code }: { locale: string; code: string }) {
  const t = actividadCopy(locale);
  const [activity, setActivity] = useState<SalaActivity | null>(null);
  const [missing, setMissing] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{
    name: string;
    already: boolean;
    geoStatus: GeoStatus | null;
  } | null>(null);

  const copy =
    locale === 'pt-BR'
      ? {
          eyebrow: 'Validação na sala',
          lead: 'Entre com o e-mail e a senha do Impulsa CR / Rural Commerce. Não precisa digitar link longo.',
          email: 'E-mail da conta',
          password: 'Senha',
          submit: 'Validar presença',
          closed: 'Esta atividade já está fechada.',
          ok: 'Presença registrada',
          already: 'Você já tinha validado nesta atividade.',
        }
      : locale === 'en'
        ? {
            eyebrow: 'Room check-in',
            lead: 'Sign in with your Impulsa CR / Rural Commerce email and password. No long links to type.',
            email: 'Account email',
            password: 'Password',
            submit: 'Confirm attendance',
            closed: 'This activity is already closed.',
            ok: 'Attendance recorded',
            already: 'You had already checked in to this activity.',
          }
        : {
            eyebrow: 'Validación en la sala',
            lead: 'Entra con el correo y la contraseña de Impulsa CR / Rural Commerce. No hace falta copiar un enlace largo.',
            email: 'Correo de tu cuenta',
            password: 'Contraseña',
            submit: 'Validar presencia',
            closed: 'Esta actividad ya está cerrada.',
            ok: 'Presencia registrada',
            already: 'Ya habías validado en esta actividad.',
          };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/actividad/invite/${encodeURIComponent(code)}/checkin`, { cache: 'no-store' });
      const data = (await res.json()) as { ok?: boolean; activity?: SalaActivity };
      if (cancelled) return;
      if (!res.ok || !data.activity) {
        setMissing(true);
        return;
      }
      setActivity(data.activity);
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const geo = await captureGeo();
      const res = await fetch(`/api/actividad/invite/${encodeURIComponent(code)}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, geo, deviceId: readDeviceId() }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        already?: boolean;
        participant?: { name?: string; state?: ParticipantState; geoStatus?: GeoStatus | null };
      };
      if (!res.ok || !data.ok || !data.participant?.name) {
        setError(data.message || t.notFound);
        return;
      }
      setDone({
        name: data.participant.name,
        already: Boolean(data.already),
        geoStatus: data.participant.geoStatus || null,
      });
    } catch {
      setError(t.notFound);
    } finally {
      setBusy(false);
    }
  }

  if (missing) {
    return (
      <ActividadFrame>
        <p className="text-sm leading-6 text-[#071F5E]">{t.notFound}</p>
      </ActividadFrame>
    );
  }

  if (!activity) {
    return (
      <ActividadFrame>
        <p className="text-sm text-[#071F5E]/70">{t.loading}</p>
      </ActividadFrame>
    );
  }

  const geoNote =
    done?.geoStatus === 'lejos' ? t.lejos : done?.geoStatus === 'sin_gps' ? t.sinGps : t.geoOk;

  return (
    <ActividadFrame>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#009179]">{copy.eyebrow}</p>
      <h1 className="mt-2 text-2xl font-bold text-[#071F5E]">{activity.title}</h1>
      <ActividadMeta
        placeLabel={t.place}
        whenLabel={t.when}
        projectLabel={t.project}
        place={activity.place}
        when={formatActividadWhen(activity.startsAt, locale)}
        project={activity.projectLabel}
      />

      {done ? (
        <div className="mt-5 rounded-2xl bg-[#E7F6EC] px-4 py-4 text-[#1D6359]">
          <p className="text-lg font-bold">{copy.ok}</p>
          <p className="mt-1 text-sm leading-6">
            {done.already ? copy.already : geoNote}
          </p>
          <p className="mt-2 text-sm font-semibold">{done.name}</p>
          <p className="mt-3 text-sm">{t.backHint}</p>
        </div>
      ) : null}

      {!done && !activity.checkInOpen ? <p className="mt-5 text-sm leading-6">{copy.closed}</p> : null}

      {!done && activity.checkInOpen ? (
        <form onSubmit={submit} className="mt-5 space-y-3">
          <p className="text-sm leading-6 text-[#1E1E1E]/75">{copy.lead}</p>
          <label className="block text-sm font-semibold text-[#071F5E]">
            {copy.email}
            <input
              className="mt-1 min-h-12 w-full rounded-xl border border-[#071F5E]/15 px-3 text-base font-normal outline-none focus:border-[#009179]"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold text-[#071F5E]">
            {copy.password}
            <input
              className="mt-1 min-h-12 w-full rounded-xl border border-[#071F5E]/15 px-3 text-base font-normal outline-none focus:border-[#009179]"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="min-h-14 w-full rounded-2xl bg-[#009179] text-lg font-bold text-white disabled:opacity-60"
          >
            {busy ? t.sending : copy.submit}
          </button>
        </form>
      ) : null}
    </ActividadFrame>
  );
}
