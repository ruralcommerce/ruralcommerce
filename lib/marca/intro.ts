/** Abertura simples da oficina — linguagem humana, sem jargão de briefing. */

export type MarcaIntroCopy = {
  kicker: string;
  title: string;
  paragraphs: string[];
  bullets: string[];
  cta: string;
};

export const MARCA_INTRO: Record<'es' | 'pt-BR' | 'en', MarcaIntroCopy> = {
  es: {
    kicker: 'Antes de empezar',
    title: 'Una marca es cómo se siente lo que hacen',
    paragraphs: [
      'No es solo un logo. Es el conjunto de colores, formas, palabras e imágenes que hacen que alguien reconozca — y confíe — en lo que producen.',
      'En esta dinámica van a mirar imágenes y decir, con el estómago, si “combinan” o no con la marca que imaginan. No hay respuestas correctas.',
    ],
    bullets: [
      'Van a ver imágenes una por una',
      'Marcan: no combina · neutro · combina',
      'Después juntamos palabras propias del negocio',
      'Al final, el equipo arma un perfil visual con lo que eligieron',
    ],
    cta: 'Empezar con las imágenes',
  },
  'pt-BR': {
    kicker: 'Antes de começar',
    title: 'Uma marca é como se sente o que vocês fazem',
    paragraphs: [
      'Não é só um logo. É o conjunto de cores, formas, palavras e imagens que fazem alguém reconhecer — e confiar — no que produzem.',
      'Nesta dinâmica vocês vão olhar imagens e dizer, de barriga, se “combinam” ou não com a marca que imaginam. Não há respostas certas.',
    ],
    bullets: [
      'Vocês vão ver imagens uma a uma',
      'Marcam: não combina · neutro · combina',
      'Depois juntamos palavras só de vocês',
      'No fim, a equipe monta um perfil visual com o que escolheram',
    ],
    cta: 'Começar com as imagens',
  },
  en: {
    kicker: 'Before we start',
    title: 'A brand is how what you do feels',
    paragraphs: [
      'It is not just a logo. It is the colors, shapes, words and images that help people recognize — and trust — what you make.',
      'In this activity you will look at images and say, from the gut, whether they “fit” the brand you imagine. There are no right answers.',
    ],
    bullets: [
      'You will see images one by one',
      'Mark: does not fit · neutral · fits',
      'Then we gather words that are yours alone',
      'At the end, the team builds a visual profile from your choices',
    ],
    cta: 'Start with the images',
  },
};

export function getMarcaIntro(locale: string): MarcaIntroCopy {
  if (locale === 'pt-BR' || locale === 'en') return MARCA_INTRO[locale];
  return MARCA_INTRO.es;
}
