'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatProjectDate, getProjectLocaleKey, type ProjectLocaleKey } from '@/lib/project-locale';

type TeamRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'invited' | 'active';
  invitedAt?: string;
  createdAt: string;
};

const copy: Record<
  ProjectLocaleKey,
  {
    title: string;
    hint: string;
    email: string;
    invite: string;
    inviting: string;
    success: string;
    resend: string;
    listTitle: string;
    statusInvited: string;
    statusActive: string;
    empty: string;
    error: string;
  }
> = {
  es: {
    title: 'Usuarios del equipo',
    hint: 'Escribe el correo. La persona recibe un enlace para poner su nombre y crear su contraseña.',
    email: 'Correo del nuevo usuario',
    invite: 'Enviar invitación',
    inviting: 'Enviando...',
    success: 'Invitación enviada. La persona debe abrir el correo y completar su acceso.',
    resend: 'Reenviar invitación',
    listTitle: 'Equipo actual',
    statusInvited: 'Pendiente de crear contraseña',
    statusActive: 'Activo',
    empty: 'Aún no hay otros usuarios.',
    error: 'No fue posible enviar la invitación.',
  },
  'pt-BR': {
    title: 'Usuários da equipe',
    hint: 'Informe o e-mail. A pessoa recebe um link para colocar o nome e criar a senha.',
    email: 'E-mail do novo usuário',
    invite: 'Enviar convite',
    inviting: 'Enviando...',
    success: 'Convite enviado. A pessoa deve abrir o e-mail e concluir o acesso.',
    resend: 'Reenviar convite',
    listTitle: 'Equipe atual',
    statusInvited: 'Pendente de criar senha',
    statusActive: 'Ativo',
    empty: 'Ainda não há outros usuários.',
    error: 'Não foi possível enviar o convite.',
  },
  en: {
    title: 'Team users',
    hint: 'Enter the email. The person receives a link to set their name and create a password.',
    email: 'New user email',
    invite: 'Send invite',
    inviting: 'Sending...',
    success: 'Invite sent. They must open the email and finish creating their access.',
    resend: 'Resend invite',
    listTitle: 'Current team',
    statusInvited: 'Pending password',
    statusActive: 'Active',
    empty: 'No other users yet.',
    error: 'Could not send the invite.',
  },
};

export function ProjectTeamMembersPanel({
  locale,
  teamToken,
}: {
  locale: string;
  teamToken: string;
}) {
  const localeKey = getProjectLocaleKey(locale);
  const t = copy[localeKey];
  const [email, setEmail] = useState('');
  const [members, setMembers] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const headers = useCallback(
    () => ({
      Authorization: `Bearer ${teamToken}`,
      'Content-Type': 'application/json',
    }),
    [teamToken]
  );

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/projeto/auth/team/members', { headers: headers() });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || t.error);
        return;
      }
      setMembers(payload.members || []);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }, [headers, t.error]);

  useEffect(() => {
    if (teamToken) void loadMembers();
  }, [loadMembers, teamToken]);

  const sendInvite = async (targetEmail: string) => {
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/projeto/auth/team/invite', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email: targetEmail, locale: localeKey }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || t.error);
        return;
      }
      setSuccess(t.success);
      setEmail('');
      await loadMembers();
    } catch {
      setError(t.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-[#E6EBF1] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#071F5E]">{t.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#2F3336]/75">{t.hint}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.email}
            className="w-full rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm"
          />
          <button
            type="button"
            disabled={sending || !email.trim()}
            onClick={() => void sendInvite(email)}
            className="shrink-0 rounded-full bg-[#52ADAD] px-5 py-3 text-sm font-semibold text-[#071F5E] disabled:opacity-60"
          >
            {sending ? t.inviting : t.invite}
          </button>
        </div>
        {success ? <p className="mt-3 rounded-2xl bg-[#E7F6EC] p-3 text-sm text-[#1D6359]">{success}</p> : null}
        {error ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </div>

      <div className="rounded-[24px] border border-[#E6EBF1] bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1D6359]">{t.listTitle}</h3>
        {loading ? <p className="mt-3 text-sm text-[#2F3336]/70">...</p> : null}
        {!loading && !members.length ? <p className="mt-3 text-sm text-[#2F3336]/70">{t.empty}</p> : null}
        <div className="mt-3 space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex flex-col gap-2 rounded-2xl border border-[#E6EBF1] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#071F5E]">{member.name || member.email}</p>
                <p className="text-sm text-[#2F3336]/75">{member.email}</p>
                <p className="mt-1 text-xs text-[#2F3336]/60">
                  {member.status === 'active' ? t.statusActive : t.statusInvited}
                  {member.invitedAt ? ` · ${formatProjectDate(member.invitedAt, localeKey)}` : ''}
                </p>
              </div>
              {member.status === 'invited' ? (
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => void sendInvite(member.email)}
                  className="rounded-full border border-[#D9E3EC] px-4 py-2 text-sm font-semibold text-[#071F5E]"
                >
                  {t.resend}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
