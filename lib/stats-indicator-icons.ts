/**
 * Ícones e símbolos dos indicadores do carrossel (editor + site público).
 */

import {
  Award,
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  CircleDollarSign,
  CloudRain,
  Coins,
  Droplets,
  Factory,
  Flame,
  Globe2,
  GraduationCap,
  Handshake,
  Heart,
  Landmark,
  Leaf,
  Lightbulb,
  Link2,
  MapPin,
  Mountain,
  Network,
  Package,
  Percent,
  Recycle,
  Shield,
  Sprout,
  Star,
  Store,
  Sun,
  Target,
  Timer,
  Tractor,
  TrendingUp,
  TreePine,
  Truck,
  Users,
  Waves,
  Wheat,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export type StatIndicatorIconOption = {
  value: string;
  label: string;
};

export type StatIndicatorIconGroup = {
  id: string;
  label: string;
  options: StatIndicatorIconOption[];
};

/** Mapa chave → componente Lucide (chaves normalizadas: minúsculas, sem hífen). */
export const STAT_INDICATOR_LUCIDE_MAP: Record<string, LucideIcon> = {
  users: Users,
  droplets: Droplets,
  building2: Building2,
  leaf: Leaf,
  mappin: MapPin,
  sprout: Sprout,
  treepine: TreePine,
  wheat: Wheat,
  tractor: Tractor,
  factory: Factory,
  globe2: Globe2,
  heart: Heart,
  handshake: Handshake,
  trendingup: TrendingUp,
  barchart3: BarChart3,
  award: Award,
  target: Target,
  zap: Zap,
  sun: Sun,
  cloudrain: CloudRain,
  recycle: Recycle,
  package: Package,
  truck: Truck,
  store: Store,
  landmark: Landmark,
  circledollarsign: CircleDollarSign,
  coins: Coins,
  percent: Percent,
  timer: Timer,
  calendar: Calendar,
  shield: Shield,
  checkcircle: CheckCircle,
  star: Star,
  mountain: Mountain,
  waves: Waves,
  wind: Wind,
  flame: Flame,
  briefcase: Briefcase,
  graduationcap: GraduationCap,
  lightbulb: Lightbulb,
  network: Network,
  link2: Link2,
};

export const STAT_INDICATOR_ICON_GROUPS: StatIndicatorIconGroup[] = [
  {
    id: 'people',
    label: 'Pessoas e comunidade',
    options: [
      { value: 'users', label: 'Pessoas / equipa' },
      { value: 'handshake', label: 'Parceria' },
      { value: 'heart', label: 'Coração / impacto social' },
      { value: 'graduationCap', label: 'Formação' },
    ],
  },
  {
    id: 'nature',
    label: 'Natureza e agricultura',
    options: [
      { value: 'leaf', label: 'Folha / sustentabilidade' },
      { value: 'sprout', label: 'Brote / produtores' },
      { value: 'treePine', label: 'Árvore / floresta' },
      { value: 'wheat', label: 'Trigo / cultivo' },
      { value: 'tractor', label: 'Trator / campo' },
      { value: 'droplets', label: 'Água (gota)' },
      { value: 'waves', label: 'Água / ondas' },
      { value: 'cloudRain', label: 'Chuva / clima' },
      { value: 'sun', label: 'Sol / energia' },
      { value: 'wind', label: 'Vento' },
      { value: 'mountain', label: 'Montanha / território' },
      { value: 'recycle', label: 'Reciclagem / circular' },
    ],
  },
  {
    id: 'place',
    label: 'Território e logística',
    options: [
      { value: 'mapPin', label: 'Mapa / local' },
      { value: 'globe2', label: 'Globo / internacional' },
      { value: 'truck', label: 'Transporte' },
      { value: 'package', label: 'Embalagem / entrega' },
      { value: 'store', label: 'Loja / mercado' },
    ],
  },
  {
    id: 'business',
    label: 'Negócio e resultados',
    options: [
      { value: 'building2', label: 'Edifício / organização' },
      { value: 'factory', label: 'Indústria / fábrica' },
      { value: 'landmark', label: 'Instituição' },
      { value: 'briefcase', label: 'Negócio' },
      { value: 'trendingUp', label: 'Crescimento' },
      { value: 'barChart3', label: 'Gráfico' },
      { value: 'target', label: 'Objetivo' },
      { value: 'award', label: 'Prémio / reconhecimento' },
      { value: 'star', label: 'Estrela / destaque' },
      { value: 'circleDollarSign', label: 'Finanças' },
      { value: 'coins', label: 'Moedas' },
      { value: 'percent', label: 'Percentagem (ícone)' },
    ],
  },
  {
    id: 'other',
    label: 'Outros',
    options: [
      { value: 'zap', label: 'Energia / rapidez' },
      { value: 'flame', label: 'Energia / calor' },
      { value: 'lightbulb', label: 'Ideia / inovação' },
      { value: 'network', label: 'Rede' },
      { value: 'link2', label: 'Ligação' },
      { value: 'shield', label: 'Segurança' },
      { value: 'checkCircle', label: 'Concluído / validado' },
      { value: 'timer', label: 'Tempo' },
      { value: 'calendar', label: 'Calendário' },
    ],
  },
];

/** Lista plana (valor único por opção) para selects e validação. */
export const STAT_INDICATOR_PRESET_ICON_VALUES: string[] = STAT_INDICATOR_ICON_GROUPS.flatMap((g) =>
  g.options.map((o) => o.value)
);

export const STAT_INDICATOR_SYMBOL_OPTIONS = [
  { value: '+', label: '+ (mais)' },
  { value: '%', label: '% (percentagem)' },
  { value: '', label: '(nenhum)' },
  { value: 'K', label: 'K (mil)' },
  { value: 'M', label: 'M (milhão)' },
  { value: '‰', label: '‰ (por mil)' },
  { value: '×', label: '× (vezes)' },
  { value: '→', label: '→' },
] as const;

/** Marcador interno: modo «Outro» no editor sem coincidir com presets (+, ×, …). */
export const STAT_SYMBOL_CUSTOM_PLACEHOLDER = '\u200b';

const STAT_SYMBOL_PRESET_VALUES = new Set<string>(
  STAT_INDICATOR_SYMBOL_OPTIONS.map((o) => o.value).filter((v) => v !== '')
);

export function isStatSymbolPreset(symbol: string): boolean {
  return STAT_SYMBOL_PRESET_VALUES.has(symbol);
}

/** Texto visível no site (vazio = não renderizar). */
export function statSymbolForDisplay(symbol: string): string {
  return symbol.replace(/\u200b/g, '').trim();
}

export function isRenderableStatSymbol(symbol: string): boolean {
  return statSymbolForDisplay(symbol).length > 0;
}

export function normalizeStatIconKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/-/g, '');
}

