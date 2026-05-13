import { getRequestConfig } from 'next-intl/server';

export const locales = ['es', 'pt-BR', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export default getRequestConfig(async ({ locale }) => {
  const validLocale = (locale && locales.includes(locale as Locale) ? locale : 'es') as Locale;
  
  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
    timeZone: 'America/Montevideo',
    now: new Date(),
  };
});
