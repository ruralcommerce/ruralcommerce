'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RuralCommerceHeader } from '@/components/RuralCommerceHeader';
import { RuralCommerceFooter } from '@/components/RuralCommerceFooter';

export function IntranetLogin({ locale }: { locale: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const copy =
    locale === 'pt-BR'
      ? {
          welcome: 'Bem-vindo!',
          lead: 'Entre na intranet Rural Commerce para gerir usuários, permissões e ferramentas internas.',
          title: 'Acesso da equipe',
          email: 'Email',
          emailPh: 'seu@email.com',
          password: 'Senha',
          passwordPh: 'Sua senha',
          remember: 'Lembrar-me',
          submit: 'Entrar',
          hint: 'Acesso restrito à equipe Rural Commerce.',
        }
      : locale === 'en'
        ? {
            welcome: 'Welcome!',
            lead: 'Sign in to the Rural Commerce intranet to manage users, permissions and internal tools.',
            title: 'Team access',
            email: 'Email',
            emailPh: 'you@email.com',
            password: 'Password',
            passwordPh: 'Your password',
            remember: 'Remember me',
            submit: 'Sign in',
            hint: 'Restricted to the Rural Commerce team.',
          }
        : {
            welcome: '¡Bienvenido!',
            lead: 'Entra a la intranet Rural Commerce para gestionar usuarios, permisos y herramientas internas.',
            title: 'Acceso del equipo',
            email: 'Correo',
            emailPh: 'tu@email.com',
            password: 'Contraseña',
            passwordPh: 'Tu contraseña',
            remember: 'Recordarme',
            submit: 'Entrar',
            hint: 'Acceso restringido al equipo Rural Commerce.',
          };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/intranet/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || 'No se pudo entrar');
        return;
      }
      router.replace(`/${locale}/intranet/dashboard`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <RuralCommerceHeader />

      <main className="flex flex-1 flex-col">
        <section id="hero" className="relative overflow-hidden bg-[#071F5E] pb-28 pt-28 text-white sm:pb-32 sm:pt-32">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-50"
            viewBox="0 0 1200 420"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M0 80 C180 20 320 140 480 70 S820 0 1200 90" fill="none" stroke="#A5D9EF" strokeWidth="1.4" />
            <path d="M0 340 C220 280 400 380 600 300 S980 220 1200 320" fill="none" stroke="#52ADAD" strokeWidth="1.2" />
            <path d="M0 200 C260 160 420 240 640 180 S1000 100 1200 190" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.35" />
          </svg>
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{copy.welcome}</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">{copy.lead}</p>
          </div>
        </section>

        <section className="relative z-10 -mt-20 flex flex-1 justify-center px-4 pb-16 sm:-mt-24 sm:px-6">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(7,31,94,0.18)] sm:p-8"
          >
            <h2 className="text-center text-lg font-bold text-[#071F5E]">{copy.title}</h2>
            <p className="mt-1 text-center text-xs text-[#1E1E1E]/55">{copy.hint}</p>

            <label className="mt-6 block text-sm font-semibold text-[#071F5E]">
              {copy.email}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={copy.emailPh}
                className="mt-2 min-h-11 w-full rounded-xl border border-[#071F5E]/15 bg-[#F7FAFC] px-4 text-sm outline-none transition focus:border-[#009179] focus:ring-2 focus:ring-[#009179]/20"
                autoComplete="username"
              />
            </label>

            <label className="mt-4 block text-sm font-semibold text-[#071F5E]">
              {copy.password}
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={copy.passwordPh}
                className="mt-2 min-h-11 w-full rounded-xl border border-[#071F5E]/15 bg-[#F7FAFC] px-4 text-sm outline-none transition focus:border-[#009179] focus:ring-2 focus:ring-[#009179]/20"
                autoComplete="current-password"
              />
            </label>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={remember}
                onClick={() => setRemember((v) => !v)}
                className={`relative h-6 w-11 rounded-full transition ${remember ? 'bg-[#071F5E]' : 'bg-[#D9E3EC]'}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                    remember ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
              <span className="text-sm text-[#071F5E]/80">{copy.remember}</span>
            </div>

            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={busy}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#071F5E] text-sm font-bold text-white transition hover:bg-[#0a2a7a] disabled:opacity-60"
            >
              {busy ? '…' : copy.submit}
            </button>
          </form>
        </section>
      </main>

      <RuralCommerceFooter locale={locale} />
    </div>
  );
}
