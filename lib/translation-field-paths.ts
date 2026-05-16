/**
 * Caminhos de tradução no layout: propriedades simples e strings dentro de JSON.
 * Formato com JSON: `blocks.0.props.statsJson#/2/label`
 */

import type { BlockData, PageSchema } from './editor-types';
import { BLOCK_LIBRARY } from './editor-types';
import { findBlockPath } from './editor-utils';
import { findBlockLayoutPath, getValueAtDottedPath } from './block-translate';

const JSON_FIELD_SEP = '#';

/** Props JSON que nunca se traduzem (dados geográficos, embeds, etc.). */
const SKIP_JSON_PROPS = new Set(['territoriesGeoJson', 'mapEmbedUrl']);

/** Props escalares que não são cópia traduzível. */
const SKIP_SCALAR_PROPS = new Set([
  'backgroundColor',
  'leftPanelBg',
  'pageBg',
  'titleColor',
  'barColor',
  'accentCircleColor',
  'bgImage',
  'sideImage',
  'heroImage',
  'logoImage',
  'image',
  'mapEmbedUrl',
  'phone',
  'email',
  'hideOnMobile',
  'animationClass',
  'opacity',
  'boxShadow',
  'marginTop',
  'marginBottom',
  'maxWidth',
  'paddingY',
  'fontSize',
  'textAlign',
  'align',
  'height',
  'gap',
  'layout',
  'level',
  'showBorder',
  'gridTemplateColumns',
  'borderradius',
  'zindex',
  'classname',
  'anchorid',
  'slug',
]);

const SKIP_JSON_OBJECT_KEYS = new Set([
  'href',
  'src',
  'url',
  'slug',
  'image',
  'icon',
  'variant',
  'featuresjson',
  'digits',
  'symbol',
  'phone',
  'email',
  'price',
  'ctaurl',
  'secondaryurl',
  'bgimage',
  'sideimage',
  'heroimage',
  'mapembedurl',
  'territoriesgeojson',
]);

export function encodeTranslationFieldPath(layoutPath: string, jsonPointer?: string): string {
  if (!jsonPointer) return layoutPath;
  return `${layoutPath}${JSON_FIELD_SEP}${jsonPointer}`;
}

export function decodeTranslationFieldPath(field: string): { layoutPath: string; jsonPointer?: string } {
  const idx = field.indexOf(JSON_FIELD_SEP);
  if (idx === -1) return { layoutPath: field };
  return {
    layoutPath: field.slice(0, idx),
    jsonPointer: field.slice(idx + 1),
  };
}

