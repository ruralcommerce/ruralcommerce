'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

type LocaleKey = 'es' | 'pt-BR' | 'en';

type ProjectSiteHeaderProps = {
  locale: string;
};

const copy: Record<LocaleKey, { openMenu: string; closeMenu: string; items: Array<{ href: string; label: string }> }> = {
  es: {
    openMenu: 'Abrir menu',
    closeMenu: 'Cerrar menu',
    items: [
      { href: '/projeto', label: 'Proyecto' },
      { href: '/projeto/inscricao', label: 'Inscripción' },
      { href: '/projeto/diagnostico', label: 'Diagnóstico' },
      { href: '/perfil', label: 'Perfil' },
    ],
  },
  'pt-BR': {
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    items: [
      { href: '/projeto', label: 'Projeto' },
      { href: '/projeto/inscricao', label: 'Inscrição' },
      { href: '/projeto/diagnostico', label: 'Diagnóstico' },
      { href: '/perfil', label: 'Perfil' },
    ],
  },
  en: {
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    items: [
      { href: '/projeto', label: 'Project' },
      { href: '/projeto/inscricao', label: 'Application' },
      { href: '/projeto/diagnostico', label: 'Diagnosis' },
      { href: '/perfil', label: 'Profile' },
    ],
  },
};

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

function stripLocalePrefix(pathname: string): string {
  const stripped = pathname.replace(/^\/(es|pt-BR|en)(?=\/|$)/, '');
  return stripped.length > 0 ? stripped : '/';
}

export function ProjectSiteHeader({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const localeKey = getLocaleKey(locale);
  const t = copy[localeKey];
  const strippedPath = stripLocalePrefix(pathname);
  const base = `/${locale}`;

  const items = useMemo(
    () => t.items.map((item) => ({ ...item, href: `${base}${item.href}` })),
    [base, t.items]
  );

  const isActive = (href: string) =>
    strippedPath === href.replace(/^\/(es|pt-BR|en)/, '') ||
    strippedPath.startsWith(`${href.replace(/^\/(es|pt-BR|en)/, '')}/`);

  return (
    <header className="projeto-site-header">
      <div className="projeto-site-header-inner">
        <Link href={base} aria-label="Rural Commerce" className="inline-flex shrink-0 items-center">
          <Image
            src="/images/logo-branco.png"
            alt="Rural Commerce"
            width={168}
            height={48}
            className="projeto-site-header-logo"
            priority
          />
        </Link>

        <nav className="projeto-site-nav" aria-label="Navegación principal">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? 'opacity-100' : undefined}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex rounded-lg p-2 text-white lg:hidden"
          aria-label={open ? t.closeMenu : t.openMenu}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div className="projeto-site-header-inner lg:hidden">
          <nav className="projeto-site-nav-mobile w-full" aria-label="Navegación principal">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-2 py-2 text-sm ${isActive(item.href) ? 'opacity-100' : 'opacity-90'}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
