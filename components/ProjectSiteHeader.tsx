'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

type LocaleKey = 'es' | 'pt-BR' | 'en';

const RURAL_COMMERCE_HOME_LABEL = 'Rural Commerce';

const copy: Record<
  LocaleKey,
  { openMenu: string; closeMenu: string; homeAriaLabel: string; items: Array<{ href: string; label: string }> }
> = {
  es: {
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    homeAriaLabel: 'Rural Commerce - inicio',
    items: [
      { href: '/projeto', label: 'Proyecto' },
      { href: '/projeto/inscricao', label: 'Inscripción' },
      { href: '/projeto/convenio', label: 'Convenio' },
      { href: '/projeto/diagnostico', label: 'Diagnóstico' },
      { href: '/perfil', label: 'Perfil' },
      { href: '/admin', label: 'Equipo' },
    ],
  },
  'pt-BR': {
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    homeAriaLabel: 'Rural Commerce - início',
    items: [
      { href: '/projeto', label: 'Projeto' },
      { href: '/projeto/inscricao', label: 'Inscrição' },
      { href: '/projeto/convenio', label: 'Convênio' },
      { href: '/projeto/diagnostico', label: 'Diagnóstico' },
      { href: '/perfil', label: 'Perfil' },
      { href: '/admin', label: 'Equipe' },
    ],
  },
  en: {
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    homeAriaLabel: 'Rural Commerce - home',
    items: [
      { href: '/projeto', label: 'Project' },
      { href: '/projeto/inscricao', label: 'Application' },
      { href: '/projeto/convenio', label: 'Agreement' },
      { href: '/projeto/diagnostico', label: 'Diagnosis' },
      { href: '/perfil', label: 'Profile' },
      { href: '/admin', label: 'Team' },
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

export function ProjectSiteHeader({
  locale,
  variant = 'overlay',
}: {
  locale: string;
  variant?: 'overlay' | 'bar';
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const localeKey = getLocaleKey(locale);
  const t = copy[localeKey];
  const strippedPath = stripLocalePrefix(pathname);
  const homeHref = `/${locale}`;

  const items = useMemo(
    () => [
      { href: homeHref, label: RURAL_COMMERCE_HOME_LABEL, isHome: true as const },
      ...t.items.map((item) => ({ ...item, href: `${homeHref}${item.href}`, isHome: false as const })),
    ],
    [homeHref, t.items]
  );

  const isHomeActive = strippedPath === '/' || strippedPath === '';

  const isActive = (href: string, isHome: boolean) => {
    if (isHome) return isHomeActive;
    const path = href.replace(/^\/(es|pt-BR|en)/, '') || '/';
    if (path === '/projeto') {
      return strippedPath === '/projeto' || strippedPath === '/impulsacr';
    }
    return strippedPath === path || strippedPath.startsWith(`${path}/`);
  };

  return (
    <header className={`projeto-site-header${variant === 'bar' ? ' projeto-site-header--bar' : ''}`}>
      <div className="projeto-site-header-inner">
        <Link href={homeHref} aria-label={t.homeAriaLabel} className="inline-flex shrink-0 items-center">
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
              className={
                item.isHome
                  ? 'projeto-site-nav-btn'
                  : isActive(item.href, item.isHome)
                    ? 'opacity-100'
                    : undefined
              }
              aria-current={isActive(item.href, item.isHome) ? 'page' : undefined}
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
                className={
                  item.isHome
                    ? 'projeto-site-nav-btn px-3 py-2 text-sm'
                    : `rounded-lg px-2 py-2 text-sm ${isActive(item.href, item.isHome) ? 'opacity-100' : 'opacity-90'}`
                }
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
