import type { Metadata } from 'next';
import { PlantaChecklist } from '@/components/planta/PlantaChecklist';
import { getPlantaPageCopy } from '@/lib/planta-guide';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = getPlantaPageCopy(params.locale);
  return { title: t.obraTitle, description: t.obraLead };
}

export default function PlantaObraPage({ params }: { params: { locale: string } }) {
  const t = getPlantaPageCopy(params.locale);
  return (
    <article>
      <h1 className="planta-title planta-title--page">{t.obraTitle}</h1>
      <p className="planta-lead planta-lead--wide">{t.obraLead}</p>
      <div className="planta-obra-panel mt-5">
        <PlantaChecklist locale={params.locale} />
      </div>
    </article>
  );
}
