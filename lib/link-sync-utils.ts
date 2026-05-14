/**
 * Copia apenas URLs / hrefs do layout "fonte" (ex.: página aberta no editor)
 * para o layout de outro idioma, mantendo textos, labels e IDs dos blocos.
 */

import type { BlockType, PageSchema } from './editor-types';

/** Props string que são só URL de recurso ou destino do botão. */
const SCALAR_SYNC_KEYS = new Set(['ctaUrl', 'secondaryUrl', 'bgImage', 'src']);

function mergeHrefInObjectArrays(sourceJson: string, targetJson: string): string {
  try {
    const s = JSON.parse(sourceJson) as unknown[];
    const t = JSON.parse(targetJson) as unknown[];
    if (!Array.isArray(s) || !Array.isArray(t)) return targetJson;
    const n = Math.min(s.length, t.length);
    for (let i = 0; i < n; i++) {
      const so = s[i];
      const to = t[i];
      if (!so || !to || typeof so !== 'object' || typeof to !== 'object') continue;
      const src = so as Record<string, unknown>;
      const tgt = { ...(to as Record<string, unknown>) };
      if (typeof src.href === 'string') tgt.href = src.href;
      t[i] = tgt;
    }
    return JSON.stringify(t);
  } catch {
    return targetJson;
  }
}

/** navItemsJson, socialLinksJson: [{ label, href }] */
function mergeFlatHrefList(sourceJson: string, targetJson: string): string {
  return mergeHrefInObjectArrays(sourceJson, targetJson);
}

/** partnersJson: [{ name, src, href }] — mantém nome; alinha src/href de mídia e link. */
function mergePartnersJson(sourceJson: string, targetJson: string): string {
  try {
    const s = JSON.parse(sourceJson) as unknown[];
    const t = JSON.parse(targetJson) as unknown[];
    if (!Array.isArray(s) || !Array.isArray(t)) return targetJson;
    const n = Math.min(s.length, t.length);
    for (let i = 0; i < n; i++) {
      const so = s[i];
      const to = t[i];
      if (!so || !to || typeof so !== 'object' || typeof to !== 'object') continue;
      const src = so as Record<string, unknown>;
      const tgt = { ...(to as Record<string, unknown>) };
      if (typeof src.href === 'string') tgt.href = src.href;
      if (typeof src.src === 'string') tgt.src = src.src;
      t[i] = tgt;
    }
    return JSON.stringify(t);
  } catch {
    return targetJson;
  }
}

type FooterItem = { label?: string; href?: string; items?: FooterItem[] };
type FooterGroup = { group?: string; items?: FooterItem[] };

function mergeFooterItemsRecursive(sItems: FooterItem[] | undefined, tItems: FooterItem[] | undefined): void {
  if (!sItems || !tItems) return;
  const m = Math.min(sItems.length, tItems.length);
  for (let j = 0; j < m; j++) {
    const si = sItems[j];
    const ti = tItems[j];
    if (typeof si?.href === 'string' && ti) ti.href = si.href;
    if (si?.items && ti?.items) mergeFooterItemsRecursive(si.items, ti.items);
  }
}

function mergeFooterLinksJson(sourceJson: string, targetJson: string): string {
  try {
    const s = JSON.parse(sourceJson) as FooterGroup[];
    const t = JSON.parse(targetJson) as FooterGroup[];
    if (!Array.isArray(s) || !Array.isArray(t)) return targetJson;
    const n = Math.min(s.length, t.length);
    for (let i = 0; i < n; i++) {
      mergeFooterItemsRecursive(s[i]?.items, t[i]?.items);
    }
    return JSON.stringify(t);
  } catch {
    return targetJson;
  }
}

function mergeItemsJsonByBlockType(
  blockType: BlockType,
  sourceJson: string,
  targetJson: string
): string {
  if (blockType === 'segments-section') {
    return mergeHrefInObjectArrays(sourceJson, targetJson);
  }
  if (blockType === 'solutions-section') {
    try {
      const s = JSON.parse(sourceJson) as unknown[];
      const t = JSON.parse(targetJson) as unknown[];
      if (!Array.isArray(s) || !Array.isArray(t)) return targetJson;
      const n = Math.min(s.length, t.length);
      for (let i = 0; i < n; i++) {
        const so = s[i];
        const to = t[i];
        if (!so || !to || typeof so !== 'object' || typeof to !== 'object') continue;
        const src = so as Record<string, unknown>;
        const tgt = { ...(to as Record<string, unknown>) };
        if (typeof src.href === 'string') tgt.href = src.href;
        t[i] = tgt;
      }
      return JSON.stringify(t);
    } catch {
      return targetJson;
    }
  }
  return targetJson;
}

function syncPropsForBlock(
  sourceProps: Record<string, unknown>,
  targetProps: Record<string, unknown>,
  blockType: BlockType
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...targetProps };

  for (const key of SCALAR_SYNC_KEYS) {
    if (key in sourceProps && key in out && typeof sourceProps[key] === 'string') {
      out[key] = sourceProps[key];
    }
  }

  if (typeof sourceProps.navItemsJson === 'string' && typeof out.navItemsJson === 'string') {
    out.navItemsJson = mergeFlatHrefList(sourceProps.navItemsJson as string, out.navItemsJson as string);
  }
  if (typeof sourceProps.socialLinksJson === 'string' && typeof out.socialLinksJson === 'string') {
    out.socialLinksJson = mergeFlatHrefList(
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
    out.itemsJson = mergeItemsJsonByBlockType(
      blockType,
      sourceProps.itemsJson as string,
      out.itemsJson as string
    );
  }

  return out;
}

export type LinkSyncResult = {
  page: PageSchema;
  warnings: string[];
};

/**
 * Alinha blocos por **índice** e **type**; só então copia URLs/hrefs nas props conhecidas.
 */
export function applyLinkSyncFromSource(source: PageSchema, target: PageSchema): LinkSyncResult {
  const warnings: string[] = [];
  const n = Math.min(source.blocks.length, target.blocks.length);

  if (source.blocks.length !== target.blocks.length) {
    warnings.push(
      `Quantidade de blocos difere (${source.blocks.length} na origem vs ${target.blocks.length} no destino). Só os primeiros ${n} blocos foram sincronizados.`
    );
  }

  const newBlocks = target.blocks.map((tb, i) => {
    if (i >= source.blocks.length) return tb;
    const sb = source.blocks[i];
    if (sb.type !== tb.type) {
      warnings.push(`Bloco ${i}: tipo "${sb.type}" na origem vs "${tb.type}" no destino — não alterado.`);
      return tb;
    }
    return {
      ...tb,
      props: syncPropsForBlock(
        sb.props as Record<string, unknown>,
        tb.props as Record<string, unknown>,
        sb.type
      ),
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