function setValueAtDottedPath(root: unknown, dotted: string, value: unknown): void {
  const parts = dotted.split('.');
  let current: Record<string, unknown> = root as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

export function getAtJsonPointer(root: unknown, pointer: string): unknown {
  if (!pointer || pointer === '/') return root;
  const parts = pointer.split('/').filter(Boolean);
  let cur: unknown = root;
  for (const part of parts) {
    if (cur === null || cur === undefined) return undefined;
    if (Array.isArray(cur)) {
      const idx = Number(part);
      if (Number.isNaN(idx)) return undefined;
      cur = cur[idx];
    } else if (typeof cur === 'object') {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return cur;
}

function setAtJsonPointer(root: unknown, pointer: string, value: string): void {
  const parts = pointer.split('/').filter(Boolean);
  if (parts.length === 0) return;

  let cur: unknown = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (Array.isArray(cur)) {
      cur = cur[Number(part)];
    } else if (cur && typeof cur === 'object') {
      cur = (cur as Record<string, unknown>)[part];
    }
  }

  const last = parts[parts.length - 1];
  if (Array.isArray(cur)) {
    cur[Number(last)] = value;
  } else if (cur && typeof cur === 'object') {
    (cur as Record<string, unknown>)[last] = value;
  }
}

function isSkippableCopyString(key: string, text: string): boolean {
  const k = key.toLowerCase();
  if (SKIP_JSON_OBJECT_KEYS.has(k)) return true;
  if (k.includes('url') && k !== 'ctaurl') return true;
  if (k.includes('href') || k.includes('color') || k.includes('image')) return true;

  const t = text.trim();
  if (!t) return true;
  if (/^https?:\/\//i.test(t)) return true;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return true;
  if (/^#[0-9a-f]{3,8}$/i.test(t)) return true;
  if (/^\/[\w#%./-]*$/.test(t) && !/\s/.test(t)) return true;
  if (/^[\d.,+\-%\s×→‰\u200b]*$/u.test(t) && !/[a-záéíóúàâãñü]/i.test(t)) return true;
  return false;
}

function collectJsonStringPointers(
  node: unknown,
  pointer: string,
  out: { pointer: string; text: string }[]
): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectJsonStringPointers(item, `${pointer}/${i}`, out));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
      const ptr = pointer ? `${pointer}/${key}` : `/${key}`;
      if (typeof val === 'string') {
        if (!isSkippableCopyString(key, val)) {
          out.push({ pointer: ptr, text: val });
        }
      } else if (val && typeof val === 'object') {
        collectJsonStringPointers(val, ptr, out);
      }
    }
  }
}

export function isTranslatableScalarPropKey(propKey: string): boolean {
  const lower = propKey.toLowerCase();
  if (SKIP_SCALAR_PROPS.has(propKey) || SKIP_SCALAR_PROPS.has(lower)) return false;
  if (SKIP_JSON_PROPS.has(propKey)) return false;
  if (propKey.endsWith('Json')) return false;
  if (lower.includes('url') && !lower.includes('cta') && lower !== 'ctaurl') {
    if (lower.endsWith('url') || lower.includes('embedurl')) return false;
  }
  if (lower.includes('color') && !lower.includes('textcolor')) return false;
  if (lower === 'image' || lower.endsWith('image')) return false;
  return true;
}

function collectJsonPropFieldPaths(layoutPath: string, propKey: string, raw: string): string[] {
  if (SKIP_JSON_PROPS.has(propKey)) return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return [];
  }

  const strings: { pointer: string; text: string }[] = [];
  collectJsonStringPointers(parsed, '', strings);
  return strings
    .filter((s) => s.text.trim() !== '')
    .map((s) => encodeTranslationFieldPath(`${layoutPath}.props.${propKey}`, s.pointer));
}

function collectBlockTranslationFields(block: BlockData, layoutPrefix: string): string[] {
  const def = BLOCK_LIBRARY[block.type];
  const propKeys = def?.editableProps ?? Object.keys(block.props);
  const paths: string[] = [];

  for (const propKey of propKeys) {
    const raw = block.props[propKey];
    if (typeof raw !== 'string') continue;

    const base = `${layoutPrefix}.props.${propKey}`;

    if (propKey.endsWith('Json')) {
      paths.push(...collectJsonPropFieldPaths(layoutPrefix, propKey, raw));
      continue;
    }

    if (!isTranslatableScalarPropKey(propKey)) continue;
    if (raw.trim() === '') continue;
    paths.push(base);
  }

  return paths;
}

/** Todos os campos traduzíveis de um bloco (títulos, HTML, textos em JSON). */
export function listBlockTranslationFieldPaths(page: { blocks: BlockData[] }, blockId: string): string[] | null {
  const layoutPrefix = findBlockLayoutPath(page.blocks, blockId);
  if (!layoutPrefix) return null;

  const path = findBlockPath(page.blocks, blockId);
  if (!path?.length) return null;
  const block = path[path.length - 1];

  return collectBlockTranslationFields(block, layoutPrefix);
}

/** Todos os campos traduzíveis da página inteira. */
export function listPageTranslationFieldPaths(page: PageSchema): string[] {
  const paths: string[] = [];

  function walkBlocks(blocks: BlockData[], prefix: string) {
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const blockPrefix = `${prefix}.${i}`;
      paths.push(...collectBlockTranslationFields(block, blockPrefix));
      if (block.children?.length) {
        walkBlocks(block.children, `${blockPrefix}.children`);
      }
    }
  }

  walkBlocks(page.blocks, 'blocks');
  return paths;
}

export function getTranslationTextAt(root: unknown, field: string): string | null {
  const { layoutPath, jsonPointer } = decodeTranslationFieldPath(field);
  const layoutVal = getValueAtDottedPath(root, layoutPath);
  if (jsonPointer) {
    if (typeof layoutVal !== 'string') return null;
    try {
      const parsed = JSON.parse(layoutVal);
      const at = getAtJsonPointer(parsed, jsonPointer);
      return typeof at === 'string' ? at : null;
    } catch {
      return null;
    }
  }
  return typeof layoutVal === 'string' ? layoutVal : null;
}

export function setTranslationTextAt(root: unknown, field: string, text: string): void {
  const { layoutPath, jsonPointer } = decodeTranslationFieldPath(field);
  if (!jsonPointer) {
    setValueAtDottedPath(root, layoutPath, text);
    return;
  }
  const layoutVal = getValueAtDottedPath(root, layoutPath);
  if (typeof layoutVal !== 'string') return;
  try {
    const parsed = JSON.parse(layoutVal) as unknown;
    setAtJsonPointer(parsed, jsonPointer, text);
    setValueAtDottedPath(root, layoutPath, JSON.stringify(parsed));
  } catch {
    /* ignore invalid JSON */
  }
}

export function isEmptyTranslationSlot(root: unknown, field: string): boolean {
  const v = getTranslationTextAt(root, field);
  if (v === null || v === undefined) return true;
  return String(v).trim() === '';
}

export function filterFieldPathsMissingInTarget(targetPage: unknown, fieldPaths: string[]): string[] {
  return fieldPaths.filter((field) => isEmptyTranslationSlot(targetPage, field));
}

/** Etiqueta legível para o modal de revisão (ex.: `statsJson /2/label`). */
export function formatTranslationFieldLabel(field: string): string {
  const { layoutPath, jsonPointer } = decodeTranslationFieldPath(field);
  const prop = layoutPath.split('.').pop() ?? field;
  if (!jsonPointer) return prop;
  return `${prop} ${jsonPointer}`;
}
