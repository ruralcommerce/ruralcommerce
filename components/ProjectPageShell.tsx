import type { ReactNode } from 'react';
import { ProjectSiteHeader } from '@/components/ProjectSiteHeader';

export function ProjectPageShell({
  locale,
  children,
  fullViewport = false,
  contentClassName,
}: {
  locale: string;
  children: ReactNode;
  fullViewport?: boolean;
  contentClassName?: string;
}) {
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
              : 'w-full py-8 sm:py-10'
          }
        >
          <div
            className={
              contentClassName ||
              'mx-auto flex h-full w-full max-w-5xl flex-col px-4 sm:px-6 lg:px-8'
            }
          >
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
