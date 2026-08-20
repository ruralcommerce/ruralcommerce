'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import {
  buildSignedAgreementPdfBlob,
  buildSignedAgreementPdfFilename,
} from '@/lib/project-agreement-pdf';
import type { SignedAgreementDocumentInput } from '@/lib/project-agreement-document';

type LocaleKey = 'es' | 'pt-BR' | 'en';

const copy: Record<LocaleKey, { download: string; downloading: string }> = {
  es: {
    download: 'Descargar convenio firmado (PDF)',
    downloading: 'Generando PDF...',
  },
  'pt-BR': {
    download: 'Baixar convênio assinado (PDF)',
    downloading: 'Gerando PDF...',
  },
  en: {
    download: 'Download signed agreement (PDF)',
    downloading: 'Generating PDF...',
  },
};

function getLocaleKey(locale: string): LocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
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
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await buildSignedAgreementPdfBlob(input);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = buildSignedAgreementPdfFilename(input.fullName, input.locale || localeKey);
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleDownload()}
      disabled={loading}
      className={
        className ||
        'inline-flex items-center justify-center gap-2 rounded-full border border-[#D9E3EC] bg-white px-5 py-2.5 text-sm font-semibold text-[#071F5E] disabled:opacity-60'
      }
    >
      <Download size={16} aria-hidden />
      {loading ? t.downloading : t.download}
    </button>
  );
}
