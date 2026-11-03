'use client';

import { ProjectAdminDashboard } from '@/components/ProjectAdminDashboard';
import { IntranetGate } from './IntranetGate';

export function IntranetProyectoPage({ locale }: { locale: string }) {
  return (
    <IntranetGate
      locale={locale}
      title="Proyecto"
      breadcrumb="Páginas / Proyecto"
      permission="projeto.access"
    >
      {() => (
        <div className="rounded-2xl bg-white p-3 shadow-sm sm:p-5">
          <ProjectAdminDashboard locale={locale} unifiedAuth />
        </div>
      )}
    </IntranetGate>
  );
}
