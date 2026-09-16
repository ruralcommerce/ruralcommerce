import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProjectPageShell } from '@/components/ProjectPageShell';
import { PlantaConviteForm } from '@/components/planta/PlantaConviteForm';
import '@/components/planta/planta.css';
import { getPlantaPageCopy } from '@/lib/planta-guide';
import { PLANTA_COOKIE, verifyPlantaSession } from '@/lib/planta-session';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = getPlantaPageCopy(params.locale);
  return { title: t.conviteTitle, description: t.conviteLead };
}

export default function PlantaConvitePage({ params }: { params: { locale: string } }) {
  const session = verifyPlantaSession(cookies().get(PLANTA_COOKIE)?.value);
  if (session) {
    redirect(`/${params.locale}/impulsacr/planta`);
  }

  const t = getPlantaPageCopy(params.locale);

  return (
    <ProjectPageShell locale={params.locale} currentPage="planta" showPageTitle={false}>
      <div className="planta-page rounded-3xl border border-[#E6EBF1] bg-white p-6 shadow-sm sm:p-10">
        <p className="planta-kicker">{t.conviteEyebrow}</p>
        <h1 className="planta-title">{t.conviteTitle}</h1>
        <p className="planta-lead">{t.conviteLead}</p>
        <Suspense>
          <PlantaConviteForm locale={params.locale} />
        </Suspense>
      </div>
    </ProjectPageShell>
  );
}
