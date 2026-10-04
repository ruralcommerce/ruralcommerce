import { jsPDF } from 'jspdf';
import type { SignedAgreementDocumentInput } from '@/lib/project-agreement-document';
import { renderSignedAgreementPdf } from '@/lib/project-agreement-pdf';
import { appendCompiledDiagnosesPdf } from '@/lib/project-diagnosis-pdf';
import { appendCompiledInscriptionsPdf } from '@/lib/project-inscription-pdf';
import type { DiagnosisExportDoc, ExportLocale, InscriptionExportDoc } from '@/lib/project-export-documents';
import {
  drawProjectPdfCover,
  loadProjectPdfLogos,
  yieldToUi,
} from '@/lib/project-pdf-common';

const copy: Record<
  ExportLocale,
  {
    official: string;
    title: string;
    subtitle: string;
    generatedAt: string;
    filters: string;
    inscriptions: string;
    agreements: string;
    diagnoses: string;
  }
> = {
  es: {
    official: 'Documento oficial',
    title: 'Expediente compilado del proyecto',
    subtitle:
      'Inscripciones (formulario + firma), convenios firmados y diagnósticos completos del filtro o selección actual.',
    generatedAt: 'Generado el',
    filters: 'Filtros aplicados',
    inscriptions: 'Inscripciones',
    agreements: 'Convenios firmados',
    diagnoses: 'Diagnósticos enviados',
  },
  'pt-BR': {
    official: 'Documento oficial',
    title: 'Expediente compilado do projeto',
    subtitle:
      'Inscrições (formulário + assinatura), convênios assinados e diagnósticos completos do filtro ou seleção atual.',
    generatedAt: 'Gerado em',
    filters: 'Filtros aplicados',
    inscriptions: 'Inscrições',
    agreements: 'Convênios assinados',
    diagnoses: 'Diagnósticos enviados',
  },
  en: {
    official: 'Official document',
    title: 'Compiled project file',
    subtitle:
      'Registrations (form + signature), signed agreements and completed diagnoses for the current filter or selection.',
    generatedAt: 'Generated on',
    filters: 'Filters applied',
    inscriptions: 'Registrations',
    agreements: 'Signed agreements',
    diagnoses: 'Submitted diagnoses',
  },
};

export async function buildCompiledProjectPackPdfBlob(options: {
  locale: ExportLocale;
  inscriptions: InscriptionExportDoc[];
  agreements: SignedAgreementDocumentInput[];
  diagnoses: DiagnosisExportDoc[];
  generatedAtLabel: string;
  filterSummary?: string;
}) {
  const logos = await loadProjectPdfLogos();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const t = copy[options.locale];

  drawProjectPdfCover(doc, {
    officialNotice: t.official,
    title: t.title,
    subtitle: t.subtitle,
    lines: [
      `${t.generatedAt}: ${options.generatedAtLabel}`,
      options.filterSummary ? `${t.filters}: ${options.filterSummary}` : '',
      `${t.inscriptions}: ${options.inscriptions.length}`,
      `${t.agreements}: ${options.agreements.length}`,
      `${t.diagnoses}: ${options.diagnoses.length}`,
    ].filter(Boolean),
    logos,
  });

  await appendCompiledInscriptionsPdf(doc, {
    locale: options.locale,
    docs: options.inscriptions,
    logos,
  });

  for (const agreement of options.agreements) {
    doc.addPage();
    renderSignedAgreementPdf(doc, agreement, logos);
    await yieldToUi();
  }

  await appendCompiledDiagnosesPdf(doc, {
    locale: options.locale,
    docs: options.diagnoses,
    logos,
  });

  return doc.output('blob');
}
