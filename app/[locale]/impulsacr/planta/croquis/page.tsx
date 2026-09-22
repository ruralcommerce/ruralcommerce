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
      <header className="planta-croquis-head">
        <h1 className="planta-title planta-title--compact">{chrome.title}</h1>
        <p className="planta-kicker planta-kicker--inline">{chrome.kicker}</p>
      </header>
      {chrome.lead ? <p className="planta-lead planta-lead--wide">{chrome.lead}</p> : null}
      <div className="mt-4">
        <PlantaPlanos locale={params.locale} />
      </div>
    </article>
  );
}
