import type { Metadata } from 'next';
import { equipoCards, getPlantaPageCopy } from '@/lib/planta-guide';
import { getProjectLocaleKey } from '@/lib/project-locale';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = getPlantaPageCopy(params.locale);
  return { title: t.equiposTitle, description: t.equiposLead };
}

export default function PlantaEquiposPage({ params }: { params: { locale: string } }) {
  const t = getPlantaPageCopy(params.locale);
  const cards = equipoCards[getProjectLocaleKey(params.locale)];
  return (
    <article>
      <p className="planta-kicker">{t.homeEyebrow}</p>
      <h1 className="planta-title">{t.equiposTitle}</h1>
      <p className="planta-lead">{t.equiposLead}</p>
      <div className="planta-grid planta-grid-2">
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
