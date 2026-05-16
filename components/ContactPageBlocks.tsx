'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Instagram, Linkedin, Facebook, Youtube, Phone, Mail } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { parseSocialLinksJson } from '@/lib/social-links';
import { SocialLinkIcon } from '@/components/SocialLinkIcon';

const ContactTerritoryMap = dynamic(() => import('@/components/ContactTerritoryMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[280px] w-full animate-pulse bg-slate-700/25 md:min-h-[360px]" aria-hidden />
  ),
});

const SUPPORTED = ['es', 'pt-BR', 'en'] as const;
type Loc = (typeof SUPPORTED)[number];

function detectLocale(pathname: string): Loc {
  const seg = pathname.split('/').filter(Boolean)[0];
  return (SUPPORTED.find((l) => l === seg) ?? 'es') as Loc;
}

function localizeHref(href: string, locale: Loc): string {
  if (!href || href.startsWith('#') || /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return href;
  }
  if (!href.startsWith('/')) return href;
  const stripped = href.replace(/^\/(es|pt-BR|en)(?=\/|#|$)/, '');
  const normalized = stripped.length > 0 ? stripped : '/';
  if (normalized.startsWith('/#')) return `/${locale}${normalized.slice(1)}`;
  if (normalized === '/') return `/${locale}`;
  return `/${locale}${normalized}`;
}

export type ContactHeroSplitProps = {
  editorBlockId?: string;
  titleLine1?: string;
  titleLine2?: string;
  /** @deprecated usar titleLine1 + titleLine2; ainda suportado como fallback */
  title?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaSubtext?: string;
  heroImage?: string;
  accentCircleColor?: string;
};

export function ContactHeroSplit(props: ContactHeroSplitProps) {
  const pathname = usePathname();
  const locale = detectLocale(pathname);
  const { editorBlockId } = props;
  const {
    titleLine1 = '',
    titleLine2 = '',
    title: legacyTitle = '',
    description = '',
    ctaText = '',
    ctaUrl = '#',
    ctaSubtext = '',
    heroImage = '',
    accentCircleColor = '#071F5E',
  } = props;

  let line1 = titleLine1.trim();
  let line2 = titleLine2.trim();
  if (!line1 && !line2 && legacyTitle.trim()) {
    const parts = legacyTitle.split(/\n/).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      line1 = parts[0] ?? '';
      line2 = parts.slice(1).join(' ').trim();
    } else {
      const t = legacyTitle.trim();
      const idx = t.toLowerCase().indexOf(' hacia ');
      if (idx > 0) {
        line1 = t.slice(0, idx).trim();
        line2 = t.slice(idx).trim();
      } else {
        line1 = t;
      }
    }
  }

  const ctaHref = localizeHref(ctaUrl || '#', locale);
  const isExternal = /^https?:\/\//i.test(ctaHref);

  return (
    <section
      className="scroll-mt-24 bg-[#F5F7FA] px-4 pb-12 pt-24 sm:pt-28 md:px-8 md:pb-16 md:pt-32"
      data-editor-section="contact-hero"
      data-editor-block-id={editorBlockId}
    >
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-center text-2xl font-bold leading-snug text-[#071F5E] sm:mb-10 sm:text-[1.65rem] md:mb-12 md:text-3xl lg:text-[2rem]">
          {line1 ? <span className="block">{line1}</span> : null}
          {line2 ? <span className="mt-1 block sm:mt-1.5">{line2}</span> : null}
        </h1>
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
          <div className="relative mx-auto w-full max-w-md shrink-0 overflow-visible pl-2 pt-2 sm:pl-3 sm:pt-3 md:mx-0 md:max-w-none md:justify-self-start md:pl-3 md:pt-3 lg:pl-4 lg:pt-4">
            <div className="relative aspect-square w-full">
              <div
                className="pointer-events-none absolute left-[11%] top-[11%] z-10 aspect-square w-[min(30%,7.25rem)] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_10px_28px_rgba(15,23,42,0.12)] sm:left-[12%] sm:top-[12%] sm:w-[min(28%,7.75rem)] md:left-[14%] md:top-[14%] md:w-[min(26%,8.25rem)]"
                style={{ backgroundColor: accentCircleColor }}
                aria-hidden
              />
              <div className="relative z-0 h-full min-h-[280px] overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-[6px_14px_0_rgba(148,163,184,0.35)] md:min-h-[320px]">
                {heroImage ? (
                  /^https?:\/\//i.test(heroImage) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={heroImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Image src={heroImage} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  )
                ) : (
                  <div
                    className="h-full w-full min-h-[280px] md:min-h-[320px]"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, #e8e8e8 25%, transparent 25%), linear-gradient(-45deg, #e8e8e8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8e8e8 75%), linear-gradient(-45deg, transparent 75%, #e8e8e8 75%)',
                      backgroundSize: '24px 24px',
                      backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
                      backgroundColor: '#f0f0f0',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-6 text-center md:text-left">
            <p className="text-lg leading-relaxed text-slate-700 md:text-xl">{description}</p>
            <div className="flex flex-col items-center gap-2 md:items-start">
              {isExternal ? (
                <a
                  href={ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#009179] px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-[#007a66]"
                >
                  <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
                  {ctaText}
                </a>
              ) : (
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-2 rounded-full bg-[#009179] px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-[#007a66]"
                >
                  <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
                  {ctaText}
                </Link>
              )}
              {ctaSubtext ? <p className="text-sm text-slate-500">{ctaSubtext}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PROFILE_KEYS = ['productor', 'b2b', 'gobierno', 'inversor'] as const;

export type ContactFormSplitProps = {
  editorBlockId?: string;
  leftPanelBg?: string;
  phone?: string;
  email?: string;
  /** Objeto JSON opcional para sobrescrever textos do formulário (chaves = contactForm no i18n). */
  formCopyJson?: string;
};

function parseFormCopyOverrides(raw?: string): Record<string, string> {
  if (!raw?.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [k, String(v ?? '')])
    );
  } catch {
    return {};
  }
}

export function ContactFormSplit(props: ContactFormSplitProps) {
  const t = useTranslations('contactForm');
  const copyOverrides = useMemo(() => parseFormCopyOverrides(props.formCopyJson), [props.formCopyJson]);
  const tr = (key: string) => copyOverrides[key] ?? t(key);
  const phoneDisplay = String(props.phone ?? '').trim() || '+598 XXX XXX XX';
  const emailDisplay = String(props.email ?? '').trim() || 'info@ruralcommerceglobal.com';
  const telHref = `tel:${phoneDisplay.replace(/[^\d+]/g, '')}`;
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const fd = new FormData(form);

      if (String(fd.get('_companyWebsite') ?? '').trim()) {
        setStatus('success');
        return;
      }

      setErrorKey(null);
      setStatus('sending');

      const payload = {
        subject: String(fd.get('subject') ?? ''),
        name: String(fd.get('name') ?? ''),
        organization: String(fd.get('organization') ?? ''),
        email: String(fd.get('email') ?? ''),
        whatsapp: String(fd.get('whatsapp') ?? ''),
        country: String(fd.get('country') ?? ''),
        region: String(fd.get('region') ?? ''),
        profile: String(fd.get('profile') ?? ''),
        message: String(fd.get('message') ?? ''),
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { ok?: boolean; key?: string };

        if (!res.ok || !data.ok) {
          const knownKeys = new Set(['missingFields', 'invalidEmail', 'config', 'sendFailed', 'invalidPayload']);
          const key = data.key && knownKeys.has(data.key) ? data.key : 'sendFailed';
          setErrorKey(key);
          setStatus('error');
          return;
        }

        setStatus('success');
        form.reset();
      } catch {
        setErrorKey('network');
        setStatus('error');
      }
    },
    [],
  );

  return (
    <section
      className="bg-[#F5F7FA] px-4 pb-9 pt-2 md:px-8 md:pb-12"
      data-editor-section="contact-form"
      data-editor-block-id={props.editorBlockId}
    >
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_16px_40px_-14px_rgba(7,31,94,0.1)]">
          <div className="p-3.5 sm:p-4 md:p-4 lg:p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-stretch md:gap-5">
              <aside
                className="relative flex min-h-[200px] flex-col overflow-hidden rounded-xl px-5 py-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_32px_-8px_rgba(0,0,0,0.35)] sm:px-5 sm:py-5 md:min-h-0 md:px-5 md:py-6"
                style={{ backgroundColor: props.leftPanelBg || '#071F5E' }}
              >
                <div className="relative z-[1]">
                  <h2 className="text-lg font-bold md:text-xl">{tr('leftTitle')}</h2>
                  <p className="mt-1.5 text-sm leading-snug text-white/85 md:text-[0.9375rem]">{tr('leftSubtitle')}</p>
                  <div className="mt-4 space-y-2.5 text-sm md:mt-5 md:text-[0.9375rem]">
                    <p className="flex items-start gap-2.5">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/85" aria-hidden />
                      <a href={telHref} className="underline decoration-white/40 underline-offset-2 hover:decoration-white">
                        {phoneDisplay}
                      </a>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/85" aria-hidden />
                      <a href={`mailto:${emailDisplay}`} className="break-all underline decoration-white/40 underline-offset-2 hover:decoration-white">
                        {emailDisplay}
                      </a>
                    </p>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl" aria-hidden>
                  <span className="absolute -bottom-16 -left-14 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
                  <span className="absolute -bottom-6 left-0 h-32 w-32 rounded-full bg-white/14 blur-2xl" />
                  <span className="absolute -bottom-12 -right-8 h-[13rem] w-[13rem] rounded-full bg-teal-400/50 blur-3xl" />
                  <span className="absolute bottom-0 right-2 h-40 w-40 rounded-full bg-violet-300/45 blur-2xl" />
                  <span className="absolute bottom-6 right-[28%] h-24 w-24 rounded-full bg-cyan-200/35 blur-xl" />
                </div>
              </aside>

              <form
                className="relative flex min-w-0 flex-col border-t border-slate-100 pt-4 md:border-t-0 md:pt-0 md:pl-1 lg:pl-3"
                onSubmit={onSubmit}
                noValidate
              >
              <input
                type="text"
                name="_companyWebsite"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 h-0 w-0 opacity-0"
              />
              {status === 'success' ? (
                <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
                  {tr('submitSuccess')}
                </p>
              ) : null}
              {status === 'error' && errorKey ? (
                <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
                  {tr(`errors.${errorKey}`)}
                </p>
              ) : null}
              <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label={tr('labelSubject')} htmlFor="contact-subject" />
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    placeholder={tr('placeholderSubject')}
                    className={inputClass}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <Field label={tr('labelName')} htmlFor="contact-name" />
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder={tr('placeholderName')}
                    className={inputClass}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <Field label={tr('labelOrganization')} htmlFor="contact-organization" />
                  <input
                    id="contact-organization"
                    name="organization"
                    type="text"
                    placeholder={tr('placeholderOrganization')}
                    className={inputClass}
                    autoComplete="organization"
                  />
                </div>

                <div>
                  <Field label={tr('labelEmail')} htmlFor="contact-email" />
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder={t('placeholderEmail')}
                    className={inputClass}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <Field label={tr('labelWhatsApp')} htmlFor="contact-whatsapp" />
                  <input
                    id="contact-whatsapp"
                    name="whatsapp"
                    type="tel"
                    placeholder={tr('placeholderWhatsApp')}
                    className={inputClass}
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <Field label={tr('labelCountry')} htmlFor="contact-country" />
                  <input
                    id="contact-country"
                    name="country"
                    type="text"
                    placeholder={tr('placeholderCountry')}
                    className={inputClass}
                    autoComplete="country-name"
                  />
                </div>

                <div>
                  <Field label={tr('labelRegion')} htmlFor="contact-region" />
                  <input
                    id="contact-region"
                    name="region"
                    type="text"
                    placeholder={tr('placeholderRegion')}
                    className={inputClass}
                    autoComplete="address-level1"
                  />
                </div>

                <div className="md:col-span-2">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">{tr('profileLabel')}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {PROFILE_KEYS.map((key, i) => (
                      <label key={key} className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                        <input
                          type="radio"
                          name="profile"
                          value={key}
                          defaultChecked={i === 0}
                          className="accent-[#071F5E]"
                        />
                        {tr(`profiles.${key}`)}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-px block text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="contact-message">
                    {tr('messageLabel')}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={3}
                    placeholder={tr('messagePlaceholder')}
                    className={`${inputClass} resize-none py-1 leading-snug`}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end pt-0.5 md:mt-5">
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="rounded-md bg-[#071F5E] px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-[#0a2a7a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'sending' ? tr('submitSending') : tr('submitLabel')}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const inputClass =
  'w-full border-0 border-b border-slate-300 bg-transparent px-0 py-1 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-[#071F5E]';

function Field({ label, htmlFor }: { label?: string; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-px block text-xs font-medium uppercase tracking-wide text-slate-500">
      {label}
    </label>
  );
}

function hasUsableTerritoriesGeoJson(raw: unknown): boolean {
  if (typeof raw !== 'string' || !raw.trim()) return false;
  try {
    const d = JSON.parse(raw) as { type?: string; features?: unknown[] };
    return d?.type === 'FeatureCollection' && Array.isArray(d.features) && d.features.length > 0;
  } catch {
    return false;
  }
}

export type ContactMapSplitProps = {
  editorBlockId?: string;
  backgroundColor?: string;
  title?: string;
  body?: string;
  mapEmbedUrl?: string;
  /** FeatureCollection GeoJSON: properties.category = "atendimento" | "intervencao" (ou "intervención"); geometrias Point ou Polygon */
  territoriesGeoJson?: string;
};

export function ContactMapSplit(props: ContactMapSplitProps) {
  const t = useTranslations('contactMap');
  const bg = props.backgroundColor || '#071F5E';
  const src = props.mapEmbedUrl?.trim() || '';
  const geo = typeof props.territoriesGeoJson === 'string' ? props.territoriesGeoJson : '';
  const useTerritoryMap = hasUsableTerritoriesGeoJson(geo);

  return (
    <section
      className="py-14 md:py-20"
      style={{ backgroundColor: bg }}
      data-editor-section="contact-map"
      data-editor-block-id={props.editorBlockId}
    >
      <div className="mx-auto grid max-w-5xl gap-10 px-4 md:grid-cols-2 md:items-center md:gap-12 md:px-8">
        <div className="text-white">
          <h2 className="text-2xl font-bold md:text-3xl">{props.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-white/90 md:text-lg">{props.body}</p>
        </div>
        <div className="relative min-h-[280px] overflow-hidden rounded-xl bg-slate-800/30 shadow-lg ring-1 ring-white/10 md:min-h-[360px]">
          {useTerritoryMap ? (
            <>
              <ContactTerritoryMap geoJsonString={geo} />
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 z-[500] flex flex-wrap gap-x-4 gap-y-2 rounded-b-xl bg-slate-950/80 px-3 py-2.5 text-[11px] leading-snug text-white/95 backdrop-blur-sm md:gap-x-5 md:text-xs"
                role="group"
                aria-label={`${t('legendAtendimento')}; ${t('legendIntervencion')}`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-teal-200/80 bg-teal-400 shadow-sm ring-1 ring-black/15"
                    aria-hidden
                  />
                  {t('legendAtendimento')}
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-fuchsia-200/80 bg-fuchsia-500 shadow-sm ring-1 ring-black/15"
                    aria-hidden
                  />
                  {t('legendIntervencion')}
                </span>
              </div>
            </>
          ) : src ? (
            <iframe title={t('iframeTitle')} src={src} className="h-full min-h-[280px] w-full border-0 md:min-h-[360px]" loading="lazy" />
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center text-white/60 md:min-h-[360px]">{t('emptyMap')}</div>
          )}
        </div>
      </div>
    </section>
  );
}

export type ContactSocialStripProps = {
  editorBlockId?: string;
  pageBg?: string;
  title?: string;
  titleColor?: string;
  socialLinksJson?: string;
};

export function ContactSocialStrip(props: ContactSocialStripProps) {
  const links = parseSocialLinksJson(props.socialLinksJson);
  const color = props.titleColor || '#009179';

  return (
    <section
      className="py-12 md:py-16"
      style={{ backgroundColor: props.pageBg || '#F5F7FA' }}
      data-editor-section="contact-social"
      data-editor-block-id={props.editorBlockId}
    >
      <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
        <h2 className="text-xl font-semibold md:text-2xl" style={{ color }}>
          {props.title}
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-10">
          {links
            .filter((item) => item.href.trim())
            .map((item) => (
              <a
                key={item.href + item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border-2 p-3 transition hover:opacity-80"
                style={{ borderColor: color, color }}
                aria-label={item.label}
                title={item.label}
              >
                <SocialLinkIcon label={item.label} className="h-9 w-9" strokeWidth={1.25} />
              </a>
            ))}
        </div>
      </div>
    </section>
  );
}
