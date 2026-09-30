import type { IntranetTool } from './types';

/** Tools shown in /intranet/herramientas — expand as modules grow */
export function intranetTools(locale: string): IntranetTool[] {
  return [
    {
      id: 'marca',
      title: 'Construcción de marcas',
      description:
        'Oficinas de briefing visual, catálogo con tags invisibles y perfil visual del negocio.',
      href: `/${locale}/intranet/herramientas/marca`,
      permission: 'tools.marca',
      image: '/images/Mercado artesanal com loja acolhedora.png',
      accent: '#009179',
    },
    {
      id: 'sementes',
      title: 'Sementes da inovação',
      description: 'Dinámica de ideas, cartas y mesa para innovar con productores y equipos.',
      href: `/${locale}/sementes`,
      permission: 'tools.sementes',
      image: '/images/Reunião casual ao ar livre.png',
      accent: '#071F5E',
    },
  ];
}
