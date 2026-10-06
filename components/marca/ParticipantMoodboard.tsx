'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import {
  MARCA_PALETTE_META,
  MARCA_TONES,
  type MarcaPublicImage,
  type MarcaTone,
} from '@/lib/marca/types';

const SHEET_W = 850;
const SHEET_H = 978;
const SHEET_RATIO = SHEET_W / SHEET_H;

const STYLE_CAPTIONS_ES = [
  'Trazos orgánicos y fluidos',
  'Geometría inspirada en la naturaleza',
  'Tipografía de alto contraste',
  'Trazos orgánicos y fluídos',
  'Tipografía expresiva y formas redondeadas',
  'Contrastes fuertes y colores intensos',
  'Símbolos simples con inspiración natural',
  'Estilo gráfico vibrante y llamativo',
];

const STYLE_CAPTIONS_PT = [
  'Traços orgânicos e fluidos',
  'Geometria inspirada na natureza',
  'Tipografia de alto contraste',
  'Traços orgânicos e fluidos',
  'Tipografia expressiva e formas arredondadas',
  'Contrastes fortes e cores intensas',
  'Símbolos simples com inspiração natural',
  'Estilo gráfico vibrante e chamativo',
];

function isTone(v: string): v is MarcaTone {
  return (MARCA_TONES as string[]).includes(v);
}

function ArrowIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/marca/ui/arrow-up-right.svg" alt="" width={18} height={18} />
  );
}

function SafeImg({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`bg-[#DDE3EA] ${className || ''}`} aria-hidden />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />
  );
}

/** Fit a 850×978 sheet inside the stage (pixel-exact, no container-query bugs). */
function useFittedSheetSize(stageRef: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const measure = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width < 8 || height < 8) {
        setSize({ w: 0, h: 0 });
        return;
      }
      let h = height;
      let w = h * SHEET_RATIO;
      if (w > width) {
        w = width;
        h = w / SHEET_RATIO;
      }
      setSize({ w: Math.max(1, Math.floor(w)), h: Math.max(1, Math.floor(h)) });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [stageRef]);

  return size;
}

