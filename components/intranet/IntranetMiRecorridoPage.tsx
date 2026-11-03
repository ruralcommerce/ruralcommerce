'use client';

import { ProjectProfileDashboard } from '@/components/ProjectProfileDashboard';
import { IntranetGate } from './IntranetGate';

export function IntranetMiRecorridoPage({ locale }: { locale: string }) {
  return (
    <IntranetGate
      locale={locale}
      title="Mi recorrido"
      breadcrumb="Páginas / Mi recorrido"
      permission="benef.access"
    >
      {() => (
        <div className="rounded-2xl bg-white p-3 shadow-sm sm:p-5">
          <ProjectProfileDashboard locale={locale} unifiedAuth />
        </div>
      )}
    </IntranetGate>
  );
}
