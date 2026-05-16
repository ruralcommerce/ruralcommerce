/**
 * Allowlisted HTML for blog bodies — no sanitize-html npm dependency.
 * Mirrors rules previously declared in lib/blog-html.ts.
 */

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'div',
  'span',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'sub',
  'sup',
  'h1',
  'h2',
  'h3',
  'h4',
  'blockquote',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'hr',
  'pre',
  'code',
]);

/** Extra attrs beyond class/style */
const EXTRA_ATTRS_BY_TAG: Record<string, ReadonlySet<string>> = {
  a: new Set(['href', 'name', 'target', 'rel', 'class']),
  img: new Set(['src', 'alt', 'width', 'height', 'class']),
};

const GLOBAL_ATTRS = new Set(['class', 'style']);

const HREF_SCHEMES = ['http', 'https', 'mailto', 'tel'];
const IMG_SCHEMES = ['http', 'https', 'data'];

const STYLE_RULES: Record<string, readonly RegExp[]> = {
  color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^rgba\(/, /^hsl\(/, /^hsla\(/],
  'background-color': [
    /^#[0-9a-fA-F]{3,8}$/,
    /^rgb\(/,
    /^rgba\(/,
    /^hsl\(/,
    /^hsla\(/,
    /^transparent$/,
  ],
  'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
  'font-size': [/^\d+(?:px|rem|em|%)$/],
  'font-family': [/^[a-zA-Z0-9\s,"'-]+$/],
  'line-height': [/^\d+(?:\.\d+)?$/],
  'margin-left': [/^\d+(?:px|rem|em|%)$/],
  'padding-left': [/^\d+(?:px|rem|em|%)$/],
};

function escapeAttrQuoted(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/\r?\n/g, ' ');
}

function schemeOk(uri: string, schemes: readonly string[]): boolean {
  const raw = uri.trim().toLowerCase();
  if (raw.startsWith('mailto:')) return schemes.includes('mailto');
  if (raw.startsWith('tel:')) return schemes.includes('tel');
  if (!/^[a-z][a-z0-9+.-]*:/i.test(uri.trim())) return true;
  const m = /^([a-z][a-z0-9+.-]*):/i.exec(uri.trim());
  return m ? schemes.includes(m[1].toLowerCase()) : true;
}

function sanitizeInlineStyle(style: string): string | null {
  const kept: string[] = [];
  for (const raw of style.split(';')) {
    const part = raw.trim();
    if (!part) continue;
    const idx = part.indexOf(':');
    if (idx < 1) continue;
    const prop = part.slice(0, idx).trim().toLowerCase();
    const val = part.slice(idx + 1).trim().replace(/\s+/g, ' ');
    const rules = STYLE_RULES[prop];
    if (!rules?.some((re) => re.test(val))) continue;
    kept.push(`${prop}: ${val}`);
  }
  return kept.length ? kept.join('; ') : null;
}

function transformAnchorAttribs(attribs: Record<string, string>): Record<string, string> {
  const href = attribs.href || '';
  const isRelative = href.startsWith('/') && !href.startsWith('//');
  return {
    ...attribs,
    href: isRelative ? href : attribs.href,
    target: attribs.target === '_blank' ? '_blank' : attribs.target,
    rel: attribs.target === '_blank' ? 'noopener noreferrer' : attribs.rel,
  };
}

function allowedAttrNames(tag: string): Set<string> {
  const s = new Set<string>(GLOBAL_ATTRS);
  const extra = EXTRA_ATTRS_BY_TAG[tag];
  if (extra) extra.forEach((x) => s.add(x));
  return s;
}

function readTagName(html: string, i: number): [string | null, number] {
  let j = i;
  const ch = html[j];
  if (!ch || !/[a-zA-Z]/.test(ch)) return [null, j];
  const st = j;
  while (j < html.length && /[a-zA-Z0-9:-]/.test(html[j])) j++;
  return [html.slice(st, j).toLowerCase(), j];
}

function skipWs(html: string, i: number): number {
  let j = i;
  while (j < html.length && /\s/.test(html[j])) j++;
  return j;
}

function readAttributes(html: string, i: number): [Record<string, string>, number] {
  const attribs: Record<string, string> = {};
  let j = skipWs(html, i);

  while (j < html.length) {
    if (html[j] === '>') return [attribs, j + 1];
    if (html[j] === '/' && html[j + 1] === '>') return [attribs, j + 2];

    j = skipWs(html, j);
    const [aname, n0] = readTagName(html, j);
    if (!aname) break;
    j = n0;
    j = skipWs(html, j);

    if (j < html.length && html[j] === '=') {
      j++;
      j = skipWs(html, j);
      if (j >= html.length) break;
      const q = html[j];
      if (q === '"' || q === "'") {
        const qq = q;
        j++;
        const v0 = j;
        while (j < html.length && html[j] !== qq) j++;
        attribs[aname] = html.slice(v0, j);
        if (j < html.length) j++;
      } else {
        const v0 = j;
        while (j < html.length && !/[>\s]/.test(html[j])) j++;
        attribs[aname] = html.slice(v0, j);
      }
    } else {
      attribs[aname] = '';
    }
  }

  return [attribs, j];
}

function serializeOpenTag(tag: string, attrs: Record<string, string>): string | null {
  if (!ALLOWED_TAGS.has(tag)) return null;
  const a = tag === 'a' ? transformAnchorAttribs(attrs) : attrs;
  const names = allowedAttrNames(tag);
  const parts: string[] = [];

  for (const key of Object.keys(a).sort()) {
    const lk = key.toLowerCase();
    if (!names.has(lk)) continue;

    let val = a[key];
    if (val === undefined) continue;

    if (lk === 'style') {
      const cleaned = sanitizeInlineStyle(val);
      if (!cleaned) continue;
      val = cleaned;
    }

    if (tag === 'a' && lk === 'href') {
      const h = String(val).trim();
      if (!h || !schemeOk(h, HREF_SCHEMES)) continue;
    }

    if (tag === 'img' && lk === 'src') {
      const h = String(val).trim();
      if (!h || !schemeOk(h, IMG_SCHEMES)) continue;
    }

    parts.push(`${lk}="${escapeAttrQuoted(String(val))}"`);
  }

  return parts.length ? `<${tag} ${parts.join(' ')}>` : `<${tag}>`;
}

function skipRawElement(htmlLower: string, html: string, lt: number, tagLower: string): number {
  const isScript = tagLower === 'script';
  const probe = html.slice(lt, lt + 8).toLowerCase();
  const ok = isScript ? probe.startsWith('<script') : probe.startsWith('<style');
  if (!ok) return lt;
  const gt = html.indexOf('>', lt);
  if (gt === -1) return html.length;
  let searchFrom = gt + 1;
  const needle = isScript ? '</script>' : '</style>';
  for (;;) {
    const close = htmlLower.indexOf(needle, searchFrom);
    if (close === -1) return html.length;
    let after = close + needle.length;
    after = skipWs(html, after);
    if (after < html.length && html[after] === '>') return after + 1;
    searchFrom = close + 1;
  }
}

function skipComment(html: string, lt: number): number {
  if (!html.startsWith('<!--', lt)) return lt;
  const end = html.indexOf('-->', lt + 4);
  return end === -1 ? html.length : end + 3;
}

function skipBangBlock(html: string, lt: number): number {
  let j = lt + 2;
  while (j < html.length && html[j] !== '>') {
    const q = html[j];
    if (q === '"' || q === "'") {
      const qq = q;
      j++;
      while (j < html.length && html[j] !== qq) j++;
      if (j < html.length) j++;
      continue;
    }
    j++;
  }
  return j < html.length ? j + 1 : html.length;
}

function skipPi(html: string, lt: number): number {
  if (!html.startsWith('<?', lt)) return lt;
  const end = html.indexOf('?>', lt + 2);
  return end === -1 ? html.length : end + 2;
}

/** Skip inner HTML until matching outer closing tag */
function skipBalancedSubtree(html: string, htmlLower: string, from: number, root: string): number {
  const stack = [root];
  let idx = from;

  while (stack.length > 0 && idx < html.length) {
    const lt = html.indexOf('<', idx);
    if (lt === -1) return html.length;
    idx = lt;

    if (html.startsWith('</', lt)) {
      let p = lt + 2;
      p = skipWs(html, p);
      const [cname, pn] = readTagName(html, p);
      p = pn;
      const gt = html.indexOf('>', p);
      idx = gt === -1 ? html.length : gt + 1;
      if (!cname || !stack.includes(cname)) continue;
      while (stack.length && stack[stack.length - 1] !== cname) stack.pop();
      if (!stack.length) continue;
      stack.pop();
      if (!stack.length) return idx;
      continue;
    }

    if (html.startsWith('<!--', lt)) {
      idx = skipComment(html, lt);
      continue;
    }
    if (html.startsWith('<?', lt)) {
      idx = skipPi(html, lt);
      continue;
    }
    if (html.startsWith('<![CDATA[', lt)) {
      const end = html.indexOf(']]>', lt + 9);
      idx = end === -1 ? html.length : end + 3;
      continue;
    }
    if (html[lt + 1] === '!') {
      idx = skipBangBlock(html, lt);
      continue;
    }

    const pws = skipWs(html, lt + 1);
    const [nm, pnAfterName] = readTagName(html, pws);
    if (!nm) {
      idx = lt + 1;
      continue;
    }

    const tagLower = nm;
    idx = skipRawElement(htmlLower, html, lt, tagLower);
    if (idx !== lt) continue;

    const [, openEnd] = readAttributes(html, pnAfterName);
    idx = openEnd;

    const frag = html.slice(lt, openEnd).trimEnd();
    const selfClosing = frag.endsWith('/>');
    const voidOrSelf = VOID_TAGS.has(tagLower) || selfClosing;

    if (!voidOrSelf) stack.push(tagLower);
  }

  return idx;
}

function handleCloseTag(nm: string, emitted: string[], out: string[]): void {
  if (!emitted.includes(nm)) return;
  while (emitted.length && emitted[emitted.length - 1] !== nm) {
    const t = emitted.pop()!;
    if (!VOID_TAGS.has(t)) out.push(`</${t}>`);
  }
  if (!emitted.length) return;
  emitted.pop();
  if (!VOID_TAGS.has(nm)) out.push(`</${nm}>`);
}

export function sanitizeBlogHtmlAllowlist(raw: string): string {
  if (!raw.trim()) return '';

  const s = raw
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

  const htmlLower = s.toLowerCase();
  const out: string[] = [];
  const emitted: string[] = [];
  let i = 0;

  while (i < s.length) {
    const lt = s.indexOf('<', i);
    if (lt === -1) {
      out.push(s.slice(i));
      break;
    }
    out.push(s.slice(i, lt));

    let pos = lt;

    if (s.startsWith('</', pos)) {
      pos += 2;
      pos = skipWs(s, pos);
      const [cname, afterName] = readTagName(s, pos);
      let p = afterName;
      p = skipWs(s, p);
      const gt = s.indexOf('>', p);
      const next = gt === -1 ? s.length : gt + 1;
      if (cname) handleCloseTag(cname, emitted, out);
      i = next;
      continue;
    }

    if (s.startsWith('<!--', pos)) {
      i = skipComment(s, pos);
      continue;
    }
    if (s.startsWith('<?', pos)) {
      i = skipPi(s, pos);
      continue;
    }
    if (s.startsWith('<![CDATA[', pos)) {
      const end = s.indexOf(']]>', pos + 9);
      i = end === -1 ? s.length : end + 3;
      continue;
    }
    if (s[pos + 1] === '!') {
      i = skipBangBlock(s, pos);
      continue;
    }

    const pws = skipWs(s, pos + 1);
    const [nm, pnAfterName] = readTagName(s, pws);
    if (!nm) {
      out.push('&lt;');
      i = pos + 1;
      continue;
    }

    const tagLower = nm;
    let idx = skipRawElement(htmlLower, s, pos, tagLower);
    if (idx !== pos) {
      i = idx;
      continue;
    }

    const [attrs, openEnd] = readAttributes(s, pnAfterName);
    const frag = s.slice(pos, openEnd).trimEnd();
    const selfClosing = frag.endsWith('/>');
    const voidOrSelf = VOID_TAGS.has(tagLower) || selfClosing;

    if (!ALLOWED_TAGS.has(tagLower)) {
      i = voidOrSelf ? openEnd : skipBalancedSubtree(s, htmlLower, openEnd, tagLower);
      continue;
    }

    const serialized = serializeOpenTag(tagLower, attrs);
    if (serialized) out.push(serialized);
    if (!voidOrSelf) emitted.push(tagLower);

    i = openEnd;
  }

  while (emitted.length) {
    const t = emitted.pop()!;
    if (!VOID_TAGS.has(t)) out.push(`</${t}>`);
  }

  return out.join('');
}