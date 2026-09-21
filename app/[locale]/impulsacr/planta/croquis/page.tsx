import type { Metadata } from 'next';
import { PlantaPlanos } from '@/components/planta/PlantaPlanos';
import { getPlantaPageCopy } from '@/lib/planta-guide';
import { getPlanoLocale, planoChrome } from '@/lib/planta-planos';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = getPlantaPageCopy(params.locale);
  const chrome = planoChrome[getPlanoLocale(params.locale)];
  return { title: chrome.title, description: t.croquisLead };
}

export default function PlantaCroquisPage({ params }: { params: { locale: string } }) {
  const chrome = planoChrome[getPlanoLocale(params.locale)];
  return (
    <article>
      <p className="planta-kicker">{chrome.kicker}</p>
      <h1 className="planta-title">{chrome.title}</h1>
      {chrome.lead ? <p className="planta-lead">{chrome.lead}</p> : null}
      <div className="mt-6">
        <PlantaPlanos locale={params.locale} />
      </div>
    </article>
  );
}
