import type { MarcaImage } from './types';

/**
 * Seed inicial do catálogo. Em runtime o catálogo vive em data/marca-catalog.json
 * e a equipe pode subir imagens do Drive / próprias na intranet.
 */
export const MARCA_SEED_CATALOG: MarcaImage[] = [
  {
    id: 'img-rustico-mercado',
    src: '/images/Mercado rústico com toque acolhedor.png',
    alt: 'Mercado rústico',
    tags: ['rústico', 'artesanal', 'natural', 'tons terrosos', 'texturas'],
    moodColor: '#8B6914',
    active: true,
  },
  {
    id: 'img-artesanal-loja',
    src: '/images/Mercado artesanal com loja acolhedora.png',
    alt: 'Loja artesanal',
    tags: ['artesanal', 'acolhedor', 'premium suave', 'texturas'],
    moodColor: '#C4A574',
    active: true,
  },
  {
    id: 'img-campo-sol',
    src: '/images/Trabalho no campo ao pôr do sol.png',
    alt: 'Campo ao pôr do sol',
    tags: ['natural', 'tropical', 'cores vivas', 'rural'],
    moodColor: '#E07A3D',
    active: true,
  },
  {
    id: 'img-cena-rural',
    src: '/images/Cenário rural de agricultura sustentável.png',
    alt: 'Paisagem rural',
    tags: ['natural', 'sóbrio', 'sustentável', 'verde'],
    moodColor: '#4C7B5B',
    active: true,
  },
  {
    id: 'img-agri-inteligente',
    src: '/images/Agricultura inteligente ao entardecer.png',
    alt: 'Agricultura ao entardecer',
    tags: ['moderno', 'tecnologia', 'sóbrio', 'premium'],
    moodColor: '#2F4A6E',
    active: true,
  },
  {
    id: 'img-consulta-campo',
    src: '/images/Consultoria agrícola em campo verde.png',
    alt: 'Campo verde',
    tags: ['natural', 'verde', 'limpo', 'profissional'],
    moodColor: '#1D6359',
    active: true,
  },
  {
    id: 'img-inspecao',
    src: '/images/Inspeção agrícola ao entardecer.png',
    alt: 'Inspeção no campo',
    tags: ['sóbrio', 'profissional', 'tons escuros'],
    moodColor: '#3D2B1F',
    active: true,
  },
  {
    id: 'img-reuniao',
    src: '/images/Reunião casual ao ar livre.png',
    alt: 'Reunião ao ar livre',
    tags: ['humano', 'acolhedor', 'natural', 'leve'],
    moodColor: '#A8C5A0',
    active: true,
  },
  {
    id: 'img-vendas',
    src: '/images/Contabilizando vendas e gastos diários.png',
    alt: 'Gestão e vendas',
    tags: ['limpo', 'minimalista', 'profissional', 'embalagem limpa'],
    moodColor: '#EEF3F7',
    active: true,
  },
  {
    id: 'img-cor-terroso',
    src: '',
    alt: 'Paleta terrosa',
    tags: ['tons terrosos', 'rústico', 'natural'],
    moodColor: '#6B4F3A',
    active: true,
  },
  {
    id: 'img-cor-vibrante',
    src: '',
    alt: 'Paleta vibrante',
    tags: ['vibrante', 'cores vivas', 'tropical'],
    moodColor: '#E85D04',
    active: true,
  },
  {
    id: 'img-cor-sobrio',
    src: '',
    alt: 'Paleta sóbria',
    tags: ['sóbrio', 'minimalista', 'tons escuros'],
    moodColor: '#1E1E1E',
    active: true,
  },
  {
    id: 'img-cor-premium',
    src: '',
    alt: 'Paleta premium',
    tags: ['premium', 'embalagem limpa', 'minimalista'],
    moodColor: '#0A0A0A',
    active: true,
  },
  {
    id: 'img-cor-tropical',
    src: '',
    alt: 'Paleta tropical',
    tags: ['tropical', 'natural', 'cores vivas', 'verde'],
    moodColor: '#009179',
    active: true,
  },
  {
    id: 'img-cor-papel',
    src: '',
    alt: 'Fundo claro limpo',
    tags: ['limpo', 'embalagem limpa', 'minimalista'],
    moodColor: '#F7F4EF',
    active: true,
  },
];

/** Tags sugeridas na intranet (equipe pode escrever outras). */
export const MARCA_SUGGESTED_TAGS = [
  'tons terrosos',
  'vibrante',
  'sóbrio',
  'premium',
  'rústico',
  'artesanal',
  'natural',
  'tropical',
  'cores vivas',
  'texturas',
  'minimalista',
  'tons escuros',
  'embalagem limpa',
  'moderno',
  'acolhedor',
  'verde',
  'humano',
  'limpo',
  'profissional',
  'rural',
];

export function stripTagsForPublic(images: MarcaImage[]) {
  return images.map(({ id, src, alt, moodColor }) => ({ id, src, alt, moodColor }));
}

export function filterCatalogByIds(catalog: MarcaImage[], ids?: string[]): MarcaImage[] {
  const active = catalog.filter((img) => img.active !== false);
  if (!ids || ids.length === 0) return active;
  const map = new Map(catalog.map((item) => [item.id, item]));
  return ids.map((id) => map.get(id)).filter((img): img is MarcaImage => Boolean(img) && img.active !== false);
}
