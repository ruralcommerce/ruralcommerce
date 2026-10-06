'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  MARCA_PALETTE_META,
  MARCA_TONES,
  type MarcaPublicImage,
  type MarcaTone,
} from '@/lib/marca/types';

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

function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/marca/ui/arrow-up-right.svg" alt="" className={className} width={18} height={18} />
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
    // Allow layout to apply before print dialog
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => document.body.classList.remove('printing-marca-moodboard'), 500);
    }, 50);
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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="marca-moodboard-screen flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 px-1 text-center">
          <p className="text-[13px] font-light tracking-[0.02em] text-[#071F5E] sm:text-[18px]">
            {pt ? 'RESUMO VISUAL' : 'RESUMEN VISUAL'}
          </p>
          <h2 className="mt-0.5 text-xl font-bold tracking-[0.01em] text-[#071F5E] sm:text-[32px] sm:leading-9">
            {pt ? 'Seu moodboard está pronto' : 'Su moodboard está listo'}
          </h2>
          <p className="mx-auto mt-1 max-w-3xl text-xs leading-4 text-[#071F5E] sm:text-sm sm:leading-5">
            {pt
              ? 'Um moodboard é um painel visual com cores, estilos e imagens de referência. Essas referências, junto com suas próximas respostas, vão ajudar a construir a parte visual da marca.'
              : 'Un moodboard es un panel visual con colores, estilos e imágenes de referencia. Estas referencias, junto con sus próximas respuestas, nos ayudarán a construir la parte visual de su marca.'}
          </p>
        </div>

        {/* Size container so sheet can fit portrait 850×978 inside available space */}
        <div
          className="relative mx-auto mt-2 min-h-0 w-full flex-1 px-8 sm:px-12"
          style={{ containerType: 'size' }}
        >
          <div
            id="marca-participant-moodboard"
            className="absolute left-1/2 top-1/2 overflow-hidden bg-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
            style={{
              aspectRatio: '850 / 978',
              width: 'min(100cqw, calc(100cqh * 850 / 978))',
              height: 'min(100cqh, calc(100cqw * 978 / 850))',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {sheetPages[page]}
          </div>

          {page < totalPages - 1 ? (
            <button
              type="button"
              aria-label={pt ? 'Próxima página' : 'Siguiente página'}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="absolute right-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#071F5E] text-white shadow-lg sm:h-14 sm:w-14"
            >
              <span className="text-xl">→</span>
            </button>
          ) : null}
          {page > 0 ? (
            <button
              type="button"
              aria-label={pt ? 'Página anterior' : 'Página anterior'}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="absolute left-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#071F5E] text-white shadow-lg sm:h-14 sm:w-14"
            >
              <span className="text-xl">←</span>
            </button>
          ) : null}
        </div>

        <p className="mt-1.5 shrink-0 text-center text-xs text-[#071F5E]/55">
          {page + 1} / {totalPages}
        </p>

        <div className="marca-moodboard-toolbar mt-2 flex shrink-0 flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-[14px] border border-[#8D99AE] bg-white px-5 text-sm font-bold text-[#071F5E] sm:max-w-[409px]"
          >
            {pt ? 'Voltar' : 'Volver'}
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#071F5E] px-5 text-sm font-bold text-[#F2F2F2] sm:max-w-[409px]"
          >
            {pt ? 'Baixar PDF' : 'Descargar PDF'}
            <ArrowIcon />
          </button>
        </div>
      </div>

      {/* Print-only stack: all pages, never overlaid with screen chrome */}
      <div className="marca-moodboard-print-stack" aria-hidden>
        {sheetPages.map((node, i) => (
          <div key={i} className="marca-moodboard-sheet">
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Pattern background only — text is HTML so the name is dynamic and not doubled with SVG glyphs. */
function CoverPage({ name }: { name: string }) {
  const displayName = (name || 'Participante').trim();
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#FABE24]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/marca/ui/moodboard-cover-pattern.svg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-left"
      />
      <div className="relative z-10 flex h-full flex-col px-[7%] pb-[10%] pt-[28%]">
        <h2 className="max-w-[92%] text-[clamp(2.4rem,7.2vw,5.4rem)] font-normal uppercase leading-[1.02] tracking-[0.01em] text-[#1D1B1D]">
          Moodboard
          <br />
          de {displayName}
        </h2>
        <p className="mt-auto self-end text-right text-[clamp(0.9rem,2vw,1.55rem)] font-light text-[#1D1B1D]">
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
    <div className="flex h-full flex-col overflow-y-auto bg-white px-[6%] py-[5%]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[clamp(1.35rem,4vw,3.4rem)] font-medium uppercase leading-[1.05] tracking-[0.01em] text-[#1D1B1D]">
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
        <p className="shrink-0 text-right text-[clamp(0.65rem,1.35vw,1.15rem)] font-light uppercase leading-relaxed tracking-[0.28em] text-[#071F5E]">
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
      <div className="mt-2 h-px w-16 bg-[#071F5E]/40" />
      <p className="mt-2 max-w-[58%] text-[clamp(0.7rem,1.25vw,0.95rem)] font-light leading-snug text-[#071F5E]">
        {pt
          ? 'Essas referências ajudam a entender o universo visual que mais se aproxima da marca que querem construir.'
          : 'Estas referencias nos ayudan a entender el universo visual que más se acerca a la marca que quiere construir.'}
      </p>

      <div className="mt-4 h-px w-full bg-[#071F5E]/20" />
      <p className="mt-2 text-[clamp(0.7rem,1.3vw,1.1rem)] font-normal uppercase tracking-[0.1em] text-[#071F5E]">
        {pt ? 'Paletas selecionadas' : 'Paletas seleccionadas'}
      </p>
      {tones.length ? (
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tones.map((tone) => {
            const meta = MARCA_PALETTE_META[tone];
            const src = paletteImages[tone] || `/images/marca/ui/palette-${tone}.jpg`;
            return (
              <div key={tone} className="flex min-w-0 gap-2.5">
                <div className="relative aspect-[4/3] w-[40%] shrink-0 overflow-hidden rounded-[10px] bg-[#EEF3F7]">
                  <SafeImg src={src} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <p className="text-[clamp(0.8rem,1.35vw,1.05rem)] font-normal text-[#071F5E]">
                    {pt ? meta.labelPt.replace(/^Paleta\s+/i, '') : meta.labelEs.replace(/^Paleta\s+/i, '')}
                  </p>
                  <p className="mt-0.5 text-[clamp(0.65rem,1.15vw,0.9rem)] font-light leading-snug text-[#071F5E]">
                    {pt ? meta.blurbPt : meta.blurbEs}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/marca/ui/swatch-${tone}.svg`}
                    alt=""
                    width={136}
                    height={24}
                    className="mt-2 h-5 w-auto max-w-full sm:h-6"
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 text-sm text-[#071F5E]/55">{pt ? 'Nenhuma paleta selecionada.' : 'Ninguna paleta seleccionada.'}</p>
      )}

      <div className="mt-4 h-px w-full bg-[#071F5E]/20" />
      <p className="mt-2 text-[clamp(0.7rem,1.3vw,1.1rem)] font-normal uppercase tracking-[0.1em] text-[#071F5E]">
        {pt ? 'Estilo visual' : 'Estilo visual'}
      </p>
      {styleImages.length ? (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {styleImages.map((img, i) => (
            <div key={img.id} className="min-w-0">
              <div className="aspect-square overflow-hidden rounded-[12px] bg-[#EEF3F7]">
                <SafeImg src={img.src} alt={img.alt} className="h-full w-full object-cover" />
              </div>
              <p className="mt-1 text-center text-[clamp(0.55rem,1vw,0.85rem)] font-light leading-snug text-[#071F5E]">
                {captions[i % captions.length]}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-[#071F5E]/55">{pt ? 'Nenhum estilo selecionado.' : 'Ningún estilo seleccionado.'}</p>
      )}

      <div className="mt-auto flex justify-center pt-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-branco.png" alt="Rural Commerce" className="h-7 w-auto brightness-0" />
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
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white px-[6%] py-[6%]">
      <p className="text-[clamp(0.7rem,1.3vw,1.1rem)] font-normal uppercase tracking-[0.1em] text-[#071F5E]">
        {pt ? 'Estilo visual' : 'Estilo visual'}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {styleImages.map((img, i) => (
          <div key={img.id} className="min-w-0">
            <div className="aspect-square overflow-hidden rounded-[12px] bg-[#EEF3F7]">
              <SafeImg src={img.src} alt={img.alt} className="h-full w-full object-cover" />
            </div>
            <p className="mt-1.5 text-center text-[clamp(0.55rem,1vw,0.85rem)] font-light leading-snug text-[#071F5E]">
              {captions[i % captions.length]}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-auto flex justify-center pt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-branco.png" alt="Rural Commerce" className="h-7 w-auto brightness-0" />
      </div>
    </div>
  );
}
