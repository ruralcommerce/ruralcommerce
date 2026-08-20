import { jsPDF } from 'jspdf';
import { getProjectAgreementCopy, type ProjectAgreementLocaleKey } from '@/lib/project-agreement-copy';
import {
  PROJECT_EXECUTOR,
  PROJECT_LOGO_PATH,
  PROJECT_NAME,
  RURAL_COMMERCE_LOGO_WHITE_PATH,
  RURAL_COMMERCE_TAGLINE,
} from '@/lib/project-brand';
import { formatProjectDate } from '@/lib/project-locale';
import type { SignedAgreementDocumentInput } from '@/lib/project-agreement-document';

const COLORS = {
  navy: [6, 31, 91] as [number, number, number],
  teal: [35, 184, 181] as [number, number, number],
  text: [51, 51, 51] as [number, number, number],
  muted: [102, 102, 102] as [number, number, number],
  panel: [239, 250, 250] as [number, number, number],
  footer: [32, 32, 32] as [number, number, number],
};

function getLocaleKey(locale?: string): ProjectAgreementLocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

const labels: Record<
  ProjectAgreementLocaleKey,
  {
    documentTitle: string;
    signedHeading: string;
    signedBy: string;
    signedEmail: string;
    signedOrganization: string;
    signedDate: string;
    documentId: string;
    verificationCode: string;
    ipAddress: string;
    acceptedTerms: string;
    signatureLine: string;
    electronicNote: string;
    traceabilityTitle: string;
    traceabilityText: string;
    officialNotice: string;
  }
> = {
  es: {
    documentTitle: 'Convenio de participación firmado',
    signedHeading: 'Constancia de firma electrónica',
    signedBy: 'Nombre completo',
    signedEmail: 'Correo electrónico',
    signedOrganization: 'Organización',
    signedDate: 'Fecha y hora de firma',
    documentId: 'ID del documento',
    verificationCode: 'Código de verificación',
    ipAddress: 'Dirección IP registrada',
    acceptedTerms: 'Términos aceptados al firmar',
    signatureLine: 'Firma electrónica',
    electronicNote:
      'Este documento refleja la firma electrónica registrada en la plataforma oficial del proyecto.',
    traceabilityTitle: 'Trazabilidad y seguridad',
    traceabilityText:
      'Conserve este PDF junto con el código de verificación. Rural Commerce puede validar la autenticidad del registro en la plataforma del proyecto.',
    officialNotice: 'Comunicado oficial',
  },
  'pt-BR': {
    documentTitle: 'Convênio de participação assinado',
    signedHeading: 'Comprovante de assinatura eletrônica',
    signedBy: 'Nome completo',
    signedEmail: 'E-mail',
    signedOrganization: 'Organização',
    signedDate: 'Data e hora da assinatura',
    documentId: 'ID do documento',
    verificationCode: 'Código de verificação',
    ipAddress: 'Endereço IP registrado',
    acceptedTerms: 'Termos aceitos ao assinar',
    signatureLine: 'Assinatura eletrônica',
    electronicNote:
      'Este documento reflete a assinatura eletrônica registrada na plataforma oficial do projeto.',
    traceabilityTitle: 'Rastreabilidade e segurança',
    traceabilityText:
      'Guarde este PDF junto com o código de verificação. A Rural Commerce pode validar a autenticidade do registro na plataforma do projeto.',
    officialNotice: 'Comunicado oficial',
  },
  en: {
    documentTitle: 'Signed participation agreement',
    signedHeading: 'Electronic signature record',
    signedBy: 'Full name',
    signedEmail: 'Email',
    signedOrganization: 'Organization',
    signedDate: 'Signed date and time',
    documentId: 'Document ID',
    verificationCode: 'Verification code',
    ipAddress: 'Registered IP address',
    acceptedTerms: 'Terms accepted when signing',
    signatureLine: 'Electronic signature',
    electronicNote:
      'This document reflects the electronic signature recorded on the official project platform.',
    traceabilityTitle: 'Traceability and security',
    traceabilityText:
      'Keep this PDF together with the verification code. Rural Commerce can validate the authenticity of the record on the project platform.',
    officialNotice: 'Official notice',
  },
};

async function loadImageDataUrl(path: string) {
  const response = await fetch(path);
  if (!response.ok) throw new Error('logo-load-failed');
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function formatSignedDateTime(value: string | undefined, locale: ProjectAgreementLocaleKey) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatProjectDate(value, locale);
  const localeTag = locale === 'pt-BR' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-CR';
  return date.toLocaleString(localeTag, {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

function drawMetaRow(doc: jsPDF, y: number, label: string, value: string) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.navy);
  doc.text(label, 22, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  const lines = doc.splitTextToSize(value || '—', 118);
  doc.text(lines, 72, y);
  return y + Math.max(6, lines.length * 4.8);
}

function ensureSpace(doc: jsPDF, y: number, needed: number) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed <= pageHeight - 18) return y;
  doc.addPage();
  return 24;
}

