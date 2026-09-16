import type { Metadata } from 'next';
import { getPlantaPageCopy, legalCards } from '@/lib/planta-guide';
import { getProjectLocaleKey } from '@/lib/project-locale';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = getPlantaPageCopy(params.locale);
  return { title: t.legalTitle, description: t.legalLead };
}

export default function PlantaLegalPage({ params }: { params: { locale: string } }) {
  const t = getPlantaPageCopy(params.locale);
  const cards = legalCards[getProjectLocaleKey(params.locale)];
  return (
    <article>
      <p className="planta-kicker">{t.homeEyebrow}</p>
      <h1 className="planta-title">{t.legalTitle}</h1>
      <p className="planta-lead">{t.legalLead}</p>
      <div className="planta-grid planta-grid-2">
        {cards.map((card) => (
          <section key={card.office} className="planta-card">
            <h3>{card.office}</h3>
            <p>
              <strong>{card.what}</strong>
            </p>
            <p>{card.how}</p>
            <p className="planta-legal-ref">{card.refs}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
