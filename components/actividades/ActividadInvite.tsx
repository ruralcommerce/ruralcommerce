'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { actividadCopy, formatActividadWhen } from '@/lib/actividades/copy';
import { emptyEnrollmentForm, type EnrollmentFormState } from '@/lib/actividades/profile';
import type { ActivityKind, ActivityStatus } from '@/lib/actividades/types';
import type { ProjectSex } from '@/lib/project-sex';
import { ActividadFrame, ActividadMeta } from './ActividadFrame';

type PublicActivity = {
  kind: ActivityKind;
  title: string;
  projectLabel: string;
  place: string;
  startsAt: string;
  status: ActivityStatus;
  inviteOpen: boolean;
};

export function ActividadInvite({ locale, code }: { locale: string; code: string }) {
  const t = actividadCopy(locale);
  const [activity, setActivity] = useState<PublicActivity | null>(null);
  const [missing, setMissing] = useState(false);
  const [form, setForm] = useState<EnrollmentFormState>(emptyEnrollmentForm());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ already: boolean; token: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/actividad/invite/${encodeURIComponent(code)}`, { cache: 'no-store' });
      const data = (await res.json()) as { ok?: boolean; activity?: PublicActivity };
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

  async function enroll(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/actividad/invite/${encodeURIComponent(code)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        already?: boolean;
        participant?: { confirmToken?: string };
      };
      if (!res.ok || !data.ok || !data.participant?.confirmToken) {
        setError(data.message || t.notFound);
        return;
      }
      setDone({ already: Boolean(data.already), token: data.participant.confirmToken });
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

  return (
    <ActividadFrame>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#009179]">
        {activity.kind === 'visita' ? 'Visita' : 'Inscripción'}
      </p>
      <h1 className="mt-2 text-2xl font-bold text-[#071F5E]">{activity.title}</h1>
      <ActividadMeta
        placeLabel={t.place}
        whenLabel={t.when}
        projectLabel={t.project}
        place={activity.place}
        when={formatActividadWhen(activity.startsAt, locale)}
        project={activity.projectLabel}
      />

      {activity.kind !== 'capacitacion' ? <p className="mt-4 text-sm leading-6">{t.visitNoInvite}</p> : null}
      {activity.kind === 'capacitacion' && !activity.inviteOpen ? (
        <p className="mt-4 text-sm leading-6">{t.closedInvite}</p>
      ) : null}

      {activity.inviteOpen && !done ? (
        <form onSubmit={enroll} className="mt-5 space-y-3">
          <p className="rounded-2xl bg-[#E7F6EC] px-3 py-3 text-sm font-semibold leading-6 text-[#1D6359]">{t.inviteSteps}</p>
          <p className="text-sm leading-6 text-[#1E1E1E]/75">{t.inviteLead}</p>
          <Field label={t.name} value={form.name} onChange={(name) => setForm((f) => ({ ...f, name }))} required />
          <Field
            label={t.documentId}
            value={form.documentId}
            onChange={(documentId) => setForm((f) => ({ ...f, documentId }))}
            required
          />
          <label className="block text-sm font-semibold text-[#071F5E]">
            {t.sex}
            <select
              className="mt-1 min-h-12 w-full rounded-xl border border-[#071F5E]/15 px-3 text-base font-normal text-[#1E1E1E] outline-none focus:border-[#009179]"
              value={form.sex}
              required
              onChange={(event) => setForm((f) => ({ ...f, sex: event.target.value as '' | ProjectSex }))}
            >
              <option value="">—</option>
              {t.sexOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Field
            label={t.age}
            value={form.age}
            onChange={(age) => setForm((f) => ({ ...f, age }))}
            type="number"
            required
            inputMode="numeric"
          />
          <Field
            label={t.locality}
            value={form.locality}
            onChange={(locality) => setForm((f) => ({ ...f, locality }))}
            required
          />
          <Field label={t.phone} value={form.phone} onChange={(phone) => setForm((f) => ({ ...f, phone }))} required />
          <Field
            label={t.companyName}
            value={form.companyName}
            onChange={(companyName) => setForm((f) => ({ ...f, companyName }))}
          />
          <div>
            <Field
              label={t.organization}
              value={form.organization}
              onChange={(organization) => setForm((f) => ({ ...f, organization }))}
            />
            <p className="mt-1 text-xs leading-5 text-[#1E1E1E]/55">{t.organizationHint}</p>
          </div>
          <Field label={t.email} value={form.email} onChange={(email) => setForm((f) => ({ ...f, email }))} type="email" />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="min-h-12 w-full rounded-2xl bg-[#009179] text-base font-semibold text-white disabled:opacity-60"
          >
            {busy ? t.sending : t.enroll}
          </button>
        </form>
      ) : null}

      {done ? (
        <div className="mt-5">
          <h2 className="text-lg font-bold text-[#071F5E]">{done.already ? t.alreadyTitle : t.enrolledTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-[#1E1E1E]/75">{t.enrolledBody}</p>
          <p className="mt-2 text-sm leading-6 text-[#1E1E1E]/65">{t.confirmLater}</p>
          <Link
            href={`/${locale}/actividad/c/${done.token}`}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#071F5E] px-4 text-base font-semibold text-white"
          >
            {t.confirmNow}
          </Link>
        </div>
      ) : null}
    </ActividadFrame>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = 'text',
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <label className="block text-sm font-semibold text-[#071F5E]">
      {label}
      <input
        className="mt-1 min-h-12 w-full rounded-xl border border-[#071F5E]/15 px-3 text-base font-normal text-[#1E1E1E] outline-none focus:border-[#009179]"
        value={value}
        type={type}
        required={required}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