export function isEmojiStatIconKey(raw: string): boolean {
  const t = raw.trim();
  if (!t) return false;
  if (t.startsWith('emoji:')) return true;
  if (STAT_INDICATOR_PRESET_ICON_VALUES.includes(t)) return false;
  const norm = normalizeStatIconKey(t);
  if (STAT_INDICATOR_LUCIDE_MAP[norm]) return false;
  return true;
}

export function parseStatIconFields(iconKey: string): { preset: string; emoji: string } {
  const raw = iconKey.trim();
  if (raw.startsWith('emoji:')) {
    return { preset: 'users', emoji: raw.slice(6) };
  }
  if (isEmojiStatIconKey(raw)) {
    return { preset: 'users', emoji: raw };
  }
  const inList = STAT_INDICATOR_PRESET_ICON_VALUES.includes(raw);
  return { preset: inList ? raw : 'users', emoji: '' };
}

export function buildStatIconKey(preset: string, emoji: string): string {
  const e = emoji.trim();
  if (e) return `emoji:${e}`;
  return preset.trim() || 'users';
}

export type ResolvedStatIndicatorVisual =
  | { kind: 'lucide'; Icon: LucideIcon }
  | { kind: 'emoji'; emoji: string };

export function resolveStatIndicatorVisual(iconKey: string): ResolvedStatIndicatorVisual {
  const raw = iconKey.trim();
  if (raw.startsWith('emoji:')) {
    return { kind: 'emoji', emoji: raw.slice(6) || '◆' };
  }
  if (isEmojiStatIconKey(raw)) {
    return { kind: 'emoji', emoji: raw };
  }
  const Icon = STAT_INDICATOR_LUCIDE_MAP[normalizeStatIconKey(raw)] ?? Users;
  return { kind: 'lucide', Icon };
}

export function iconFromKey(raw: string): LucideIcon {
  const v = resolveStatIndicatorVisual(raw);
  return v.kind === 'lucide' ? v.Icon : Users;
}
