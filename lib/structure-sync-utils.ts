/**
 * Sincronização estrutural entre layouts (ex.: ES → PT-BR / EN).
 * Alinha blocos pelo tipo (singleton) e posição, não pelo índice cego nem pelo id
 * (ids costumam ser diferentes por ficheiro de idioma).
 *
 * JSON (parceiros, menu, indicadores…): comprimento e campos estruturais vêm da fonte;
 * textos já traduzidos no destino são preservados por índice.
 */

import type { BlockData, BlockType, PageSchema } from './editor-types';
import { BLOCK_LIBRARY } from './editor-types';

const LOCALES_PATTERN = 'es|pt-BR|en';
const LOCALE_PREFIX_RE = new RegExp(`^\\/(${LOCALES_PATTERN})(?=\\/|#|$)`);

/** Props escalares estruturais (sempre da fonte). */
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
  'phone',
  'email',
  'contactPhone',
  'contactEmail',
  'contactAddress',
  'hideOnMobile',
  'animationClass',
  'zindex',
  'classname',
  'anchorid',
]);

const JSON_STRUCTURE_KEYS = new Set([
  'href',
  'src',
  'icon',
  'variant',
  'image',
  'slug',
  'digits',
  'symbol',
  'price',
  'featuresjson',
  'ctaurl',
  'secondaryurl',
  'bgimage',
  'sideimage',
  'heroimage',
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

function isJsonStructureKey(key: string): boolean {
  const k = key.toLowerCase();
  if (JSON_STRUCTURE_KEYS.has(k)) return true;
  if (k.includes('url') || k.includes('href')) return true;
  if (k.includes('color') && !k.includes('textcolor')) return true;
  if (k === 'src' || k.endsWith('image')) return true;
  return false;
}

function preserveTargetText(sourceVal: string, targetVal: unknown): string {
  if (typeof targetVal === 'string' && targetVal.trim() !== '') {
    return targetVal;
  }
  return sourceVal;
}

function mergeJsonNode(source: unknown, target: unknown): unknown {
  if (Array.isArray(source)) {
    const tArr = Array.isArray(target) ? target : [];
    return source.map((sItem, i) => mergeJsonNode(sItem, tArr[i]));
  }

  if (source && typeof source === 'object' && !Array.isArray(source)) {
    const tObj =
      target && typeof target === 'object' && !Array.isArray(target)
        ? (target as Record<string, unknown>)
        : {};
    const sObj = source as Record<string, unknown>;
    const out: Record<string, unknown> = { ...tObj };

    for (const key of Object.keys(sObj)) {
      const sv = sObj[key];
      const tv = tObj[key];

      if (isJsonStructureKey(key)) {
        if (typeof sv === 'string') {
          out[key] =
            key.toLowerCase().includes('href') && !sv.startsWith('http') && !sv.startsWith('#')
              ? canonicalizeInternalHref(sv)
              : sv;
        } else if (sv && typeof sv === 'object') {
          out[key] = mergeJsonNode(sv, tv);
        } else {
          out[key] = sv;
        }
      } else if (typeof sv === 'string') {
        out[key] = preserveTargetText(sv, tv);
      } else if (sv && typeof sv === 'object') {
        out[key] = mergeJsonNode(sv, tv);
      } else {
        out[key] = sv;
      }
    }
    return out;
  }

  if (typeof source === 'string') {
    return preserveTargetText(source, target);
  }

  return source;
}

export function mergeJsonStructureFromSource(sourceJson: string, targetJson: string): string {
  const targetTrim = targetJson.trim();
  try {
    const sourceParsed = JSON.parse(sourceJson) as unknown;
    let targetParsed: unknown;
    try {
      targetParsed = targetTrim ? (JSON.parse(targetTrim) as unknown) : Array.isArray(sourceParsed) ? [] : {};
    } catch {
      targetParsed = Array.isArray(sourceParsed) ? [] : {};
    }
    const merged = mergeJsonNode(sourceParsed, targetParsed);
    return JSON.stringify(merged);
  } catch {
    return targetJson;
  }
}

type KeyedBlock = { block: BlockData; key: string };

function blockMatchKey(block: BlockData, indexInType: number): string {
  const def = BLOCK_LIBRARY[block.type];
  if (def?.singleton) {
    return `singleton:${block.type}`;
  }
  return `type:${block.type}:${indexInType}`;
}

function indexBlocksByMatchKey(blocks: BlockData[]): Map<string, BlockData> {
  const typeCounts = new Map<BlockType, number>();
  const map = new Map<string, BlockData>();

  for (const block of blocks) {
    const def = BLOCK_LIBRARY[block.type];
    const idx = typeCounts.get(block.type) ?? 0;
    if (!def?.singleton) {
      typeCounts.set(block.type, idx + 1);
    }
    const key = blockMatchKey(block, idx);
    map.set(key, block);
  }

  return map;
}

function listBlocksWithKeys(blocks: BlockData[]): KeyedBlock[] {
  const typeCounts = new Map<BlockType, number>();
  const list: KeyedBlock[] = [];

  for (const block of blocks) {
    const def = BLOCK_LIBRARY[block.type];
    const idx = typeCounts.get(block.type) ?? 0;
    if (!def?.singleton) {
      typeCounts.set(block.type, idx + 1);
    }
    list.push({ block, key: blockMatchKey(block, idx) });
  }

  return list;
}

function blockLabel(block: BlockData): string {
  return BLOCK_LIBRARY[block.type]?.label ?? block.type;
}

function syncBlockLists(
  sourceBlocks: BlockData[],
  targetBlocks: BlockData[],
  warnings: string[],
  pathLabel = ''
): BlockData[] {
  const targetByKey = indexBlocksByMatchKey(targetBlocks);
  const consumed = new Set<string>();
  const result: BlockData[] = [];

  for (const { block: sb, key } of listBlocksWithKeys(sourceBlocks)) {
    const tb = targetByKey.get(key);
    const prefix = pathLabel ? `${pathLabel} → ` : '';

    if (!tb) {
      warnings.push(
        `${prefix}«${blockLabel(sb)}»: existe na fonte mas não no destino — bloco criado a partir da fonte (revise textos).`
      );
      const clone = JSON.parse(JSON.stringify(sb)) as BlockData;
      result.push(clone);
      continue;
    }

    consumed.add(key);

    if (tb.type !== sb.type) {
      warnings.push(
        `${prefix}«${blockLabel(sb)}»: tipo fonte «${sb.type}» vs destino «${tb.type}» — props alinhadas à fonte.`
      );
    }

    const children =
      sb.children?.length || tb.children?.length
        ? syncBlockLists(sb.children ?? [], tb.children ?? [], warnings, `${prefix}${blockLabel(sb)}`)
        : sb.children ?? tb.children;

    result.push({
      ...tb,
      type: sb.type,
      props: syncPropsForBlock(
        sb.props as Record<string, unknown>,
        tb.props as Record<string, unknown>,
        sb.type
      ) as BlockData['props'],
      children,
    });
  }

  for (const { block: tb, key } of listBlocksWithKeys(targetBlocks)) {
    if (consumed.has(key)) continue;
    const prefix = pathLabel ? `${pathLabel} → ` : '';
    warnings.push(
      `${prefix}«${blockLabel(tb)}»: só no destino — removido para igualar à estrutura da fonte.`
    );
  }

  return result;
}

function syncPropsForBlock(
  sourceProps: Record<string, unknown>,
  targetProps: Record<string, unknown>,
  _blockType: BlockType
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...targetProps };

  for (const key of STRUCTURE_PROP_KEYS) {
    if (key in sourceProps && typeof sourceProps[key] === 'string') {
      const v = sourceProps[key] as string;
      if (key === 'ctaUrl' || key === 'secondaryUrl' || key === 'href' || key === 'linkUrl') {
        out[key] = v.startsWith('#') || v.startsWith('http') ? v : canonicalizeInternalHref(v);
      } else {
        out[key] = v;
      }
    }
  }

  for (const key of Object.keys(sourceProps)) {
    if (!key.endsWith('Json')) continue;
    const sv = sourceProps[key];
    if (typeof sv !== 'string' || !sv.trim()) continue;

    const tv = out[key];
    if (typeof tv === 'string') {
      out[key] = mergeJsonStructureFromSource(sv, tv);
    } else {
      out[key] = sv;
    }
  }

  return out;
}

export type StructureSyncResult = {
  page: PageSchema;
  warnings: string[];
};

/**
 * Alinha a árvore de blocos da fonte para o destino (por tipo singleton / ordem),
 * fundindo estrutura + JSON completo e preservando textos traduzidos.
 */
export function applyStructureSyncFromSource(source: PageSchema, target: PageSchema): StructureSyncResult {
  const warnings: string[] = [];

  if (source.slug && target.slug && source.slug !== target.slug) {
    warnings.push(`Slug diferente (${source.slug} vs ${target.slug}) — mesmo assim sincroniza blocos.`);
  }

  const newBlocks = syncBlockLists(source.blocks, target.blocks, warnings);

  return {
    page: {
      ...target,
      blocks: newBlocks,
      updatedAt: new Date().toISOString(),
    },
    warnings,
  };
}
