'use client';

import { useEffect, useState } from 'react';
import { getProjectLocaleKey, type ProjectLocaleKey } from '@/lib/project-locale';

type InviteRow = {
  id: string;
  invitedEmail: string;
  registrationEmail: string | null;
  status: string;
  progress: { currentStep: string };
  createdAt: string;
  sentAt: string | null;
  onboardingUrl: string;
  note?: string;
};

const copy: Record<
  ProjectLocaleKey,
  {
    title: string;
    hint: string;
    email: string;
    note: string;
    locale: string;
    send: string;
    sending: string;
    refresh: string;
    recent: string;
    empty: string;
    success: string;
    emailFailed: string;
    copyLink: string;
  }
> = {
  es: {
    title: 'Invitación directa a un emprendimiento',
    hint: 'Envía un correo oficial con un enlace personal. La persona completa registro, contraseña, convenio y diagnóstico en un solo proceso. Solo queda en el proyecto cuando termina todo.',
    email: 'Correo del emprendimiento',
    note: 'Nota interna (opcional)',
    locale: 'Idioma del correo',
    send: 'Crear y enviar invitación',
    sending: 'Enviando...',
    refresh: 'Actualizar lista',
    recent: 'Invitaciones recientes',
    empty: 'Aún no hay invitaciones.',
    success: 'Invitación creada y enviada.',
    emailFailed: 'Invitación creada, pero el correo no se pudo enviar. Copia el enlace y compártelo.',
    copyLink: 'Copiar enlace',
  },
  'pt-BR': {
    title: 'Convite direto a um empreendimento',
    hint: 'Envia um e-mail oficial com um link pessoal. A pessoa completa cadastro, senha, convênio e diagnóstico em um único processo. Só fica no projeto quando terminar tudo.',
    email: 'E-mail do empreendimento',
    note: 'Nota interna (opcional)',
    locale: 'Idioma do e-mail',
    send: 'Criar e enviar convite',
    sending: 'Enviando...',
    refresh: 'Atualizar lista',
    recent: 'Convites recentes',
    empty: 'Ainda não há convites.',
    success: 'Convite criado e enviado.',
    emailFailed: 'Convite criado, mas o e-mail não pôde ser enviado. Copie o link e compartilhe.',
    copyLink: 'Copiar link',
  },
  en: {
    title: 'Direct invitation to an enterprise',
    hint: 'Send an official email with a personal link. The person completes registration, password, agreement and diagnosis in one process. They join the project only when everything is done.',
    email: 'Enterprise email',
    note: 'Internal note (optional)',
    locale: 'Email language',
    send: 'Create and send invitation',
    sending: 'Sending...',
    refresh: 'Refresh list',
    recent: 'Recent invitations',
    empty: 'No invitations yet.',
    success: 'Invitation created and sent.',
    emailFailed: 'Invitation created, but the email could not be sent. Copy the link and share it.',
    copyLink: 'Copy link',
  },
};

function authHeaders(teamPassword: string, teamToken?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (teamToken) headers.Authorization = `Bearer ${teamToken}`;
  return { headers, password: teamPassword };
}

export function ProjectInvitePanel({
  locale,
  teamPassword,
  teamToken,
}: {
  locale: string;
  teamPassword: string;
  teamToken?: string;
}) {
  const localeKey = getProjectLocaleKey(locale);
  const t = copy[localeKey];
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [inviteLocale, setInviteLocale] = useState<ProjectLocaleKey>('es');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [lastUrl, setLastUrl] = useState('');

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (!teamToken && teamPassword) params.set('password', teamPassword);
      const response = await fetch(`/api/projeto/participant-invites?${params.toString()}`, {
        headers: teamToken ? { Authorization: `Bearer ${teamToken}` } : undefined,
      });
      const payload = await response.json();
      if (response.ok && payload.ok) {
        setInvites(payload.invites || []);
      }
    } catch {
      // ignore list errors in panel
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamToken]);

  const handleSend = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    setLastUrl('');
    try {
      const auth = authHeaders(teamPassword, teamToken);
      const response = await fetch('/api/projeto/participant-invites', {
        method: 'POST',
        headers: auth.headers,
        body: JSON.stringify({
          email,
          note,
          locale: inviteLocale,
          password: auth.password,
          sendEmail: true,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || 'Error');
        return;
      }
      setLastUrl(payload.invite?.onboardingUrl || '');
      if (payload.email?.ok) {
        setMessage(t.success);
      } else {
        setMessage(t.emailFailed);
      }
      setEmail('');
      setNote('');
      await load();
    } catch {
      setError('Error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[#E6EBF1] bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#071F5E]">{t.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#2F3336]/75">{t.hint}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-[#071F5E]">{t.email}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[#071F5E]">{t.locale}</span>
          <select
            value={inviteLocale}
            onChange={(e) => setInviteLocale(e.target.value as ProjectLocaleKey)}
            className="mt-1 w-full rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm"
          >
            <option value="es">Español</option>
            <option value="pt-BR">Português</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[#071F5E]">{t.note}</span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || !email.trim()}
          onClick={() => void handleSend()}
          className="rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E] disabled:opacity-60"
        >
          {busy ? t.sending : t.send}
        </button>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-full border border-[#D9E3EC] px-5 py-2.5 text-sm font-semibold text-[#071F5E]"
        >
          {t.refresh}
        </button>
      </div>

      {message ? <p className="mt-3 rounded-2xl bg-[#EEF7F7] p-3 text-sm text-[#1D6359]">{message}</p> : null}
      {error ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {lastUrl ? (
        <div className="mt-3 rounded-2xl border border-[#E6EBF1] bg-[#FBFCFD] p-3 text-sm">
          <p className="break-all text-[#071F5E]">{lastUrl}</p>
          <button
            type="button"
            className="mt-2 text-sm font-semibold text-[#1D6359] underline"
            onClick={() => void navigator.clipboard.writeText(lastUrl)}
          >
            {t.copyLink}
          </button>
        </div>
      ) : null}

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-[#071F5E]">{t.recent}</h4>
        {invites.length === 0 ? (
          <p className="mt-2 text-sm text-[#2F3336]/60">{t.empty}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {invites.slice(0, 8).map((invite) => (
              <li
                key={invite.id}
                className="rounded-2xl border border-[#E6EBF1] px-3 py-2 text-sm text-[#2F3336]/80"
              >
                <p className="font-medium text-[#071F5E]">{invite.invitedEmail}</p>
                <p className="text-xs text-[#2F3336]/55">
                  {invite.status} · {invite.progress.currentStep}
                  {invite.registrationEmail && invite.registrationEmail !== invite.invitedEmail
                    ? ` · ${invite.registrationEmail}`
                    : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
