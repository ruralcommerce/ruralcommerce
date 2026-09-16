import type { Metadata } from 'next';
import { PlantaCroquis } from '@/components/planta/PlantaCroquis';
import { getPlantaPageCopy } from '@/lib/planta-guide';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = getPlantaPageCopy(params.locale);
  return { title: t.croquisTitle, description: t.croquisLead };
}

export default function PlantaCroquisPage({ params }: { params: { locale: string } }) {
  const t = getPlantaPageCopy(params.locale);
  return (
    <article>
      <p className="planta-kicker">{t.homeEyebrow}</p>
      <h1 className="planta-title">{t.croquisTitle}</h1>
      <p className="planta-lead">{t.croquisLead}</p>
      <div className="mt-6">
        <PlantaCroquis locale={params.locale} />
      </div>
    </article>
  );
}
