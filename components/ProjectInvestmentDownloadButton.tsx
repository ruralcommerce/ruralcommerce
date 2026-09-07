'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import {
  buildSignedInvestmentPdfBlob,
  buildSignedInvestmentPdfFilename,
} from '@/lib/project-investment-pdf';
import type { InvestmentRecord } from '@/lib/project-investments';

export function ProjectInvestmentDownloadButton({
  locale,
  investment,
  participantName,
  email,
  organization,
}: {
  locale: string;
  investment: InvestmentRecord;
  participantName: string;
  email: string;
  organization?: string;
}) {
  const [loading, setLoading] = useState(false);
  const label =
    locale === 'pt-BR' ? 'Baixar PDF' : locale === 'en' ? 'Download PDF' : 'Descargar PDF';

  return (
    <button
      type="button"
      disabled={loading || !investment.signature}
      onClick={async () => {
        setLoading(true);
        try {
          const blob = await buildSignedInvestmentPdfBlob({
            investment,
            participantName,
            email,
            organization,
          });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = buildSignedInvestmentPdfFilename(participantName);
          anchor.click();
          URL.revokeObjectURL(url);
        } finally {
          setLoading(false);
        }
      }}
      className="inline-flex items-center gap-2 rounded-full border border-[#D9E3EC] bg-white px-5 py-2.5 text-sm font-semibold text-[#071F5E] disabled:opacity-60"
    >
      <Download size={16} />
      {loading ? '...' : label}
    </button>
  );
}