export async function buildSignedAgreementPdfBlob(input: SignedAgreementDocumentInput) {
  const localeKey = getLocaleKey(input.locale);
  const agreement = getProjectAgreementCopy(localeKey);
  const t = labels[localeKey];
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  const [rcLogo, projectLogo] = await Promise.all([
    loadImageDataUrl(RURAL_COMMERCE_LOGO_WHITE_PATH),
    loadImageDataUrl(PROJECT_LOGO_PATH),
  ]);

  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.addImage(rcLogo, 'PNG', 16, 10, 34, 10);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(t.officialNotice.toUpperCase(), 16, 28);
  doc.setFontSize(15);
  doc.text(t.documentTitle, 16, 36);

  let y = 52;
  doc.setFillColor(...COLORS.panel);
  doc.roundedRect(14, y - 4, pageWidth - 28, 52, 3, 3, 'F');
  doc.setDrawColor(...COLORS.teal);
  doc.setLineWidth(0.6);
  doc.line(14, y - 4, pageWidth - 14, y - 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.navy);
  doc.text(t.signedHeading, 18, y + 2);
  y += 10;

  y = drawMetaRow(doc, y, t.signedBy, input.fullName);
  y = drawMetaRow(doc, y, t.signedEmail, input.email);
  y = drawMetaRow(doc, y, t.signedOrganization, input.organization?.trim() || '—');
  y = drawMetaRow(doc, y, t.signedDate, formatSignedDateTime(input.signedAt, localeKey));
  y = drawMetaRow(doc, y, t.documentId, input.documentId || '—');
  y = drawMetaRow(doc, y, t.verificationCode, input.verificationCode || '—');
  if (input.ipAddress) {
    y = drawMetaRow(doc, y, t.ipAddress, input.ipAddress);
  }

  y += 8;
  doc.setFillColor(...COLORS.teal);
  doc.rect(14, y, 10, 1.2, 'F');
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.navy);
  doc.text(agreement.title, 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const introLines = doc.splitTextToSize(agreement.intro, pageWidth - 28);
  doc.text(introLines, 14, y);
  y += introLines.length * 4.8 + 4;

  const sections = [
    { heading: agreement.agreementHeading, paragraphs: agreement.agreementParagraphs },
    { heading: agreement.networkHeading, paragraphs: [agreement.networkText] },
    { heading: agreement.benefitsHeading, paragraphs: [agreement.benefitsText] },
    { heading: agreement.imageRightsHeading, paragraphs: [agreement.imageRightsText] },
    { heading: agreement.commitmentHeading, paragraphs: [agreement.commitmentText] },
    { heading: agreement.communicationsHeading, paragraphs: [agreement.communicationsText] },
  ];

  for (const section of sections) {
    y = ensureSpace(doc, y, 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...COLORS.teal);
    doc.text(section.heading, 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.text);
    for (const paragraph of section.paragraphs) {
      const lines = doc.splitTextToSize(paragraph, pageWidth - 28);
      y = ensureSpace(doc, y, lines.length * 4.5 + 2);
      doc.text(lines, 14, y);
      y += lines.length * 4.5 + 2;
    }
    y += 2;
  }

  y = ensureSpace(doc, y, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.navy);
  doc.text(t.acceptedTerms, 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const acceptance = [
    agreement.networkCheckbox,
    agreement.imageRightsCheckbox,
    agreement.commitmentCheckbox,
    agreement.communicationsCheckbox,
  ];
  for (const item of acceptance) {
    const lines = doc.splitTextToSize(`• ${item}`, pageWidth - 28);
    y = ensureSpace(doc, y, lines.length * 4.5 + 1);
    doc.text(lines, 16, y);
    y += lines.length * 4.5 + 1;
  }

  y = ensureSpace(doc, y, 34);
  doc.setDrawColor(...COLORS.teal);
  doc.setLineWidth(0.8);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.navy);
  doc.text(t.signatureLine, 14, y);
  y += 8;
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(18);
  doc.text(input.fullName, 14, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(formatSignedDateTime(input.signedAt, localeKey), 14, y);

  y = ensureSpace(doc, y, 28);
  doc.addImage(projectLogo, 'PNG', 14, y, 24, 24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.navy);
  doc.text(t.traceabilityTitle, 42, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.muted);
  const traceLines = doc.splitTextToSize(t.traceabilityText, pageWidth - 56);
  doc.text(traceLines, 42, y + 10);

  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setFillColor(...COLORS.footer);
  doc.rect(0, footerY - 8, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`${PROJECT_NAME} · ${PROJECT_EXECUTOR}`, 14, footerY);
  doc.text(RURAL_COMMERCE_TAGLINE, 14, footerY + 4);
  doc.text(t.electronicNote, 14, footerY + 8);

  return doc.output('blob');
}

export function buildSignedAgreementPdfFilename(fullName: string, locale?: string) {
  const localeKey = getLocaleKey(locale);
  const prefix =
    localeKey === 'pt-BR' ? 'convenio-assinado' : localeKey === 'en' ? 'signed-agreement' : 'convenio-firmado';
  const slug = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `${prefix}${slug ? `-${slug}` : ''}.pdf`;
}
