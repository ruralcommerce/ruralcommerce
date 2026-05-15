import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { BlockData } from '@/lib/editor-types';
import { parseJsonArray } from '@/lib/page-layout-runtime';

const STREAM_TYPES = new Set<string>([
  'layout-section',
  'layout-columns',
  'layout-divider',
  'heading-block',
  'free-text',
  'rich-text',
  'image',
  'spacer',
  'button-block',
  'video-embed',
  'map-embed',
  'accordion-block',
  'tabs-simple',
  'progress-block',
  'pricing-table',
  'rich-html',
]);

function ensureLocaleHref(locale: string, href: string): string {
  const t = href.trim();
  if (!t.startsWith('/') || t.startsWith('//') || /^https?:\/\//i.test(t)) return t;
  if (/^\/(es|pt-BR|en)(\/|$)/.test(t)) return t;
  return `/${locale}${t === '/' ? '' : t}`;
}

function wrap(block: BlockData, className: string, inner: ReactNode, sectionStyle?: CSSProperties) {
  const p = block.props as Record<string, unknown>;
  const hideMd =
    p.hideOnMobile === true ||
    String(p.hideOnMobile).toLowerCase() === 'true' ||
    String(p.hideOnMobile) === '1';
  const merged: CSSProperties = { ...(sectionStyle ?? {}) };
  const mt = String(p.marginTop ?? '').trim();
  const mb = String(p.marginBottom ?? '').trim();
  if (mt) merged.marginTop = mt;
  if (mb) merged.marginBottom = mb;
  const op = String(p.opacity ?? '').trim();
  if (op !== '' && !Number.isNaN(Number(op))) merged.opacity = Number(op);
  const bx = String(p.boxShadow ?? '').trim();
  if (bx) merged.boxShadow = bx;
  const anim = String(p.animationClass ?? '').trim();
  const cls = [className, hideMd ? 'max-md:hidden' : '', anim].filter(Boolean).join(' ');
  return (
    <section
      key={block.id}
      data-editor-block-id={block.id}
      data-editor-section={block.type}
      className={cls}
      style={Object.keys(merged).length ? merged : undefined}
    >
      {inner}
    </section>
  );
}

function sanitizeMapEmbedSrc(raw: string): string | null {
  const t = raw.trim();
  if (!t || !/^https:\/\//i.test(t)) return null;
  try {
    const url = new URL(t);
    const h = url.hostname.toLowerCase();
    if (h === 'localhost' || h.endsWith('.local')) return null;
    const googleOk = /^([\w-]+\.)*google\.[a-z.]+$/i.test(h) || /^([\w-]+\.)*gstatic\.com$/i.test(h);
    const osmOk = h.endsWith('openstreetmap.org');
    const wikiOk = h.endsWith('wikimedia.org');
    return googleOk || osmOk || wikiOk ? t : null;
  } catch {
    return null;
  }
}

function youtubeEmbedUrl(raw: string): string | null {
  const u = raw.trim();
  if (!u) return null;
  try {
    const url = new URL(u);
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace(/^\//, '');
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (url.hostname.includes('youtube.com')) {
      const id = url.searchParams.get('v');
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (url.hostname.includes('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

function sanitizeRichHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

export function SiteStreamBlocks({
  blocks,
  locale,
  getSectionOrder,
}: {
  blocks: BlockData[];
  locale: string;
  getSectionOrder?: (block: BlockData) => number | undefined;
}) {
  const slice = blocks.filter((b) => STREAM_TYPES.has(b.type));
  if (slice.length === 0) return null;

  return (
    <>
      {slice.map((block) => {
        const p = block.props as Record<string, unknown>;
        const ord = getSectionOrder?.(block);
        const sectionStyle: CSSProperties | undefined = ord !== undefined ? { order: ord } : undefined;

        switch (block.type) {
          case 'spacer': {
            const h = String(p.height ?? '24px');
            return wrap(block, 'shrink-0', <div style={{ height: h }} aria-hidden />, sectionStyle);
          }
          case 'layout-divider': {
            const thickness = String(p.thickness ?? '1px');
            const color = String(p.color ?? '#e2e8f0');
            const my = String(p.marginY ?? '16px');
            return wrap(
              block,
              'shrink-0',
              <div style={{ marginTop: my, marginBottom: my }} aria-hidden>
                <div style={{ height: thickness, backgroundColor: color }} />
              </div>,
              sectionStyle
            );
          }
          case 'heading-block': {
            const level = Math.min(6, Math.max(1, Number(p.level) || 2));
            const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
            const Tag = tags[level - 1];
            const align = String(p.align ?? 'left');
            const color = String(p.color ?? '#0f172a');
            const text = String(p.text ?? '');
            return wrap(
              block,
              'shrink-0 px-4 sm:px-6',
              <Tag className="font-bold tracking-tight" style={{ textAlign: align as CSSProperties['textAlign'], color }}>
                {text}
              </Tag>,
              sectionStyle
            );
          }
          case 'free-text': {
            const content = String(p.content ?? '');
            const fontSize = String(p.fontSize ?? '16px');
            const textAlign = String(p.textAlign ?? 'left');
            const maxWidth = String(p.maxWidth ?? '');
            const py = String(p.paddingY ?? '');
            return wrap(
              block,
              'shrink-0 px-4 sm:px-6',
              <div
                className="max-w-none text-slate-800"
                style={{
                  fontSize,
                  textAlign: textAlign as CSSProperties['textAlign'],
                  maxWidth: maxWidth || undefined,
                  paddingTop: py || undefined,
                  paddingBottom: py || undefined,
                }}
              >
                <p className="whitespace-pre-wrap">{content}</p>
              </div>,
              sectionStyle
            );
          }
          case 'rich-text': {
            const raw = String(p.contentHtml ?? '');
            const html = sanitizeRichHtml(raw);
            const maxWidth = String(p.maxWidth ?? '');
            const py = String(p.paddingY ?? '');
            return wrap(
              block,
              'shrink-0 px-4 sm:px-6',
              <div
                className="max-w-none space-y-3 text-slate-800 [&_a]:text-blue-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                style={{
                  maxWidth: maxWidth || undefined,
                  paddingTop: py || undefined,
                  paddingBottom: py || undefined,
                }}
                dangerouslySetInnerHTML={{ __html: html }}
              />,
              sectionStyle
            );
          }
          case 'image': {
            const src = String(p.src ?? '');
            const alt = String(p.alt ?? '');
            const align = String(p.align ?? 'center');
            const caption = String(p.caption ?? '');
            const linkUrl = String(p.linkUrl ?? '').trim();
            const maxW = String(p.maxWidth ?? '100%');
            const img = src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt} className="h-auto w-full rounded-lg object-contain" style={{ maxHeight: '70vh' }} />
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-16 text-center text-sm text-slate-500">
                Imagen (sin URL)
              </div>
            );
            const body = (
              <figure className="mx-auto space-y-2" style={{ maxWidth: maxW }}>
                {linkUrl ? (
                  /^https?:\/\//i.test(linkUrl) ? (
                    <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block">
                      {img}
                    </a>
                  ) : (
                    <Link href={ensureLocaleHref(locale, linkUrl)} className="block">
                      {img}
                    </Link>
                  )
                ) : (
                  img
                )}
                {caption ? <figcaption className="text-center text-sm text-slate-600">{caption}</figcaption> : null}
              </figure>
            );
            return wrap(
              block,
              `shrink-0 px-4 sm:px-6 ${align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'}`,
              body,
              sectionStyle
            );
          }
          case 'layout-section': {
            const maxWidth = String(p.maxWidth ?? '72rem');
            const padding = String(p.padding ?? '1.5rem 1rem');
            const bg = String(p.backgroundColor ?? 'transparent');
            const border = Boolean(p.showBorder);
            return wrap(
              block,
              `shrink-0 ${border ? 'border-y border-slate-200' : ''}`,
              <div
                className="mx-auto w-full"
                style={{ maxWidth, padding, backgroundColor: bg === 'transparent' ? undefined : bg }}
              >
                {p.innerLabel ? (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{String(p.innerLabel)}</p>
                ) : null}
                {p.bodyText ? (
                  <div className="max-w-none whitespace-pre-wrap text-slate-800">{String(p.bodyText)}</div>
                ) : null}
              </div>,
              sectionStyle
            );
          }
          case 'layout-columns': {
            const layout = String(p.layout ?? '50-50');
            const gap = String(p.gap ?? '1.5rem');
            const left = String(p.leftText ?? '');
            const right = String(p.rightText ?? '');
            const third = String(p.thirdText ?? '');
            const gtc = String(p.gridTemplateColumns ?? '').trim();
            const builtIn =
              layout === '33-33-34'
                ? 'repeat(3, minmax(0, 1fr))'
                : layout === '33-67'
                  ? 'minmax(0, 1fr) minmax(0, 2fr)'
                  : layout === '67-33'
                    ? 'minmax(0, 2fr) minmax(0, 1fr)'
                    : 'repeat(2, minmax(0, 1fr))';
            const cols = gtc || builtIn;
            const showThird = layout === '33-33-34' || gtc.split(/\s+/).filter(Boolean).length > 2;
            return wrap(
              block,
              'shrink-0 px-4 sm:px-6',
              <>
                <div className="flex flex-col gap-4 md:hidden">
                  <div className="whitespace-pre-wrap text-slate-800">{left}</div>
                  <div className="whitespace-pre-wrap text-slate-800">{right}</div>
                  {showThird ? <div className="whitespace-pre-wrap text-slate-800">{third}</div> : null}
                </div>
                <div className="hidden gap-4 md:grid" style={{ gap, gridTemplateColumns: cols }}>
                  <div className="min-w-0 whitespace-pre-wrap text-slate-800">{left}</div>
                  <div className="min-w-0 whitespace-pre-wrap text-slate-800">{right}</div>
                  {showThird ? <div className="min-w-0 whitespace-pre-wrap text-slate-800">{third}</div> : null}
                </div>
              </>,
              sectionStyle
            );
          }
          case 'button-block': {
            const label = String(p.label ?? 'Botón');
            const href = String(p.href ?? '#');
            const iconChar = String(p.iconChar ?? '').trim();
            const bg = String(p.backgroundColor ?? '#009179');
            const fg = String(p.textColor ?? '#ffffff');
            const hBg = String(p.hoverBackgroundColor ?? '').trim();
            const hFg = String(p.hoverTextColor ?? '').trim();
            const radius = String(p.borderRadius ?? '0.5rem');
            const bs = String(p.boxShadow ?? '').trim();
            const op = String(p.opacity ?? '').trim();
            const cls = String(p.variant ?? 'solid') === 'outline' ? 'border-2 bg-transparent' : '';
            const useCustomHover = Boolean(hBg || hFg);
            const btnStyle: CSSProperties = {
              backgroundColor: cls ? undefined : bg,
              color: fg,
              borderColor: bg,
              borderRadius: radius,
              boxShadow: bs || undefined,
              opacity: op !== '' && !Number.isNaN(Number(op)) ? Number(op) : undefined,
              ...(useCustomHover
                ? ({
                    ['--rc-btn-h-bg' as string]: hBg || bg,
                    ['--rc-btn-h-fg' as string]: hFg || fg,
                  } as CSSProperties)
                : {}),
            };
            const labelInner = (
              <>
                {iconChar ? <span className="mr-2 text-base leading-none">{iconChar}</span> : null}
                {label}
              </>
            );
            const hoverClass = useCustomHover ? 'rc-stream-btn--hover-colors' : 'hover:opacity-90';
            const inner = /^https?:\/\//i.test(href) ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-1 px-6 py-3 text-sm font-semibold transition ${cls} ${hoverClass}`}
                style={btnStyle}
              >
                {labelInner}
              </a>
            ) : (
              <Link
                href={ensureLocaleHref(locale, href)}
                className={`inline-flex items-center justify-center gap-1 px-6 py-3 text-sm font-semibold transition ${cls} ${hoverClass}`}
                style={btnStyle}
              >
                {labelInner}
              </Link>
            );
            return wrap(block, 'shrink-0 px-4 sm:px-6', inner, sectionStyle);
          }
          case 'video-embed': {
            const url = String(p.url ?? '');
            const embed = youtubeEmbedUrl(url);
            return wrap(
              block,
              'shrink-0 px-4 sm:px-6',
              embed ? (
                <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-xl bg-black shadow">
                  <iframe title="Video" src={embed} className="h-full w-full border-0" allowFullScreen />
                </div>
              ) : (
                <p className="text-sm text-slate-500">URL de vídeo no soportada (YouTube / Vimeo)</p>
              ),
              sectionStyle
            );
          }
          case 'map-embed': {
            const src = sanitizeMapEmbedSrc(String(p.embedSrc ?? ''));
            const title = String(p.title ?? 'Mapa');
            const height = String(p.height ?? '360px').trim() || '360px';
            const radius = String(p.borderRadius ?? '0.75rem').trim() || '0.75rem';
            return wrap(
              block,
              'shrink-0 px-4 sm:px-6',
              src ? (
                <div
                  className="w-full max-w-5xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-md"
                  style={{ borderRadius: radius, height }}
                >
                  <iframe title={title} src={src} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  URL de mapa inválida ou não permitida. Use HTTPS a partir de Google Maps ou OpenStreetMap (código de incorporar).
                </p>
              ),
              sectionStyle
            );
          }
          case 'accordion-block': {
            const items = parseJsonArray<{ title?: string; body?: string }>(String(p.itemsJson ?? '[]'), []);
            return wrap(
              block,
              'shrink-0 space-y-2 px-4 sm:px-6',
              <div className="mx-auto max-w-3xl">
                {items.map((it, i) => (
                  <details key={i} className="group rounded-lg border border-slate-200 bg-white px-4 py-2">
                    <summary className="cursor-pointer list-none font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
                      {it.title || `Item ${i + 1}`}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{it.body}</p>
                  </details>
                ))}
              </div>,
              sectionStyle
            );
          }
          case 'tabs-simple': {
            const a = String(p.tab1Label ?? 'Aba 1');
            const b = String(p.tab2Label ?? 'Aba 2');
            const t1 = String(p.tab1Text ?? '');
            const t2 = String(p.tab2Text ?? '');
            return wrap(
              block,
              'shrink-0 px-4 sm:px-6',
              <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex gap-2 border-b border-slate-200 pb-2 text-sm font-semibold text-slate-600">
                  <span className="rounded-md bg-blue-50 px-3 py-1 text-blue-800">{a}</span>
                  <span className="rounded-md px-3 py-1">{b}</span>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="whitespace-pre-wrap text-sm text-slate-800">{t1}</div>
                  <div className="whitespace-pre-wrap text-sm text-slate-600">{t2}</div>
                </div>
              </div>,
              sectionStyle
            );
          }
          case 'progress-block': {
            const value = Math.min(100, Math.max(0, Number(p.value) || 0));
            const label = String(p.label ?? '');
            const color = String(p.barColor ?? '#009179');
            return wrap(
              block,
              'shrink-0 px-4 sm:px-6',
              <div className="mx-auto max-w-xl">
                {label ? <p className="mb-1 text-sm font-medium text-slate-800">{label}</p> : null}
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
                </div>
                <p className="mt-1 text-right text-xs text-slate-500">{value}%</p>
              </div>,
              sectionStyle
            );
          }
          case 'pricing-table': {
            const plans = parseJsonArray<{ name?: string; price?: string; featuresJson?: string; ctaText?: string; ctaUrl?: string }>(
              String(p.plansJson ?? '[]'),
              []
            );
            return wrap(
              block,
              'shrink-0 px-4 sm:px-6',
              <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
                {plans.map((plan, i) => {
                  const feats = parseJsonArray<string>(plan.featuresJson ?? '[]', []);
                  return (
                    <div key={i} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                      <p className="mt-2 text-2xl font-bold text-[#071F5E]">{plan.price}</p>
                      <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                        {feats.map((f, j) => (
                          <li key={j}>• {f}</li>
                        ))}
                      </ul>
                      {plan.ctaText ? (
                        <Link
                          href={ensureLocaleHref(locale, String(plan.ctaUrl ?? '#'))}
                          className="mt-6 block rounded-lg bg-[#009179] py-2 text-center text-sm font-semibold text-white"
                        >
                          {plan.ctaText}
                        </Link>
                      ) : null}
                    </div>
                  );
                })}
              </div>,
              sectionStyle
            );
          }
          case 'rich-html': {
            const raw = String(p.htmlContent ?? '');
            const html = sanitizeRichHtml(raw);
            return wrap(
              block,
              'shrink-0 px-4 sm:px-6',
              <div
                className="max-w-4xl space-y-3 text-base leading-relaxed text-slate-800 [&_a]:text-blue-600 [&_a]:underline [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_p]:text-slate-700 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: html }}
              />,
              sectionStyle
            );
          }
          default:
            return null;
        }
      })}
    </>
  );
}

export function isStreamBlockType(type: string): boolean {
  return STREAM_TYPES.has(type);
}
