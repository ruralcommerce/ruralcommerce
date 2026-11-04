'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import { RuralCommerceFooter } from '@/components/RuralCommerceFooter';

type LocaleKey = 'es' | 'pt-BR' | 'en';

const copy: Record<
  LocaleKey,
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
    goLogin: string;
    mismatch: string;
    genericError: string;
    backLogin: string;
  }
> = {
  es: {
    eyebrow: 'Intranet',
    requestTitle: '¿Olvidaste tu contraseña?',
    requestText: 'Escribe el correo de tu cuenta. Te enviaremos un enlace para crear una nueva contraseña.',
    emailLabel: 'Correo electrónico',
    sendLink: 'Enviar enlace',
    sending: 'Enviando…',
    sentTitle: 'Revisa tu correo',
    sentText: 'Si existe una cuenta con ese correo, recibirás un enlace válido por 2 horas.',
    resetTitle: 'Crea tu nueva contraseña',
    resetText: 'Elige una contraseña nueva (mínimo 6 caracteres) para entrar a la intranet.',
    passwordLabel: 'Nueva contraseña',
    passwordConfirmLabel: 'Confirmar contraseña',
    save: 'Guardar contraseña',
    saving: 'Guardando…',
    successTitle: 'Contraseña actualizada',
    successText: 'Ya puedes entrar a la intranet con la nueva contraseña.',
    goLogin: 'Ir al login',
    mismatch: 'Las contraseñas no coinciden.',
    genericError: 'No se pudo completar la solicitud. Intenta nuevamente.',
    backLogin: 'Volver al login',
  },
  'pt-BR': {
    eyebrow: 'Intranet',
    requestTitle: 'Esqueceu sua senha?',
    requestText: 'Digite o e-mail da sua conta. Enviaremos um link para criar uma nova senha.',
    emailLabel: 'E-mail',
    sendLink: 'Enviar link',
    sending: 'Enviando…',
    sentTitle: 'Verifique seu e-mail',
    sentText: 'Se existir uma conta com esse e-mail, você receberá um link válido por 2 horas.',
    resetTitle: 'Crie sua nova senha',
    resetText: 'Escolha uma nova senha (mínimo 6 caracteres) para entrar na intranet.',
    passwordLabel: 'Nova senha',
    passwordConfirmLabel: 'Confirmar senha',
    save: 'Salvar senha',
    saving: 'Salvando…',
    successTitle: 'Senha atualizada',
    successText: 'Você já pode entrar na intranet com a nova senha.',
    goLogin: 'Ir ao login',
    mismatch: 'As senhas não coincidem.',
    genericError: 'Não foi possível concluir o pedido. Tente novamente.',
    backLogin: 'Voltar ao login',
  },
  en: {
    eyebrow: 'Intranet',
    requestTitle: 'Forgot your password?',
    requestText: 'Enter your account email. We will send a link to create a new password.',
    emailLabel: 'Email',
    sendLink: 'Send link',
    sending: 'Sending…',
    sentTitle: 'Check your email',
    sentText: 'If an account exists for that email, you will receive a link valid for 2 hours.',
    resetTitle: 'Create your new password',
    resetText: 'Choose a new password (minimum 6 characters) to sign in to the intranet.',
    passwordLabel: 'New password',
    passwordConfirmLabel: 'Confirm password',
    save: 'Save password',
    saving: 'Saving…',
    successTitle: 'Password updated',
    successText: 'You can now sign in to the intranet with the new password.',
    goLogin: 'Go to login',
    mismatch: 'Passwords do not match.',
    genericError: 'Could not complete the request. Please try again.',
    backLogin: 'Back to login',
  },
};

function localeKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

export function IntranetPasswordReset({
  locale,
  initialEmail = '',
  initialToken = '',
}: {
  locale: string;
  initialEmail?: string;
  initialToken?: string;
}) {
  const key = localeKey(locale);
  const t = copy[key];
  const hasToken = Boolean(initialToken && initialEmail);
  const loginHref = useMemo(() => `/${locale}/intranet`, [locale]);

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'request' | 'sent' | 'reset' | 'done'>(hasToken ? 'reset' : 'request');

  const inputCls =
    'mt-2 min-h-11 w-full rounded-xl border border-[#071F5E]/15 bg-[#F7FAFC] px-4 text-sm outline-none transition focus:border-[#009179] focus:ring-2 focus:ring-[#009179]/20';

  async function requestReset() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/intranet/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale: key }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || t.genericError);
        return;
      }
      setMode('sent');
    } catch {
      setError(t.genericError);
    } finally {
      setLoading(false);
    }
  }

  async function savePassword() {
    if (password !== passwordConfirm) {
      setError(t.mismatch);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/intranet/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: initialEmail || email,
          token: initialToken,
          password,
          locale: key,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.message || t.genericError);
        return;
      }
      setMode('done');
    } catch {
      setError(t.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <RuralCommerceHeader />
      <main className="flex flex-1 flex-col">
        <section id="hero" className="relative overflow-hidden bg-[#071F5E] pb-28 pt-28 text-white sm:pb-32 sm:pt-32">
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">{t.eyebrow}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {mode === 'done' ? t.successTitle : mode === 'reset' ? t.resetTitle : t.requestTitle}
            </h1>
          </div>
        </section>

        <section className="relative z-10 -mt-20 flex flex-1 justify-center px-4 pb-16 sm:-mt-24 sm:px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(7,31,94,0.18)] sm:p-8">
            {mode === 'request' ? (
              <>
                <p className="text-sm leading-6 text-[#1E1E1E]/70">{t.requestText}</p>
                <label className="mt-5 block text-sm font-semibold text-[#071F5E]">
                  {t.emailLabel}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    autoComplete="email"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void requestReset()}
                  disabled={loading || !email.trim()}
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#071F5E] text-sm font-bold text-white disabled:opacity-60"
                >
                  {loading ? t.sending : t.sendLink}
                </button>
              </>
            ) : null}

            {mode === 'sent' ? <p className="text-sm leading-6 text-[#1E1E1E]/70">{t.sentText}</p> : null}

            {mode === 'reset' ? (
              <>
                <p className="text-sm leading-6 text-[#1E1E1E]/70">{t.resetText}</p>
                <label className="mt-5 block text-sm font-semibold text-[#071F5E]">
                  {t.passwordLabel}
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    className={inputCls}
                    autoComplete="new-password"
                  />
                </label>
                <label className="mt-4 block text-sm font-semibold text-[#071F5E]">
                  {t.passwordConfirmLabel}
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    minLength={6}
                    className={inputCls}
                    autoComplete="new-password"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void savePassword()}
                  disabled={loading || password.length < 6}
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#071F5E] text-sm font-bold text-white disabled:opacity-60"
                >
                  {loading ? t.saving : t.save}
                </button>
              </>
            ) : null}

            {mode === 'done' ? (
              <>
                <p className="text-sm leading-6 text-[#1E1E1E]/70">{t.successText}</p>
                <Link
                  href={loginHref}
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#009179] text-sm font-bold text-white"
                >
                  {t.goLogin}
                </Link>
              </>
            ) : null}

            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

            {mode !== 'done' ? (
              <Link href={loginHref} className="mt-4 block text-center text-sm font-semibold text-[#009179]">
                {t.backLogin}
              </Link>
            ) : null}
          </div>
        </section>
      </main>
      <RuralCommerceFooter locale={locale} />
    </div>
  );
}