export function ParticipantMoodboard({
  participantName,
  paletteTones,
  styleImages,
  paletteImages,
  locale,
  onBack,
}: {
  participantName: string;
  paletteTones: string[];
  styleImages: MarcaPublicImage[];
  paletteImages: Partial<Record<string, string>>;
  locale: string;
  onBack: () => void;
}) {
  const pt = locale === 'pt-BR';
  const [page, setPage] = useState(0);
  const captions = pt ? STYLE_CAPTIONS_PT : STYLE_CAPTIONS_ES;
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetSize = useFittedSheetSize(stageRef);

  const tones = useMemo(() => paletteTones.filter(isTone).slice(0, 2), [paletteTones]);
  const page1Styles = styleImages.slice(0, 4);
  const page2Styles = styleImages.slice(4, 8);
  const hasSummary = tones.length > 0 || styleImages.length > 0;
  const totalPages = 1 + (hasSummary ? 1 : 0) + (page2Styles.length > 0 ? 1 : 0);

  useEffect(() => {
    return () => {
      document.body.classList.remove('printing-marca-moodboard');
    };
  }, []);

  function downloadPdf() {
    document.body.classList.add('printing-marca-moodboard');
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => document.body.classList.remove('printing-marca-moodboard'), 500);
    }, 80);
  }

  const sheetPages = [
    <CoverPage key="cover" name={participantName} />,
    hasSummary ? (
      <SummaryPage
        key="summary"
        tones={tones}
        styleImages={page1Styles}
        paletteImages={paletteImages}
        captions={captions}
        pt={pt}
      />
    ) : null,
    page2Styles.length > 0 ? (
      <StylesOnlyPage key="styles2" styleImages={page2Styles} captions={captions.slice(4)} pt={pt} />
    ) : null,
  ].filter(Boolean) as JSX.Element[];

  const sheetStyle =
    sheetSize.w > 0
      ? ({
          width: sheetSize.w,
          height: sheetSize.h,
          ['--sw' as string]: `${sheetSize.w}px`,
        } as CSSProperties)
      : undefined;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="marca-moodboard-screen flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 px-2 text-center">
          <p className="text-[12px] font-light tracking-[0.02em] text-[#071F5E] sm:text-[15px]">
            {pt ? 'RESUMO VISUAL' : 'RESUMEN VISUAL'}
          </p>
          <h2 className="mt-0.5 text-lg font-bold tracking-[0.01em] text-[#071F5E] sm:text-[28px] sm:leading-8">
            {pt ? 'Seu moodboard está pronto' : 'Su moodboard está listo'}
          </h2>
          <p className="mx-auto mt-1 max-w-2xl text-[11px] leading-4 text-[#071F5E] sm:text-[13px] sm:leading-5">
            {pt
              ? 'Um moodboard é um painel visual com cores, estilos e imagens de referência. Essas referências, junto com suas próximas respostas, vão ajudar a construir a parte visual da marca.'
              : 'Un moodboard es un panel visual con colores, estilos e imágenes de referencia. Estas referencias, junto con sus próximas respuestas, nos ayudarán a construir la parte visual de su marca.'}
          </p>
        </div>

        <div className="relative mt-2 flex min-h-0 w-full flex-1 items-center justify-center px-10 sm:px-14">
          <div ref={stageRef} className="flex h-full w-full items-center justify-center">
            <div
              id="marca-participant-moodboard"
              className="relative overflow-hidden bg-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
              style={sheetStyle}
            >
              {sheetSize.w > 0 ? sheetPages[page] : null}
            </div>
          </div>

          {page < totalPages - 1 ? (
            <button
              type="button"
              aria-label={pt ? 'Próxima página' : 'Siguiente página'}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="absolute right-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#071F5E] text-white shadow-lg sm:right-2 sm:h-12 sm:w-12"
            >
              <span className="text-xl">→</span>
            </button>
          ) : null}
          {page > 0 ? (
            <button
              type="button"
              aria-label={pt ? 'Página anterior' : 'Página anterior'}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="absolute left-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#071F5E] text-white shadow-lg sm:left-2 sm:h-12 sm:w-12"
            >
              <span className="text-xl">←</span>
            </button>
          ) : null}
        </div>

        <p className="mt-1.5 shrink-0 text-center text-xs text-[#071F5E]/55">
          {page + 1} / {totalPages}
        </p>

        <div className="marca-moodboard-toolbar mt-1.5 flex shrink-0 flex-row justify-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-[14px] border border-[#8D99AE] bg-white px-5 text-sm font-bold text-[#071F5E] sm:max-w-[360px]"
          >
            {pt ? 'Voltar' : 'Volver'}
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#071F5E] px-5 text-sm font-bold text-[#F2F2F2] sm:max-w-[360px]"
          >
            {pt ? 'Baixar PDF' : 'Descargar PDF'}
            <ArrowIcon />
          </button>
        </div>
      </div>

      <div className="marca-moodboard-print-stack" aria-hidden>
        {sheetPages.map((node, i) => (
          <div
            key={i}
            className="marca-moodboard-sheet"
            style={{ ['--sw' as string]: '190mm' } as CSSProperties}
          >
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Cover: solid yellow + pattern bg (no baked SVG text). Typography scales with --sw. */
function CoverPage({ name }: { name: string }) {
  const displayName = (name || 'Participante').trim();
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[#FABE24]"
      style={{
        backgroundImage: 'url(/images/marca/ui/moodboard-cover-pattern.svg)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left center',
        backgroundSize: 'cover',
      }}
    >
      <div className="relative z-10 flex h-full flex-col px-[8%] pb-[8%] pt-[26%]">
        <h2
          className="max-w-[94%] font-normal uppercase leading-[1.05] tracking-[0.01em] text-[#1D1B1D]"
          style={{ fontSize: 'calc(var(--sw, 850px) * 0.09)' }}
        >
          Moodboard
          <br />
          de {displayName}
        </h2>
        <p
          className="mt-auto self-end text-right font-light text-[#1D1B1D]"
          style={{ fontSize: 'calc(var(--sw, 850px) * 0.028)' }}
        >
          Essas são suas referências visuais
        </p>
      </div>
    </div>
  );
}

function SummaryPage({
  tones,
  styleImages,
  paletteImages,
  captions,
  pt,
}: {
  tones: MarcaTone[];
  styleImages: MarcaPublicImage[];
  paletteImages: Partial<Record<string, string>>;
  captions: string[];
  pt: boolean;
}) {
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-white"
      style={{
        padding: 'calc(var(--sw, 850px) * 0.055)',
        gap: 'calc(var(--sw, 850px) * 0.012)',
      }}
    >
      <div className="flex shrink-0 items-start justify-between gap-3">
        <h3
          className="font-medium uppercase leading-[1.05] tracking-[0.01em] text-[#1D1B1D]"
          style={{ fontSize: 'calc(var(--sw, 850px) * 0.055)' }}
        >
          {pt ? (
            <>
              Referências
              <br />
              visuais
            </>
          ) : (
            <>
              Referencias
              <br />
              visuales
            </>
          )}
        </h3>
        <p
          className="shrink-0 text-right font-light uppercase leading-relaxed tracking-[0.22em] text-[#071F5E]"
          style={{ fontSize: 'calc(var(--sw, 850px) * 0.018)' }}
        >
          {pt ? (
            <>
              Cores
              <br />
              Formas
              <br />
              Letras
              <br />
              Texturas
              <br />
              Embalagens
            </>
          ) : (
            <>
              Colores
              <br />
              Formas
              <br />
              Letras
              <br />
              Texturas
              <br />
              Empaques
            </>
          )}
        </p>
      </div>

      <div className="h-px w-12 shrink-0 bg-[#071F5E]/35" />
      <p
        className="max-w-[62%] shrink-0 font-light leading-snug text-[#071F5E]"
        style={{ fontSize: 'calc(var(--sw, 850px) * 0.016)' }}
      >
        {pt
          ? 'Essas referências ajudam a entender o universo visual que mais se aproxima da marca que querem construir.'
          : 'Estas referencias nos ayudan a entender el universo visual que más se acerca a la marca que quiere construir.'}
      </p>

      <div className="h-px w-full shrink-0 bg-[#071F5E]/18" />
      <p
        className="shrink-0 font-normal uppercase tracking-[0.1em] text-[#071F5E]"
        style={{ fontSize: 'calc(var(--sw, 850px) * 0.018)' }}
      >
        {pt ? 'Paletas selecionadas' : 'Paletas seleccionadas'}
      </p>

      {tones.length ? (
        <div className="grid shrink-0 grid-cols-2 gap-2">
          {tones.map((tone) => {
            const meta = MARCA_PALETTE_META[tone];
            const src = paletteImages[tone] || `/images/marca/ui/palette-${tone}.jpg`;
            return (
              <div key={tone} className="flex min-w-0 gap-2">
                <div
                  className="shrink-0 overflow-hidden rounded-[8px] bg-[#EEF3F7]"
                  style={{
                    width: 'calc(var(--sw, 850px) * 0.14)',
                    height: 'calc(var(--sw, 850px) * 0.105)',
                  }}
                >
                  <SafeImg src={src} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <p
                    className="truncate font-normal text-[#071F5E]"
                    style={{ fontSize: 'calc(var(--sw, 850px) * 0.018)' }}
                  >
                    {pt ? meta.labelPt.replace(/^Paleta\s+/i, '') : meta.labelEs.replace(/^Paleta\s+/i, '')}
                  </p>
                  <p
                    className="mt-0.5 line-clamp-2 font-light leading-snug text-[#071F5E]"
                    style={{ fontSize: 'calc(var(--sw, 850px) * 0.014)' }}
                  >
                    {pt ? meta.blurbPt : meta.blurbEs}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/marca/ui/swatch-${tone}.svg`}
                    alt=""
                    className="mt-1.5 w-auto max-w-full"
                    style={{ height: 'calc(var(--sw, 850px) * 0.028)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="h-px w-full shrink-0 bg-[#071F5E]/18" />
      <p
        className="shrink-0 font-normal uppercase tracking-[0.1em] text-[#071F5E]"
        style={{ fontSize: 'calc(var(--sw, 850px) * 0.018)' }}
      >
        {pt ? 'Estilo visual' : 'Estilo visual'}
      </p>

      {styleImages.length ? (
        <div className="grid min-h-0 flex-1 grid-cols-4 content-start gap-2">
          {styleImages.map((img, i) => (
            <div key={img.id} className="min-w-0">
              <div className="aspect-square overflow-hidden rounded-[10px] bg-[#EEF3F7]">
                <SafeImg src={img.src} alt={img.alt} className="h-full w-full object-cover" />
              </div>
              <p
                className="mt-1 text-center font-light leading-tight text-[#071F5E]"
                style={{ fontSize: 'calc(var(--sw, 850px) * 0.013)' }}
              >
                {captions[i % captions.length]}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex shrink-0 justify-center pt-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-branco.png"
          alt="Rural Commerce"
          className="w-auto brightness-0"
          style={{ height: 'calc(var(--sw, 850px) * 0.04)' }}
        />
      </div>
    </div>
  );
}

function StylesOnlyPage({
  styleImages,
  captions,
  pt,
}: {
  styleImages: MarcaPublicImage[];
  captions: string[];
  pt: boolean;
}) {
  const cols = styleImages.length >= 3 ? 4 : Math.max(2, styleImages.length);
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-white"
      style={{ padding: 'calc(var(--sw, 850px) * 0.06)' }}
    >
      <p
        className="shrink-0 font-normal uppercase tracking-[0.1em] text-[#071F5E]"
        style={{ fontSize: 'calc(var(--sw, 850px) * 0.02)' }}
      >
        {pt ? 'Estilo visual' : 'Estilo visual'}
      </p>
      <div
        className="mt-4 grid min-h-0 flex-1 content-start gap-x-3 gap-y-4"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {styleImages.map((img, i) => (
          <div key={img.id} className="min-w-0 overflow-hidden">
            <div className="aspect-square overflow-hidden rounded-[12px] bg-[#EEF3F7]">
              <SafeImg src={img.src} alt={img.alt} className="h-full w-full object-cover" />
            </div>
            <p
              className="mt-2 break-words text-center font-light leading-snug text-[#071F5E]"
              style={{ fontSize: 'calc(var(--sw, 850px) * 0.014)' }}
            >
              {captions[i % captions.length]}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-auto flex shrink-0 justify-center pt-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-branco.png"
          alt="Rural Commerce"
          className="w-auto brightness-0"
          style={{ height: 'calc(var(--sw, 850px) * 0.04)' }}
        />
      </div>
    </div>
  );
}
