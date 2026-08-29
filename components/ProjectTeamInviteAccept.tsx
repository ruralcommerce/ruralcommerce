'use client';

import { useEffect, useState } from 'react';
import { ProjectPortalHero, ProjectPortalPanel } from '@/components/ProjectPortalLayout';

type LocaleKey = 'es' | 'pt-BR' | 'en';

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const copy = {
  es: {
    eyebrow: 'Intranet del equipo',
    title: 'Completa tu acceso',
    intro: 'Escribe tu nombre completo y crea la contraseña que usarás para entrar al panel.',
    email: 'Correo',
    name: 'Nombre completo',
    password: 'Contraseña',
    passwordConfirm: 'Confirma la contraseña',
    submit: 'Crear acceso',
    submitting: 'Guardando...',
    success: 'Tu acceso quedó listo. Ya puedes entrar a la intranet.',
    loginCta: 'Ir a la intranet',
    invalid: 'Este enlace no es válido o ya venció. Pide una nueva invitación al administrador.',
    mismatch: 'Las contraseñas no coinciden.',
    short: 'La contraseña debe tener al menos 8 caracteres.',
    error: 'No fue posible completar el acceso.',
  },
  'pt-BR': {
    eyebrow: 'Intranet da equipe',
    title: 'Conclua seu acesso',
    intro: 'Informe seu nome completo e crie a senha que você usará para entrar no painel.',
    email: 'E-mail',
    name: 'Nome completo',
    password: 'Senha',
    passwordConfirm: 'Confirme a senha',
    submit: 'Criar acesso',
    submitting: 'Salvando...',
    success: 'Seu acesso está pronto. Você já pode entrar na intranet.',
    loginCta: 'Ir para a intranet',
    invalid: 'Este link é inválido ou já expirou. Peça um novo convite ao administrador.',
    mismatch: 'As senhas não coincidem.',
    short: 'A senha deve ter pelo menos 8 caracteres.',
    error: 'Não foi possível concluir o acesso.',
  },
  en: {
    eyebrow: 'Team intranet',
    title: 'Finish your access',
    intro: 'Enter your full name and create the password you will use to sign in.',
    email: 'Email',
    name: 'Full name',
    password: 'Password',
    passwordConfirm: 'Confirm password',
    submit: 'Create access',
    submitting: 'Saving...',
    success: 'Your access is ready. You can now sign in to the intranet.',
    loginCta: 'Go to intranet',
    invalid: 'This link is invalid or has expired. Ask the administrator for a new invite.',
    mismatch: 'Passwords do not match.',
    short: 'Password must be at least 8 characters.',
    error: 'Could not complete your access.',
  },
} as const;

export function ProjectTeamInviteAccept({
  locale,
  token,
}: {
  locale: string;
  token: string;
}) {
  const localeKey = getLocaleKey(locale);
  const t = copy[localeKey];
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(token));
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(t.invalid);
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        const response = await fetch(`/api/projeto/auth/team/invite?token=${encodeURIComponent(token)}`);
        const payload = await response.json();
        if (!response.ok || !payload.ok) {
          setError(t.invalid);
          return;
        }
        setEmail(payload.email || '');
      } catch {
        setError(t.invalid);
      } finally {
        setLoading(false);
      }
    })();
  }, [t.invalid, token]);

  const handleSubmit = async () => {
    if (password.length < 8) {
      setError(t.short);
      return;
    }
    if (password !== passwordConfirm) {
      setError(t.mismatch);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/projeto/auth/team/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password, passwordConfirm }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || t.error);
        return;
      }
      setDone(true);
    } catch {
      setError(t.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <ProjectPortalHero eyebrow={t.eyebrow} title={t.title} description={t.intro} />
      <ProjectPortalPanel>
        {loading ? <p className="text-sm text-[#2F3336]/70">...</p> : null}
        {done ? (
          <div>
            <p className="text-sm leading-6 text-[#1D6359]">{t.success}</p>
            <a
              href={`/${localeKey}/admin`}
              className="mt-4 inline-flex rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E]"
            >
              {t.loginCta}
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-[#071F5E]">{t.email}</span>
              <input value={email} readOnly className="mt-1 w-full rounded-2xl border border-[#D9E3EC] bg-[#F7FAFB] px-4 py-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#071F5E]">{t.name}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#071F5E]">{t.password}</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#071F5E]">{t.passwordConfirm}</span>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm"
              />
            </label>
            <button
              type="button"
              disabled={saving || !token}
              onClick={() => void handleSubmit()}
              className="rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E] disabled:opacity-60"
            >
              {saving ? t.submitting : t.submit}
            </button>
          </div>
        )}
        {error ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </ProjectPortalPanel>
    </div>
  );
}
