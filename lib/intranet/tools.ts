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
      image: '/images/intranet/marca.png',
      accent: '#009179',
    },
    {
      id: 'sementes',
      title: 'Sementes da inovação',
      description: 'Dinámica de ideas, cartas y mesa para innovar con productores y equipos.',
      href: `/${locale}/sementes`,
      permission: 'tools.sementes',
      image: '/images/intranet/sementes.png',
      accent: '#071F5E',
    },
    {
      id: 'actividades',
      title: 'Actividades de campo',
      description:
        'Capacitaciones y visitas. Convite para quien no está en el sistema y confirmación de presencia desde el celular de la persona.',
      href: `/${locale}/intranet/herramientas/actividades`,
      permission: 'tools.actividades',
      image: '/images/intranet/actividades.png',
      accent: '#009179',
    },
  ];
}
