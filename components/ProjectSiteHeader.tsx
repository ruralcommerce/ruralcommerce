'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { PROJECT_LOGO_PATH, PROJECT_NAME, RURAL_COMMERCE_LOGO_WHITE_PATH } from '@/lib/project-brand';
import type { ProjectNavPage } from '@/lib/project-nav';

type LocaleKey = 'es' | 'pt-BR' | 'en';

const RURAL_COMMERCE_HOME_LABEL = 'Rural Commerce';

const copy: Record<
  LocaleKey,
  {
    openMenu: string;
    closeMenu: string;
    homeAriaLabel: string;
    projectLabel: string;
    profileMenu: string;
    intranet: string;
    profileItems: Array<{ href: string; label: string; page: ProjectNavPage }>;
  }
> = {
  es: {
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    homeAriaLabel: 'Rural Commerce - inicio',
    projectLabel: 'Proyecto',
    profileMenu: 'Mi perfil',
    intranet: 'Intranet',
    profileItems: [
      { href: '/projeto/inscricao', label: 'Inscripción', page: 'inscricao' },
      { href: '/projeto/convenio', label: 'Convenio', page: 'convenio' },
      { href: '/projeto/diagnostico', label: 'Diagnóstico', page: 'diagnostico' },
      { href: '/perfil', label: 'Mi perfil', page: 'perfil' },
    ],
  },
  'pt-BR': {
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    homeAriaLabel: 'Rural Commerce - início',
    projectLabel: 'Projeto',
    profileMenu: 'Meu perfil',
    intranet: 'Intranet',
    profileItems: [
      { href: '/projeto/inscricao', label: 'Inscrição', page: 'inscricao' },
      { href: '/projeto/convenio', label: 'Convênio', page: 'convenio' },
      { href: '/projeto/diagnostico', label: 'Diagnóstico', page: 'diagnostico' },
      { href: '/perfil', label: 'Meu perfil', page: 'perfil' },
    ],
  },
  en: {
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    homeAriaLabel: 'Rural Commerce - home',
    projectLabel: 'Project',
    profileMenu: 'My profile',
    intranet: 'Intranet',
    profileItems: [
      { href: '/projeto/inscricao', label: 'Application', page: 'inscricao' },
      { href: '/projeto/convenio', label: 'Agreement', page: 'convenio' },
      { href: '/projeto/diagnostico', label: 'Diagnosis', page: 'diagnostico' },
      { href: '/perfil', label: 'My profile', page: 'perfil' },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const localeKey = getLocaleKey(locale);
  const t = copy[localeKey];
  const strippedPath = stripLocalePrefix(pathname);
  const homeHref = `/${locale}`;
  const projectHref = `${homeHref}/projeto`;
  const intranetHref = `${homeHref}/admin`;

  const profileItems = useMemo(
    () => t.profileItems.map((item) => ({ ...item, href: `${homeHref}${item.href}` })),
    [homeHref, t.profileItems]
  );

  const isHomeActive = strippedPath === '/' || strippedPath === '';
  const isProjectActive = strippedPath === '/projeto' || strippedPath === '/impulsacr';
  const isIntranetActive = strippedPath === '/admin' || strippedPath.startsWith('/admin/');
  const isProfileSectionActive = profileItems.some(
    (item) => strippedPath === item.href.replace(homeHref, '') || strippedPath.startsWith(`${item.href.replace(homeHref, '')}/`)
  );

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className={`projeto-site-header${variant === 'bar' ? ' projeto-site-header--bar' : ''}`}>
      <div className="projeto-site-header-inner">
        <div className="projeto-site-header-brands">
          <Link href={homeHref} aria-label={t.homeAriaLabel} className="inline-flex shrink-0 items-center">
            <Image
              src={RURAL_COMMERCE_LOGO_WHITE_PATH}
              alt="Rural Commerce"
              width={168}
              height={48}
              className="projeto-site-header-logo"
              priority
            />
          </Link>
          <span className="projeto-site-header-brand-divider" aria-hidden />
          <Link href={projectHref} aria-label={PROJECT_NAME} className="projeto-site-header-project-logo-wrap">
            <Image
              src={PROJECT_LOGO_PATH}
              alt={PROJECT_NAME}
              width={112}
              height={112}
              className="projeto-site-header-project-logo"
              priority
            />
          </Link>
        </div>

        <nav className="projeto-site-nav" aria-label="Navegación principal">
          <Link
            href={homeHref}
            className="projeto-site-nav-btn"
            aria-current={isHomeActive ? 'page' : undefined}
          >
            {RURAL_COMMERCE_HOME_LABEL}
          </Link>

          <Link
            href={projectHref}
            className={isProjectActive ? 'opacity-100' : undefined}
            aria-current={isProjectActive ? 'page' : undefined}
          >
            {t.projectLabel}
          </Link>

          <div className="projeto-site-dropdown" ref={profileRef}>
            <button
              type="button"
              className={`projeto-site-dropdown-trigger${isProfileSectionActive ? ' is-active' : ''}`}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              onClick={() => setProfileOpen((value) => !value)}
            >
              {t.profileMenu}
              <ChevronDown size={14} className={profileOpen ? 'rotate-180 transition' : 'transition'} />
            </button>
            {profileOpen ? (
              <div className="projeto-site-dropdown-menu" role="menu">
                {profileItems.map((item) => {
                  const path = item.href.replace(homeHref, '') || '/';
                  const active = strippedPath === path || strippedPath.startsWith(`${path}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      className={active ? 'is-active' : undefined}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setProfileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          <Link
            href={intranetHref}
            className={`projeto-site-nav-intranet${isIntranetActive ? ' is-active' : ''}`}
            aria-current={isIntranetActive ? 'page' : undefined}
          >
            {t.intranet}
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex rounded-lg p-2 text-white lg:hidden"
          aria-label={mobileOpen ? t.closeMenu : t.openMenu}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="projeto-site-header-inner lg:hidden">
          <nav className="projeto-site-nav-mobile w-full" aria-label="Navegación principal">
            <Link href={homeHref} className="projeto-site-nav-btn px-3 py-2 text-sm" onClick={() => setMobileOpen(false)}>
              {RURAL_COMMERCE_HOME_LABEL}
            </Link>
            <Link
              href={projectHref}
              className={`rounded-lg px-2 py-2 text-sm ${isProjectActive ? 'opacity-100' : 'opacity-90'}`}
              onClick={() => setMobileOpen(false)}
            >
              {t.projectLabel}
            </Link>
            <p className="px-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
              {t.profileMenu}
            </p>
            {profileItems.map((item) => {
              const path = item.href.replace(homeHref, '') || '/';
              const active = strippedPath === path || strippedPath.startsWith(`${path}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-2 py-2 text-sm ${active ? 'opacity-100' : 'opacity-90'}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href={intranetHref}
              className="projeto-site-nav-intranet mt-2 inline-flex w-fit px-3 py-2 text-sm"
              onClick={() => setMobileOpen(false)}
            >
              {t.intranet}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
