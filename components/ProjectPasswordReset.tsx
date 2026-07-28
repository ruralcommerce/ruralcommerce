'use client';

import { useMemo, useState } from 'react';
import { getProjectLocaleKey, mapProjectApiMessage, type ProjectLocaleKey } from '@/lib/project-locale';

const copy: Record<
  ProjectLocaleKey,
  {
    eyebrow: string;
    requestTitle: string;
    requestText: string;
    emailLabel: string;
    sendLink: string;
    sending: string;
    sentTitle: string;
    sentText: string;
    resetTitle: string;
    resetText: string;
    passwordLabel: string;
    passwordConfirmLabel: string;
    save: string;
    saving: string;
    successTitle: string;
    successText: string;
    goProfile: string;
    mismatch: string;
    genericError: string;
  }
> = {
  es: {
    eyebrow: 'Acceso al proyecto',
    requestTitle: '¿Olvidaste tu contraseña?',
    requestText: 'Escribe el correo de tu inscripción. Te enviaremos un enlace para crear una nueva contraseña.',
    emailLabel: 'Correo electrónico',
    sendLink: 'Enviar enlace',
    sending: 'Enviando...',
    sentTitle: 'Revisa tu correo',
    sentText: 'Si existe una cuenta con ese correo, recibirás un enlace válido por 2 horas.',
    resetTitle: 'Crea tu nueva contraseña',
    resetText: 'Elige una contraseña nueva (mínimo 6 caracteres) para entrar a tu perfil y firmar el convenio.',
    passwordLabel: 'Nueva contraseña',
    passwordConfirmLabel: 'Confirmar contraseña',
    save: 'Guardar contraseña',
    saving: 'Guardando...',
    successTitle: 'Contraseña actualizada',
    successText: 'Ya puedes entrar a tu perfil con la nueva contraseña.',
    goProfile: 'Ir a mi perfil',
    mismatch: 'Las contraseñas no coinciden.',
    genericError: 'No se pudo completar la solicitud. Intenta nuevamente.',
  },
  'pt-BR': {
    eyebrow: 'Acesso ao projeto',
    requestTitle: 'Esqueceu sua senha?',
    requestText: 'Digite o e-mail da sua inscrição. Enviaremos um link para criar uma nova senha.',
    emailLabel: 'E-mail',
    sendLink: 'Enviar link',
    sending: 'Enviando...',
    sentTitle: 'Verifique seu e-mail',
    sentText: 'Se existir uma conta com esse e-mail, você receberá um link válido por 2 horas.',
    resetTitle: 'Crie sua nova senha',
    resetText: 'Escolha uma nova senha (mínimo 6 caracteres) para entrar no perfil e assinar o convênio.',
    passwordLabel: 'Nova senha',
    passwordConfirmLabel: 'Confirmar senha',
    save: 'Salvar senha',
    saving: 'Salvando...',
    successTitle: 'Senha atualizada',
    successText: 'Você já pode entrar no perfil com a nova senha.',
    goProfile: 'Ir ao meu perfil',
    mismatch: 'As senhas não coincidem.',
    genericError: 'Não foi possível concluir o pedido. Tente novamente.',
  },
  en: {
    eyebrow: 'Project access',
    requestTitle: 'Forgot your password?',
    requestText: 'Enter the email from your application. We will send a link to create a new password.',
    emailLabel: 'Email',
    sendLink: 'Send link',
    sending: 'Sending...',
    sentTitle: 'Check your email',
    sentText: 'If an account exists for that email, you will receive a link valid for 2 hours.',
    resetTitle: 'Create your new password',
    resetText: 'Choose a new password (minimum 6 characters) to access your profile and sign the agreement.',
    passwordLabel: 'New password',
    passwordConfirmLabel: 'Confirm password',
    save: 'Save password',
    saving: 'Saving...',
    successTitle: 'Password updated',
    successText: 'You can now sign in to your profile with the new password.',
    goProfile: 'Go to my profile',
    mismatch: 'Passwords do not match.',
    genericError: 'Could not complete the request. Please try again.',
  },
};

export function ProjectPasswordReset({
  locale,
  initialEmail = '',
  initialToken = '',
}: {
  locale: string;
  initialEmail?: string;
  initialToken?: string;
}) {
  const localeKey = getProjectLocaleKey(locale);
  const t = copy[localeKey];
  const hasToken = Boolean(initialToken && initialEmail);

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'request' | 'sent' | 'reset' | 'done'>(hasToken ? 'reset' : 'request');

  const profileHref = useMemo(() => `/${localeKey}/perfil`, [localeKey]);
  const inputCls = 'mt-1 w-full rounded-2xl border border-[#D9E3EC] px-4 py-3 text-sm';
  const cardCls = 'rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#E6EBF1] sm:p-6';

  const requestReset = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/projeto/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale: localeKey }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(mapProjectApiMessage(payload.message, localeKey, t.genericError));
        return;
      }
      setMode('sent');
    } catch {
      setError(t.genericError);
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async () => {
    if (password !== passwordConfirm) {
      setError(t.mismatch);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/projeto/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: initialEmail || email,
          token: initialToken,
          password,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(mapProjectApiMessage(payload.message, localeKey, t.genericError));
        return;
      }
      setMode('done');
    } catch {
      setError(t.genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cardCls}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6359]">{t.eyebrow}</p>

      {mode === 'request' ? (
        <>
          <h1 className="mt-2 text-2xl font-semibold text-[#071F5E]">{t.requestTitle}</h1>
          <p className="mt-2 text-sm leading-6 text-[#2F3336]/80">{t.requestText}</p>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-[#071F5E]">{t.emailLabel}</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </label>
          <button
            type="button"
            onClick={requestReset}
            disabled={loading || !email.trim()}
            className="mt-4 inline-flex rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E] disabled:opacity-60"
          >
            {loading ? t.sending : t.sendLink}
          </button>
        </>
      ) : null}

      {mode === 'sent' ? (
        <>
          <h1 className="mt-2 text-2xl font-semibold text-[#071F5E]">{t.sentTitle}</h1>
          <p className="mt-2 text-sm leading-6 text-[#2F3336]/80">{t.sentText}</p>
        </>
      ) : null}

      {mode === 'reset' ? (
        <>
          <h1 className="mt-2 text-2xl font-semibold text-[#071F5E]">{t.resetTitle}</h1>
          <p className="mt-2 text-sm leading-6 text-[#2F3336]/80">{t.resetText}</p>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-[#071F5E]">{t.passwordLabel}</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} className={inputCls} />
          </label>
          <label className="mt-3 block">
            <span className="text-sm font-medium text-[#071F5E]">{t.passwordConfirmLabel}</span>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              minLength={6}
              className={inputCls}
            />
          </label>
          <button
            type="button"
            onClick={savePassword}
            disabled={loading || password.length < 6}
            className="mt-4 inline-flex rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E] disabled:opacity-60"
          >
            {loading ? t.saving : t.save}
          </button>
        </>
      ) : null}

      {mode === 'done' ? (
        <>
          <h1 className="mt-2 text-2xl font-semibold text-[#071F5E]">{t.successTitle}</h1>
          <p className="mt-2 text-sm leading-6 text-[#2F3336]/80">{t.successText}</p>
          <a
            href={profileHref}
            className="mt-4 inline-flex rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E]"
          >
            {t.goProfile}
          </a>
        </>
      ) : null}

      {error ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
