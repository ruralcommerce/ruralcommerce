import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PROJECT_EXECUTOR, PROJECT_NAME, RURAL_COMMERCE_TAGLINE } from '@/lib/project-brand';
import type { ExportLocale, InscriptionExportDoc } from '@/lib/project-export-documents';
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
    createdAt: string;
    status: string;
    question: string;
    answer: string;
    signatureLine: string;
    signedBy: string;
    signedDate: string;
    documentId: string;
    signaturePending: string;
    electronicNote: string;
  }
> = {
  es: {
    official: 'Documento oficial',
    title: 'Formulario de inscripción',
    compiledTitle: 'Inscripciones — compilación',
    compiledSubtitle:
      'Cada hoja es el formulario de inscripción completado. Si hay convenio firmado, se incluye la firma electrónica; si no, queda como firma pendiente.',
    generatedAt: 'Generado el',
    filters: 'Filtros aplicados',
    total: 'Total de inscripciones',
    participant: 'Participante',
    email: 'Correo',
    organization: 'Organización',
    createdAt: 'Fecha de inscripción',
    status: 'Estado',
    question: 'Pregunta',
    answer: 'Respuesta',
    signatureLine: 'Firma electrónica',
    signedBy: 'Nombre',
    signedDate: 'Fecha de firma',
    documentId: 'ID del documento',
    signaturePending: 'Firma pendiente — el convenio de participación aún no está firmado.',
    electronicNote: 'La firma corresponde a la firma electrónica registrada al firmar el convenio.',
  },
  'pt-BR': {
    official: 'Documento oficial',
    title: 'Formulário de inscrição',
    compiledTitle: 'Inscrições — compilação',
    compiledSubtitle:
      'Cada folha é o formulário de inscrição preenchido. Se houver convênio assinado, inclui a assinatura eletrônica; senão, fica como assinatura pendente.',
    generatedAt: 'Gerado em',
    filters: 'Filtros aplicados',
    total: 'Total de inscrições',
    participant: 'Participante',
    email: 'E-mail',
    organization: 'Organização',
    createdAt: 'Data de inscrição',
    status: 'Status',
    question: 'Pergunta',
    answer: 'Resposta',
    signatureLine: 'Assinatura eletrônica',
    signedBy: 'Nome',
    signedDate: 'Data da assinatura',
    documentId: 'ID do documento',
    signaturePending: 'Assinatura pendente — o convênio de participação ainda não está assinado.',
    electronicNote: 'A assinatura corresponde à assinatura eletrônica registrada ao assinar o convênio.',
  },
  en: {
    official: 'Official document',
    title: 'Registration form',
    compiledTitle: 'Registrations — compilation',
    compiledSubtitle:
      'Each sheet is the completed registration form. If the agreement is signed, the electronic signature is included; otherwise it is marked pending.',
    generatedAt: 'Generated on',
    filters: 'Filters applied',
    total: 'Total registrations',
    participant: 'Participant',
    email: 'Email',
    organization: 'Organization',
    createdAt: 'Registration date',
    status: 'Status',
    question: 'Question',
    answer: 'Answer',
    signatureLine: 'Electronic signature',
    signedBy: 'Name',
    signedDate: 'Signed on',
    documentId: 'Document ID',
    signaturePending: 'Signature pending — the participation agreement has not been signed yet.',
    electronicNote: 'The signature is the electronic signature recorded when signing the agreement.',
  },
};

function lastTableY(doc: jsPDF, fallback: number) {
  const table = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable;
  return typeof table?.finalY === 'number' ? table.finalY : fallback;
}

export function renderInscriptionPdf(
  doc: jsPDF,
  item: InscriptionExportDoc,
  locale: ExportLocale,
  logos: ProjectPdfLogos
) {
  const t = copy[locale];
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

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
  const nameLines = doc.splitTextToSize(item.name || t.participant, pageWidth - 28);
  doc.text(nameLines, 14, y);
  y += nameLines.length * 6 + 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.text);
  doc.text(`${t.email}: ${item.email || '—'}`, 14, y);
  y += 5;
  if (item.organization) {
    doc.text(`${t.organization}: ${item.organization}`, 14, y);
    y += 5;
  }
  if (item.createdAt) {
    doc.text(`${t.createdAt}: ${item.createdAt}`, 14, y);
    y += 5;
  }
  if (item.status) {
    doc.text(`${t.status}: ${item.status}`, 14, y);
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
    margin: { left: 14, right: 14, bottom: 42 },
    theme: 'grid',
  });

  y = lastTableY(doc, y) + 10;
  if (y + 36 > pageHeight - 16) {
    doc.addPage();
    y = 24;
  }

  doc.setDrawColor(...COLORS.teal);
  doc.setLineWidth(0.8);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.navy);
  doc.text(t.signatureLine, 14, y);
  y += 8;

  if (item.signature.signed) {
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(16);
    doc.text(item.signature.fullName || item.name || '—', 14, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    if (item.signature.signedAt) doc.text(`${t.signedDate}: ${item.signature.signedAt}`, 14, y);
    y += 5;
    if (item.signature.documentId) doc.text(`${t.documentId}: ${item.signature.documentId}`, 14, y);
    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    const note = doc.splitTextToSize(t.electronicNote, pageWidth - 28);
    doc.text(note, 14, y);
  } else {
    doc.setFillColor(...COLORS.panel);
    doc.roundedRect(14, y - 4, pageWidth - 28, 16, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    const pending = doc.splitTextToSize(t.signaturePending, pageWidth - 36);
    doc.text(pending, 18, y + 4);
  }

  const footerY = pageHeight - 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text(`${PROJECT_NAME} · ${PROJECT_EXECUTOR} · ${RURAL_COMMERCE_TAGLINE}`, 14, footerY);
}

export async function buildCompiledInscriptionsPdfBlob(options: {
  locale: ExportLocale;
  docs: InscriptionExportDoc[];
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
    renderInscriptionPdf(doc, item, options.locale, logos);
    await yieldToUi();
  }

  return doc.output('blob');
}

export async function appendCompiledInscriptionsPdf(
  doc: jsPDF,
  options: {
    locale: ExportLocale;
    docs: InscriptionExportDoc[];
    logos: ProjectPdfLogos;
  }
) {
  for (const item of options.docs) {
    doc.addPage();
    renderInscriptionPdf(doc, item, options.locale, options.logos);
    await yieldToUi();
  }
}
