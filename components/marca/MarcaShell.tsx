import Image from 'next/image';
import Link from 'next/link';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

export function MarcaShell({
  locale,
  children,
  eyebrow,
  title,
  subtitle,
  actions,
  staff,
}: {
  locale: string;
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  staff?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[var(--rc-bg)] text-[var(--rc-text)]">
      <header className="border-b border-[var(--rc-primary)]/10 bg-[var(--rc-primary)] text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href={`/${locale}`} className="inline-flex items-center gap-3">
            <Image
              src="/images/logo-branco.png"
              alt="Rural Commerce"
              width={160}
              height={44}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
            {staff ? <span>Intranet</span> : <span>Oficina de marca</span>}
            <Link href={`/${locale}`} className="text-white/80 transition hover:text-white">
              Sitio
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {(eyebrow || title || subtitle || actions) && (
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              {eyebrow ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--rc-accent)]">
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--rc-primary)] sm:text-4xl">
                  {title}
                </h1>
              ) : null}
              {subtitle ? <p className="mt-3 text-sm leading-6 text-[var(--rc-text)]/75">{subtitle}</p> : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

export function MarcaPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[var(--rc-primary)]/10 bg-[var(--rc-surface)] p-5 shadow-[0_12px_40px_rgba(7,31,94,0.06)] sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

export function MarcaButton({
  children,
  type = 'button',
  onClick,
  disabled,
  variant = 'primary',
  className = '',
}: {
  children: ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'dark';
  className?: string;
}) {
  const styles =
    variant === 'primary'
      ? 'bg-[var(--rc-accent)] text-white hover:bg-[#007d6b]'
      : variant === 'dark'
        ? 'bg-[var(--rc-primary)] text-white hover:bg-[#0a2a7a]'
        : 'border border-[var(--rc-primary)]/15 bg-white text-[var(--rc-primary)] hover:border-[var(--rc-accent)]';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function MarcaInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`min-h-11 w-full rounded-md border border-[var(--rc-primary)]/15 bg-white px-4 text-sm text-[var(--rc-text)] outline-none transition focus:border-[var(--rc-accent)] focus:ring-2 focus:ring-[var(--rc-accent)]/20 ${props.className || ''}`}
    />
  );
}

export function MarcaTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border border-[var(--rc-primary)]/15 bg-white px-4 py-3 text-sm text-[var(--rc-text)] outline-none transition focus:border-[var(--rc-accent)] focus:ring-2 focus:ring-[var(--rc-accent)]/20 ${props.className || ''}`}
    />
  );
}

export const marcaGhostLinkClass =
  'inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--rc-primary)]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[var(--rc-primary)] transition hover:border-[var(--rc-accent)]';
