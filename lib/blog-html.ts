import { splitBlogBody } from '@/lib/blog-posts-shared';
import { sanitizeBlogHtmlAllowlist } from '@/lib/blog-body-sanitize';

function escapeHtmlText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Legacy posts: plain text → parágrafos HTML seguros. */
export function normalizeBlogBodyToHtml(body: string): string {
  const t = body.trim();
  if (!t) return '';
  if (/<[a-z][\s\S]*>/i.test(t)) {
    return sanitizeBlogBodyHtml(t);
  }
  const paras = splitBlogBody(body);
  if (paras.length === 0) return '';
  return paras.map((p) => `<p>${escapeHtmlText(p)}</p>`).join('');
}

export function sanitizeBlogBodyHtml(html: string): string {
  return sanitizeBlogHtmlAllowlist(html);
}

/** href guardado pode ser `/contacto` ou URL absoluta — prefixa locale quando for path interno. */
export function resolveBlogCtaHref(href: string | undefined, localeParam: string): string {
  if (!href || !href.trim()) return `/${localeParam}/contacto`;
  const h = href.trim();
  if (/^https?:\/\//i.test(h)) return h;
  if (h.startsWith('/')) {
    if (h.startsWith(`/${localeParam}/`) || h === `/${localeParam}`) return h;
    if (h.startsWith('/es/') || h.startsWith('/pt-BR/') || h.startsWith('/en/')) {
      const rest = h.replace(/^\/(es|pt-BR|en)(?=\/|$)/, '');
      return `/${localeParam}${rest.startsWith('/') ? rest : `/${rest}`}`;
    }
    return `/${localeParam}${h.startsWith('/') ? h : `/${h}`}`;
  }
  return h;
}
