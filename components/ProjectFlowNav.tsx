import Link from 'next/link';

type LocaleKey = 'es' | 'pt-BR' | 'en';
type PageKey = 'projeto' | 'inscricao' | 'convenio' | 'diagnostico' | 'perfil' | 'admin';

const copy: Record<LocaleKey, { title: string; labels: Record<PageKey, string> }> = {
  es: {
    title: 'Ruta del proyecto',
    labels: {
      projeto: 'Proyecto',
      inscricao: 'Inscripción',
      convenio: 'Convenio',
      diagnostico: 'Diagnóstico',
      perfil: 'Mi perfil',
      admin: 'Equipo',
    },
  },
  'pt-BR': {
    title: 'Caminho do projeto',
    labels: {
      projeto: 'Projeto',
      inscricao: 'Inscrição',
      convenio: 'Convênio',
      diagnostico: 'Diagnóstico',
      perfil: 'Meu perfil',
      admin: 'Equipe',
    },
  },
  en: {
    title: 'Project path',
    labels: {
      projeto: 'Project',
      inscricao: 'Application',
      convenio: 'Agreement',
      diagnostico: 'Diagnosis',
      perfil: 'My profile',
      admin: 'Team',
    },
  },
};

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

export function ProjectFlowNav({
  locale,
  currentPage,
  className,
}: {
  locale: string;
  currentPage: PageKey;
  className?: string;
}) {
  const localeKey = getLocaleKey(locale);
  const t = copy[localeKey];
  const base = `/${locale}`;
  const items: Array<{ key: PageKey; href: string }> = [
    { key: 'projeto', href: `${base}/projeto` },
    { key: 'inscricao', href: `${base}/projeto/inscricao` },
    { key: 'convenio', href: `${base}/projeto/convenio` },
    { key: 'diagnostico', href: `${base}/projeto/diagnostico` },
    { key: 'perfil', href: `${base}/perfil` },
    { key: 'admin', href: `${base}/admin` },
  ];

  return (
    <nav aria-label={t.title} className={`px-0.5 py-0.5 ${className || ''}`}>
      <div className="flex flex-wrap items-center gap-1 text-[11px] leading-none text-[#2F3336]/45">
        {items.map((item, index) => {
          const isActive = item.key === currentPage;
          return (
            <div key={item.key} className="inline-flex items-center gap-1">
              {index > 0 ? <span className="text-[#2F3336]/30">/</span> : null}
              <Link
                href={item.href}
                className={`transition ${isActive ? 'font-medium text-[#2F3336]/70 underline decoration-[#2F3336]/35 underline-offset-2' : 'hover:text-[#2F3336]/70'}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {t.labels[item.key]}
              </Link>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
