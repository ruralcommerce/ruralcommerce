/**
 * Sincronização estrutural: copia do layout-fonte (ex.: ES) para o destino (ex.: PT-BR)
 * cores, imagens, ordem de hrefs internos, etc., mas preserva textos/labels já traduzidos no destino.
 *
 * Links internos: remove prefixo /es, /pt-BR, /en e grava forma canônica (/rota ou #âncora)
 * para o site aplicar o locale atual em RuralCommerceHeader/Footer.
 */

import type { BlockData, BlockType, PageSchema } from './editor-types';

const LOCALES_PATTERN = 'es|pt-BR|en';
const LOCALE_PREFIX_RE = new RegExp(`^\\/(${LOCALES_PATTERN})(?=\\/|#|$)`);

/** Chaves puramente estruturais / recurso: vêm sempre da fonte. */
const STRUCTURE_PROP_KEYS = new Set<string>([
  'backgroundColor',
  'bgImage',
  'ctaUrl',
  'secondaryUrl',
  'src',
  'fontSize',
  'textAlign',
  'height',
  'heroImage',
  'image',
  'sideImage',
  'accentCircleColor',
  'mapEmbedUrl',
  'territoriesGeoJson',
  'leftPanelBg',
  'pageBg',
  'titleColor',
  'maxWidth',
  'padding',
  'marginY',
  'thickness',
  'color',
  'gap',
  'layout',
  'showBorder',
  'level',
  'align',
  'linkUrl',
  'href',
  'borderRadius',
  'barColor',
  'url',
  'embedSrc',
  'hoverBackgroundColor',
  'hoverTextColor',
  'variant',
  'marginTop',
  'marginBottom',
  'gridTemplateColumns',
  'iconChar',
  'opacity',
  'boxShadow',
]);

export function canonicalizeInternalHref(href: string): string {
  if (!href || typeof href !== 'string') return href;
  const t = href.trim();
  if (
    !t.startsWith('/') ||
    t.startsWith('//') ||
    /^https?:\/\//i.test(t) ||
    t.startsWith('mailto:') ||
    t.startsWith('tel:')
  ) {
    return href;
  }
  if (LOCALE_PREFIX_RE.test(t)) {
    const stripped = t.replace(LOCALE_PREFIX_RE, '');
    return stripped.length > 0 ? stripped : '/';
  }
  return href;
}

function mergeFlatNavOrSocial(sourceJson: string, targetJson: string): string {
  try {
    const s = JSON.parse(sourceJson) as { label?: string; href?: string }[];
    const t = JSON.parse(targetJson) as { label?: string; href?: string }[];
    if (!Array.isArray(s) || !Array.isArray(t)) return targetJson;
    const n = Math.min(s.length, t.length);
    for (let i = 0; i < n; i++) {
      if (typeof s[i]?.href === 'string') {
        t[i] = {
          ...t[i],
          href: canonicalizeInternalHref(s[i].href!),
          label: t[i]?.label ?? s[i]?.label ?? '',
        };
      }
    }
    return JSON.stringify(t);
  } catch {
    return targetJson;
  }
}

type FooterItem = { label?: string; href?: string; items?: FooterItem[] };
type FooterGroup = { group?: string; items?: FooterItem[] };

function mergeFooterHrefsRecursive(sItems: FooterItem[] | undefined, tItems: FooterItem[] | undefined): void {
  if (!sItems || !tItems) return;
  const m = Math.min(sItems.length, tItems.length);
  for (let j = 0; j < m; j++) {
    const si = sItems[j];
    const ti = tItems[j];
    if (typeof si?.href === 'string' && ti) {
      ti.href = canonicalizeInternalHref(si.href);
    }
    if (si?.items && ti?.items) mergeFooterHrefsRecursive(si.items, ti.items);
  }
}

function mergeFooterLinksJson(sourceJson: string, targetJson: string): string {
  try {
    const s = JSON.parse(sourceJson) as FooterGroup[];
    const t = JSON.parse(targetJson) as FooterGroup[];
    if (!Array.isArray(s) || !Array.isArray(t)) return targetJson;
    const n = Math.min(s.length, t.length);
    for (let i = 0; i < n; i++) {
      mergeFooterHrefsRecursive(s[i]?.items, t[i]?.items);
    }
    return JSON.stringify(t);
  } catch {
    return targetJson;
  }
}

function mergeSegmentsItemsJson(sourceJson: string, targetJson: string): string {
  try {
    const s = JSON.parse(sourceJson) as { href?: string; icon?: string; title?: string; subtitle?: string }[];
    const t = JSON.parse(targetJson) as { href?: string; icon?: string; title?: string; subtitle?: string }[];
    if (!Array.isArray(s) || !Array.isArray(t)) return targetJson;
    const n = Math.min(s.length, t.length);
    for (let i = 0; i < n; i++) {
      const si = s[i];
      const to = { ...t[i] };
      if (typeof si?.href === 'string') to.href = canonicalizeInternalHref(si.href);
      if (typeof si?.icon === 'string') to.icon = si.icon;
      t[i] = to;
    }
    return JSON.stringify(t);
  } catch {
    return targetJson;
  }
}

