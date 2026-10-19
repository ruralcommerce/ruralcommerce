'use client';

import { useEffect, useState } from 'react';
import { actividadCopy, formatActividadWhen } from '@/lib/actividades/copy';
import type { ActivityKind, ActivityStatus, GeoStatus, ParticipantState } from '@/lib/actividades/types';
import { ActividadFrame, ActividadMeta } from './ActividadFrame';
import { captureGeo, readDeviceId } from './geo-client';

type Payload = {
  activity: {
    kind: ActivityKind;
    title: string;
    projectLabel: string;
    place: string;
    startsAt: string;
    status: ActivityStatus;
  };
  participant: {
    name: string;
    organization: string;
    state: ParticipantState;
    confirmedAt: string | null;
    geoStatus: GeoStatus | null;
  };
};

export function ActividadConfirm({ locale, token }: { locale: string; token: string }) {
  const t = actividadCopy(locale);
  const [data, setData] = useState<Payload | null>(null);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<'new' | 'already' | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/actividad/confirm/${encodeURIComponent(token)}`, { cache: 'no-store' });
      const body = (await res.json()) as Payload & { ok?: boolean };
      if (cancelled) return;
      if (!res.ok || !body.activity || !body.participant) {
        setMissing(true);
        return;
      }
      setData(body);
      if (body.participant.state === 'presente') setResult('already');
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function confirm() {
    setBusy(true);
    setError('');
    try {
      const geo = await captureGeo();
      const res = await fetch(`/api/actividad/confirm/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geo, deviceId: readDeviceId() }),
      });
      const body = (await res.json()) as Payload & { ok?: boolean; already?: boolean; message?: string };
      if (!res.ok || !body.ok || !body.participant) {
        setError(body.message || t.closedConfirm);
        return;
      }
      setData(body);
      setResult(body.already ? 'already' : 'new');
    } catch {
      setError(t.closedConfirm);
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

  if (!data) {
    return (
      <ActividadFrame>
        <p className="text-sm text-[#071F5E]/70">{t.loading}</p>
      </ActividadFrame>
    );
  }

  const closed = data.activity.status === 'cerrada';
  const presente = data.participant.state === 'presente' || result != null;
  const geoNote =
    data.participant.geoStatus === 'lejos' ? t.lejos : data.participant.geoStatus === 'sin_gps' ? t.sinGps : t.geoOk;

  return (
    <ActividadFrame>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#009179]">
        {data.activity.kind === 'visita' ? 'Visita' : 'Capacitación'}
      </p>
      <h1 className="mt-2 text-2xl font-bold text-[#071F5E]">{t.confirmHello(data.participant.name)}</h1>
      <p className="mt-2 text-sm leading-6 text-[#1E1E1E]/75">{t.confirmLead(data.activity.title)}</p>
      <ActividadMeta
        placeLabel={t.place}
        whenLabel={t.when}
        projectLabel={t.project}
        place={data.activity.place}
        when={formatActividadWhen(data.activity.startsAt, locale)}
        project={data.activity.projectLabel}
      />

      {presente ? (
        <div className="mt-5 rounded-2xl bg-[#E7F6EC] px-4 py-4 text-[#1D6359]">
          <p className="text-lg font-bold">{t.confirmedTitle}</p>
          <p className="mt-1 text-sm leading-6">{result === 'already' ? t.alreadyConfirmed : geoNote}</p>
          <p className="mt-3 text-sm">{t.backHint}</p>
        </div>
      ) : null}

      {!presente && closed ? <p className="mt-5 text-sm leading-6">{t.closedConfirm}</p> : null}

      {!presente && !closed ? (
        <div className="mt-5">
          {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={busy}
            className="min-h-14 w-full rounded-2xl bg-[#009179] text-lg font-bold text-white disabled:opacity-60"
          >
            {busy ? t.sending : t.confirmButton}
          </button>
        </div>
      ) : null}
    </ActividadFrame>
  );
}
