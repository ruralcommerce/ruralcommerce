import type { Metadata } from 'next';
import Link from 'next/link';
import { getPlantaPageCopy, plantaPath } from '@/lib/planta-guide';
import { getProjectLocaleKey } from '@/lib/project-locale';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = getPlantaPageCopy(params.locale);
  return { title: t.homeTitle, description: t.homeLead };
}

export default function PlantaHomePage({ params }: { params: { locale: string } }) {
  const t = getPlantaPageCopy(params.locale);
  const locale = getProjectLocaleKey(params.locale);

  return (
    <article>
      <p className="planta-kicker">{t.homeEyebrow}</p>
      <h1 className="planta-title">{t.homeTitle}</h1>
      <p className="planta-lead">{t.homeLead}</p>
      <div className="planta-callout">
        <h2>{t.homeUrgentTitle}</h2>
        <p>{t.homeUrgentBody}</p>
        <Link
          href={plantaPath(locale, 'obra')}
          className="mt-4 inline-flex rounded-full bg-[#52ADAD] px-5 py-2.5 text-sm font-semibold text-[#071F5E]"
        >
          {locale === 'pt-BR' ? 'Abrir lista de obra' : locale === 'en' ? 'Open works list' : 'Abrir lista de obra'}
        </Link>
      </div>
    </article>
  );
}
