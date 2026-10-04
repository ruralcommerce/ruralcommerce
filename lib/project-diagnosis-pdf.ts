import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PROJECT_EXECUTOR, PROJECT_NAME, RURAL_COMMERCE_TAGLINE } from '@/lib/project-brand';
import type { DiagnosisExportDoc, ExportLocale } from '@/lib/project-export-documents';
import {
  PROJECT_PDF_COLORS as COLORS,
  drawProjectPdfCover,
  loadProjectPdfLogos,
  yieldToUi,
  type ProjectPdfLogos,
} from '@/lib/project-pdf-common';

const copy: Record<
  ExportLocale,
  {
    official: string;
    title: string;
    compiledTitle: string;
    compiledSubtitle: string;
    generatedAt: string;
    filters: string;
    total: string;
    participant: string;
    email: string;
    organization: string;
    submittedAt: string;
    question: string;
    answer: string;
  }
> = {
  es: {
    official: 'Documento oficial',
    title: 'Diagnóstico completo',
    compiledTitle: 'Diagnósticos completos — compilación',
    compiledSubtitle: 'Cada hoja (o bloque) corresponde al diagnóstico enviado por un participante.',
    generatedAt: 'Generado el',
    filters: 'Filtros aplicados',
    total: 'Total de diagnósticos',
    participant: 'Participante',
    email: 'Correo',
    organization: 'Organización',
    submittedAt: 'Enviado el',
    question: 'Pregunta',
    answer: 'Respuesta',
  },
  'pt-BR': {
    official: 'Documento oficial',
    title: 'Diagnóstico completo',
    compiledTitle: 'Diagnósticos completos — compilação',
    compiledSubtitle: 'Cada folha (ou bloco) corresponde ao diagnóstico enviado por um participante.',
    generatedAt: 'Gerado em',
    filters: 'Filtros aplicados',
    total: 'Total de diagnósticos',
    participant: 'Participante',
    email: 'E-mail',
    organization: 'Organização',
    submittedAt: 'Enviado em',
    question: 'Pergunta',
    answer: 'Resposta',
  },
  en: {
    official: 'Official document',
    title: 'Full diagnosis',
    compiledTitle: 'Completed diagnoses — compilation',
    compiledSubtitle: 'Each sheet (or block) is the diagnosis submitted by one participant.',
    generatedAt: 'Generated on',
    filters: 'Filters applied',
    total: 'Total diagnoses',
    participant: 'Participant',
    email: 'Email',
    organization: 'Organization',
    submittedAt: 'Submitted on',
    question: 'Question',
    answer: 'Answer',
  },
};

export function renderDiagnosisPdf(
  doc: jsPDF,
  item: DiagnosisExportDoc,
  locale: ExportLocale,
  logos: ProjectPdfLogos
) {
  const t = copy[locale];
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, pageWidth, 36, 'F');
  if (logos.rcLogo) doc.addImage(logos.rcLogo, 'PNG', 16, 8, 30, 9);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(t.official.toUpperCase(), 16, 24);
  doc.setFontSize(13);
  doc.text(t.title, 16, 31);

  let y = 46;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.navy);
  doc.text(item.name || t.participant, 14, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.text);
  doc.text(`${t.email}: ${item.email || '—'}`, 14, y);
  y += 5;
  if (item.organization) {
    doc.text(`${t.organization}: ${item.organization}`, 14, y);
    y += 5;
  }
  if (item.submittedAt) {
    doc.text(`${t.submittedAt}: ${item.submittedAt}`, 14, y);
    y += 5;
  }

  autoTable(doc, {
    startY: y + 2,
    head: [[t.question, t.answer]],
    body: item.rows.length ? item.rows : [['—', '—']],
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2,
      textColor: COLORS.text,
      overflow: 'linebreak',
      valign: 'top',
    },
    headStyles: {
      fillColor: COLORS.panel,
      textColor: COLORS.navy,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 82, fontStyle: 'bold', textColor: COLORS.navy },
    },
    margin: { left: 14, right: 14, bottom: 18 },
    theme: 'grid',
  });

  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text(`${PROJECT_NAME} · ${PROJECT_EXECUTOR} · ${RURAL_COMMERCE_TAGLINE}`, 14, footerY);
}

export async function buildCompiledDiagnosesPdfBlob(options: {
  locale: ExportLocale;
  docs: DiagnosisExportDoc[];
  generatedAtLabel: string;
  filterSummary?: string;
  cover?: boolean;
}) {
  const logos = await loadProjectPdfLogos();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const t = copy[options.locale];
  const withCover = options.cover !== false;

  if (withCover) {
    drawProjectPdfCover(doc, {
      officialNotice: t.official,
      title: t.compiledTitle,
      subtitle: t.compiledSubtitle,
      lines: [
        `${t.generatedAt}: ${options.generatedAtLabel}`,
        options.filterSummary ? `${t.filters}: ${options.filterSummary}` : '',
        `${t.total}: ${options.docs.length}`,
      ].filter(Boolean),
      logos,
    });
  }

  for (const [index, item] of options.docs.entries()) {
    if (withCover || index > 0) doc.addPage();
    renderDiagnosisPdf(doc, item, options.locale, logos);
    await yieldToUi();
  }

  return doc.output('blob');
}

export async function appendCompiledDiagnosesPdf(
  doc: jsPDF,
  options: {
    locale: ExportLocale;
    docs: DiagnosisExportDoc[];
    logos: ProjectPdfLogos;
  }
) {
  for (const item of options.docs) {
    doc.addPage();
    renderDiagnosisPdf(doc, item, options.locale, options.logos);
    await yieldToUi();
  }
}
