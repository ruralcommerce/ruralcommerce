export type ProjectNavPage =
  | 'projeto'
  | 'inscricao'
  | 'convenio'
  | 'diagnostico'
  | 'inversiones'
  | 'perfil'
  | 'admin'
  | 'recuperar-senha';

type LocaleKey = 'es' | 'pt-BR' | 'en';

const pageTitles: Record<LocaleKey, Record<ProjectNavPage, string>> = {
  es: {
    projeto: 'Proyecto',
    inscricao: 'Inscripción',
    convenio: 'Convenio',
    diagnostico: 'Diagnóstico',
    inversiones: 'Mis compras',
    perfil: 'Mi perfil',
    admin: 'Intranet',
    'recuperar-senha': 'Restablecer contraseña',
  },
  'pt-BR': {
    projeto: 'Projeto',
    inscricao: 'Inscrição',
    convenio: 'Convênio',
    diagnostico: 'Diagnóstico',
    inversiones: 'Minhas compras',
    perfil: 'Meu perfil',
    admin: 'Intranet',
    'recuperar-senha': 'Redefinir senha',
  },
  en: {
    projeto: 'Project',
    inscricao: 'Application',
    convenio: 'Agreement',
    diagnostico: 'Diagnosis',
    inversiones: 'My purchases',
    perfil: 'My profile',
    admin: 'Intranet',
    'recuperar-senha': 'Reset password',
  },
};

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

export function getProjectPageTitle(locale: string, page: ProjectNavPage) {
  return pageTitles[getLocaleKey(locale)][page];
}
