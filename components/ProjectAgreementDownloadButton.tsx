'use client';

import { Download } from 'lucide-react';
import {
  buildSignedAgreementDocument,
  buildSignedAgreementFilename,
  type SignedAgreementDocumentInput,
} from '@/lib/project-agreement-document';

type LocaleKey = 'es' | 'pt-BR' | 'en';

const copy: Record<LocaleKey, { download: string; downloading: string }> = {
  es: {
    download: 'Descargar convenio firmado',
    downloading: 'Preparando descarga...',
  },
  'pt-BR': {
    download: 'Baixar convênio assinado',
    downloading: 'Preparando download...',
  },
  en: {
    download: 'Download signed agreement',
    downloading: 'Preparing download...',
  },
};

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ProjectAgreementDownloadButton({
  locale,
  input,
  className,
}: {
  locale: string;
  input: SignedAgreementDocumentInput;
  className?: string;
}) {
  const localeKey = getLocaleKey(locale);
  const t = copy[localeKey];

  const handleDownload = () => {
    const html = buildSignedAgreementDocument(input);
    const filename = buildSignedAgreementFilename(input.fullName, input.locale || localeKey);
    triggerDownload(html, filename, 'application/msword');
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className={
        className ||
        'inline-flex items-center justify-center gap-2 rounded-full border border-[#D9E3EC] bg-white px-5 py-2.5 text-sm font-semibold text-[#071F5E]'
      }
    >
      <Download size={16} aria-hidden />
      {t.download}
    </button>
  );
}
