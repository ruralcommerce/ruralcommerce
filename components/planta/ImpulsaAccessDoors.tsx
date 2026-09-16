'use client';

import Link from 'next/link';
import { accessDoorsCopy } from '@/lib/planta-guide';
import { ProjectLandingReveal } from '@/components/ProjectLandingReveal';
import './planta.css';

export function ImpulsaAccessDoors({ locale }: { locale: string }) {
  const key = locale === 'pt-BR' || locale === 'en' ? locale : 'es';
  const t = accessDoorsCopy[key];
  const doors = [
    {
      href: `/${locale}/perfil`,
      title: t.beneficiariosTitle,
      body: t.beneficiariosBody,
      cta: t.beneficiariosCta,
      index: '01',
      restricted: false,
    },
    {
      href: `/${locale}/admin`,
      title: t.intranetTitle,
      body: t.intranetBody,
      cta: t.intranetCta,
      index: '02',
      restricted: false,
    },
    {
      href: `/${locale}/impulsacr/convite`,
      title: t.plantaTitle,
      body: t.plantaBody,
      cta: t.plantaCta,
      index: '03',
      restricted: true,
    },
  ];

  return (
    <section className="planta-doors" id="accesos">
      <div className="projeto-container">
        <ProjectLandingReveal className="projeto-text-stack">
          <span className="planta-kicker">{t.eyebrow}</span>
          <h2 className="planta-title" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
            {t.title}
          </h2>
          <p className="planta-lead">{t.lead}</p>
        </ProjectLandingReveal>
        <div className="planta-doors-grid mt-8">
          {doors.map((door, index) => (
            <ProjectLandingReveal key={door.href} delayMs={index * 60}>
              <Link href={door.href} className={`planta-door${door.restricted ? ' is-restricted' : ''}`}>
                <p className="planta-door-index">{door.index}</p>
                <h3>{door.title}</h3>
                <p>{door.body}</p>
                <span>{door.cta} →</span>
              </Link>
            </ProjectLandingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
