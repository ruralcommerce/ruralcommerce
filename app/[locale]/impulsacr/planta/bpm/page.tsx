import type { Metadata } from 'next';
import { bpmCards, getPlantaPageCopy } from '@/lib/planta-guide';
import { getProjectLocaleKey } from '@/lib/project-locale';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = getPlantaPageCopy(params.locale);
  return { title: t.bpmTitle, description: t.bpmLead };
}

export default function PlantaBpmPage({ params }: { params: { locale: string } }) {
  const t = getPlantaPageCopy(params.locale);
  const cards = bpmCards[getProjectLocaleKey(params.locale)];
  return (
    <article>
      <h1 className="planta-title planta-title--page">{t.bpmTitle}</h1>
      <p className="planta-lead planta-lead--wide">{t.bpmLead}</p>
      <div className="planta-grid planta-grid-2 planta-grid-3">
        {cards.map((card) => (
          <section key={card.title} className="planta-card">
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
