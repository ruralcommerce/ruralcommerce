/**
 * Redes sociais em JSON (rodapé, contacto): { label, href }.
 * O ícone no site é escolhido pelo nome da rede (label).
 */

export type SocialLinkItem = {
  label: string;
  href: string;
};

export const SOCIAL_NETWORK_PRESETS = [
  { id: 'instagram', label: 'Instagram', hint: 'https://www.instagram.com/sua-conta' },
  { id: 'facebook', label: 'Facebook', hint: 'https://www.facebook.com/sua-pagina' },
  { id: 'youtube', label: 'YouTube', hint: 'https://www.youtube.com/@canal' },
  { id: 'linkedin', label: 'LinkedIn', hint: 'https://www.linkedin.com/company/...' },
  { id: 'tiktok', label: 'TikTok', hint: 'https://www.tiktok.com/@conta' },
  { id: 'x', label: 'X (Twitter)', hint: 'https://x.com/conta' },
  { id: 'whatsapp', label: 'WhatsApp', hint: 'https://wa.me/549...' },
  { id: 'custom', label: 'Outra rede', hint: 'https://...' },
] as const;

const PRESET_BY_LABEL = new Map(
  SOCIAL_NETWORK_PRESETS.filter((p) => p.id !== 'custom').map((p) => [p.label.toLowerCase(), p])
);

export function presetIdFromLabel(label: string): string {
  const t = label.trim().toLowerCase();
  if (t.includes('instagram')) return 'instagram';
  if (t.includes('facebook')) return 'facebook';
  if (t.includes('youtube')) return 'youtube';
  if (t.includes('linkedin')) return 'linkedin';
  if (t.includes('tiktok')) return 'tiktok';
  if (t === 'x' || t.includes('twitter')) return 'x';
  if (t.includes('whatsapp') || t.includes('whats')) return 'whatsapp';
  const hit = PRESET_BY_LABEL.get(t);
  if (hit) return hit.id;
  return 'custom';
}

export function labelFromPresetId(presetId: string): string {
  const p = SOCIAL_NETWORK_PRESETS.find((x) => x.id === presetId);
  return p?.label ?? 'Outra rede';
}

/** Normaliza JSON do editor (inclui entradas antigas só com string ou chave `value`). */
export function parseSocialLinksJson(raw: unknown): SocialLinkItem[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const out: SocialLinkItem[] = [];
  for (const item of parsed) {
    if (typeof item === 'string' && item.trim()) {
      out.push({ label: item.trim(), href: '' });
      continue;
    }
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    if ('label' in o || 'href' in o) {
      const label = String(o.label ?? '').trim();
      const href = String(o.href ?? '').trim();
      if (!label && !href) continue;
      out.push({ label: label || 'Rede social', href });
      continue;
    }
    if (typeof o.value === 'string' && o.value.trim()) {
      out.push({ label: o.value.trim(), href: '' });
    }
  }
  return out;
}

export function parseSocialLinksJsonWithFallback(
  raw: unknown,
  fallback: SocialLinkItem[] = []
): SocialLinkItem[] {
  const parsed = parseSocialLinksJson(typeof raw === 'string' ? raw : '');
  return parsed.length > 0 ? parsed : fallback;
}

export function stringifySocialLinksJson(links: SocialLinkItem[]): string {
  const payload = links
    .filter((l) => l.label.trim() || l.href.trim())
    .map((l) => ({
      label: l.label.trim() || 'Rede social',
      href: l.href.trim(),
    }));
  return JSON.stringify(payload, null, 2);
}
