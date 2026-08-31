import type { ReactNode } from 'react';
import { ProjectSiteHeader } from '@/components/ProjectSiteHeader';
import { getProjectPageTitle, type ProjectNavPage } from '@/lib/project-nav';

export function ProjectPageShell({
  locale,
  currentPage,
  children,
  fullViewport = false,
  contentClassName,
}: {
  locale: string;
  currentPage: ProjectNavPage;
  children: ReactNode;
  fullViewport?: boolean;
  contentClassName?: string;
}) {
  const pageTitle = getProjectPageTitle(locale, currentPage);

  return (
    <div
      className={
        fullViewport
          ? 'flex h-dvh flex-col overflow-hidden bg-white'
          : 'flex min-h-dvh flex-col bg-[#F5F7FA]'
      }
    >
      <ProjectSiteHeader locale={locale} variant="bar" />
      <main className={fullViewport ? 'flex min-h-0 flex-1 overflow-hidden' : 'flex flex-1'}>
        <section
          className={
            fullViewport
              ? 'flex h-full w-full items-stretch pb-1 sm:pb-2 lg:pb-3'
              : 'w-full py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:py-8 sm:pb-10'
          }
        >
          <div
            className={
              contentClassName ||
              'mx-auto flex h-full w-full max-w-5xl flex-col px-3 sm:px-6 lg:px-8'
            }
          >
            <p className="mb-2 px-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1D6359]">
              {pageTitle}
            </p>
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
