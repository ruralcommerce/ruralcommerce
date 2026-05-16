/**
 * Sanitização de caminhos relativos a public/images (editor / API de media).
 */

const MAX_SEGMENTS = 20;
const SEGMENT_RE = /^[a-zA-Z0-9._-]{1,100}$/;

/** Caminho relativo tipo "home/aliados" ou "" (raiz de /images). */
export function sanitizeRelativeDirUnderImages(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const normalized = raw.replace(/\\/g, '/').trim().replace(/^\/+/, '').replace(/\/+$/, '');
  if (!normalized) return '';
  const segments = normalized.split('/').filter(Boolean);
  const safe: string[] = [];
  for (const seg of segments.slice(0, MAX_SEGMENTS)) {
    if (seg === '.' || seg === '..' || seg.includes('..')) continue;
    if (!SEGMENT_RE.test(seg)) continue;
    safe.push(seg);
  }
  return safe.join('/');
}
