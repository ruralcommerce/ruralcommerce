'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ProjectSiteHeader } from '@/components/ProjectSiteHeader';
import {
  getPlantaNavLabel,
  getPlantaPageCopy,
  PLANTA_NAV_PAGES,
  plantaPath,
  type PlantaNavPage,
} from '@/lib/planta-guide';
import './planta.css';

function currentPlantPage(pathname: string): PlantaNavPage {
  const stripped = pathname.replace(/^\/(es|pt-BR|en)(?=\/|$)/, '');
  if (stripped.endsWith('/obra')) return 'obra';
  if (stripped.endsWith('/croquis')) return 'croquis';
  if (stripped.endsWith('/legal')) return 'legal';
  if (stripped.endsWith('/bpm')) return 'bpm';
  if (stripped.endsWith('/servicios')) return 'servicios';
  if (stripped.endsWith('/equipos')) return 'equipos';
  return 'inicio';
}

export function PlantaShell({
  locale,
  guestName,
  children,
}: {
  locale: string;
  guestName?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const t = getPlantaPageCopy(locale);
  const current = currentPlantPage(pathname);

  async function leave() {
    await fetch('/api/projeto/planta/session', { method: 'DELETE' });
    router.replace(`/${locale}/impulsacr`);
    router.refresh();
  }

  return (
    <div className="planta-page flex min-h-dvh flex-col bg-[#F5F7FA]">
      <ProjectSiteHeader locale={locale} variant="bar" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#2F3336]/75">
            {t.guest}
            {guestName ? (
              <>
                : <strong className="text-[#071F5E]">{guestName}</strong>
              </>
            ) : null}
          </p>
          <button
            type="button"
            onClick={() => void leave()}
            className="rounded-full border border-[#D9E3EC] bg-white px-4 py-2 text-sm font-semibold text-[#071F5E]"
          >
            {t.leave}
          </button>
        </div>
        <nav className="planta-subnav" aria-label="Guía de la planta">
          {PLANTA_NAV_PAGES.map((page) => (
            <Link
              key={page}
              href={plantaPath(locale, page)}
              className={current === page ? 'is-active' : undefined}
              aria-current={current === page ? 'page' : undefined}
            >
              {getPlantaNavLabel(locale, page)}
            </Link>
          ))}
        </nav>
        {children}
        <p className="mt-10 text-xs leading-5 text-[#2F3336]/60">{t.homeDisclaimer}</p>
      </main>
    </div>
  );
}
