/** Official project name used in agreements, notifications and broadcasts. */
export const PROJECT_NAME = 'Impulso MiPyMEs: digitaliza Los Santos';

export const PROJECT_EXECUTOR = 'Rural Commerce';

export const PROJECT_NAME_SHORT = 'Impulso MiPyMEs';

/** Public paths (under /public). Use absoluteProjectAsset() in emails. */
export const PROJECT_LOGO_PATH = '/images/projeto/im-los-santos-logo-azul.png';
export const RURAL_COMMERCE_LOGO_PATH = '/images/logo.png';
export const RURAL_COMMERCE_LOGO_WHITE_PATH = '/images/logo-branco.png';
export const RURAL_COMMERCE_TAGLINE = 'INTELIGENCIA SISTÉMICA PARA CADENAS REGENERATIVAS';

export function projectSiteBaseUrl() {
  return (process.env.PROJETO_SITE_URL?.trim() || 'https://ruralcommerceglobal.com').replace(/\/$/, '');
}

export function absoluteProjectAsset(assetPath: string) {
  const path = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${projectSiteBaseUrl()}${path}`;
}