function mergeSolutionsItemsJson(sourceJson: string, targetJson: string): string {
  try {
    const s = JSON.parse(sourceJson) as Record<string, unknown>[];
    const t = JSON.parse(targetJson) as Record<string, unknown>[];
    if (!Array.isArray(s) || !Array.isArray(t)) return targetJson;
    const n = Math.min(s.length, t.length);
    for (let i = 0; i < n; i++) {
      const si = s[i];
      const to = { ...t[i] };
      if (typeof si?.href === 'string') to.href = canonicalizeInternalHref(si.href as string);
      if (typeof si?.variant === 'string') to.variant = si.variant;
      t[i] = to;
    }
    return JSON.stringify(t);
  } catch {
    return targetJson;
  }
}

function mergePartnersJson(sourceJson: string, targetJson: string): string {
  try {
    const s = JSON.parse(sourceJson) as { name?: string; src?: string; href?: string }[];
    const t = JSON.parse(targetJson) as { name?: string; src?: string; href?: string }[];
    if (!Array.isArray(s) || !Array.isArray(t)) return targetJson;
    const n = Math.min(s.length, t.length);
    for (let i = 0; i < n; i++) {
      const si = s[i];
      const to = { ...t[i] };
      if (typeof si?.src === 'string') to.src = si.src;
      if (typeof si?.href === 'string') to.href = canonicalizeInternalHref(si.href);
      if (typeof si?.name === 'string' && (!to.name || String(to.name).trim() === '')) {
        to.name = si.name;
      }
      t[i] = to;
    }
    return JSON.stringify(t);
  } catch {
    return targetJson;
  }
}

function mergePillarsJson(_sourceJson: string, targetJson: string): string {
  return targetJson;
}

function syncPropsForBlock(
  sourceProps: Record<string, unknown>,
  targetProps: Record<string, unknown>,
  blockType: BlockType
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...targetProps };

  for (const key of STRUCTURE_PROP_KEYS) {
    if (key in sourceProps && typeof sourceProps[key] === 'string') {
      const v = sourceProps[key] as string;
      if (key === 'ctaUrl' || key === 'secondaryUrl' || key === 'href') {
        out[key] = v.startsWith('#') || v.startsWith('http') ? v : canonicalizeInternalHref(v);
      } else {
        out[key] = v;
      }
    }
  }

  if (typeof sourceProps.navItemsJson === 'string' && typeof out.navItemsJson === 'string') {
    out.navItemsJson = mergeFlatNavOrSocial(sourceProps.navItemsJson as string, out.navItemsJson as string);
  }
  if (typeof sourceProps.socialLinksJson === 'string' && typeof out.socialLinksJson === 'string') {
    out.socialLinksJson = mergeFlatNavOrSocial(
      sourceProps.socialLinksJson as string,
      out.socialLinksJson as string
    );
  }
  if (typeof sourceProps.footerLinksJson === 'string' && typeof out.footerLinksJson === 'string') {
    out.footerLinksJson = mergeFooterLinksJson(
      sourceProps.footerLinksJson as string,
      out.footerLinksJson as string
    );
  }
  if (typeof sourceProps.partnersJson === 'string' && typeof out.partnersJson === 'string') {
    out.partnersJson = mergePartnersJson(sourceProps.partnersJson as string, out.partnersJson as string);
  }
  if (typeof sourceProps.itemsJson === 'string' && typeof out.itemsJson === 'string') {
    if (blockType === 'segments-section') {
      out.itemsJson = mergeSegmentsItemsJson(sourceProps.itemsJson as string, out.itemsJson as string);
    } else if (blockType === 'solutions-section') {
      out.itemsJson = mergeSolutionsItemsJson(sourceProps.itemsJson as string, out.itemsJson as string);
    }
  }
  if (blockType === 'system-section' && typeof sourceProps.pillarsJson === 'string' && typeof out.pillarsJson === 'string') {
    out.pillarsJson = mergePillarsJson(sourceProps.pillarsJson as string, out.pillarsJson as string);
  }

  return out;
}

export type StructureSyncResult = {
  page: PageSchema;
  warnings: string[];
};

/**
 * Alinha blocos por índice + type; funde props estruturais da fonte com textos do destino.
 */
export function applyStructureSyncFromSource(source: PageSchema, target: PageSchema): StructureSyncResult {
  const warnings: string[] = [];
  const n = Math.min(source.blocks.length, target.blocks.length);

  if (source.blocks.length !== target.blocks.length) {
    warnings.push(
      `Quantidade de blocos difere (${source.blocks.length} vs ${target.blocks.length}). Só os primeiros ${n} blocos foram sincronizados.`
    );
  }

  const newBlocks: BlockData[] = target.blocks.map((tb, i) => {
    if (i >= source.blocks.length) return tb;
    const sb = source.blocks[i];
    if (sb.type !== tb.type) {
      warnings.push(`Bloco ${i}: tipos "${sb.type}" vs "${tb.type}" — ignorado.`);
      return tb;
    }
    return {
      ...tb,
      props: syncPropsForBlock(
        sb.props as Record<string, unknown>,
        tb.props as Record<string, unknown>,
        sb.type
      ) as BlockData['props'],
    };
  });

  return {
    page: {
      ...target,
      blocks: newBlocks,
      updatedAt: new Date().toISOString(),
    },
    warnings,
  };
}
