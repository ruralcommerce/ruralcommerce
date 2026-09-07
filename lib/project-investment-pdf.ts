import { jsPDF } from 'jspdf';
import { PROJECT_EXECUTOR, PROJECT_NAME } from '@/lib/project-brand';
import { formatProjectDate, getProjectLocaleKey, type ProjectLocaleKey } from '@/lib/project-locale';
import type { InvestmentRecord } from '@/lib/project-investments';

export type SignedInvestmentPdfInput = {
  investment: InvestmentRecord;
  participantName: string;
  email: string;
  organization?: string;
};

const labels: Record<
  ProjectLocaleKey,
  {
    title: string;
    signed: string;
    amount: string;
    receipts: string;
    code: string;
    note: string;
  }
> = {
  es: {
    title: 'Declaración de inversión del beneficiario',
    signed: 'Firma electrónica',
    amount: 'Monto declarado',
    receipts: 'Comprobantes anexos',
    code: 'Código de verificación',
    note: 'Este documento registra la firma electrónica y los comprobantes subidos a la plataforma. Solo cuenta para el indicador 18a cuando el equipo técnico lo acepte.',
  },
  'pt-BR': {
    title: 'Declaração de investimento do beneficiário',
    signed: 'Assinatura eletrônica',
    amount: 'Valor declarado',
    receipts: 'Comprovantes anexos',
    code: 'Código de verificação',
    note: 'Este documento registra a assinatura eletrônica e os comprovantes enviados. Só entra no indicador 18a quando a equipe técnica aceitar.',
  },
  en: {
    title: 'Beneficiary investment declaration',
    signed: 'Electronic signature',
    amount: 'Declared amount',
    receipts: 'Attached receipts',
    code: 'Verification code',
    note: 'This document records the electronic signature and uploaded receipts. It only counts toward indicator 18a after the technical team accepts it.',
  },
};

export function buildSignedInvestmentPdfFilename(fullName: string) {
  const slug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'beneficiario';
  return `inversion-${slug}.pdf`;
}

export async function buildSignedInvestmentPdfBlob(input: SignedInvestmentPdfInput) {
  const locale = getProjectLocaleKey(input.investment.signature?.locale || input.investment.locale);
  const t = labels[locale];
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const sig = input.investment.signature;
  const receipts = input.investment.files.filter((file) => file.kind === 'receipt');

  doc.setFillColor(6, 31, 91);
  doc.rect(0, 0, 595, 90, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(PROJECT_NAME, 40, 36);
  doc.setFontSize(18);
  doc.text(t.title, 40, 64);

  doc.setTextColor(51, 51, 51);
  doc.setFontSize(12);
  let y = 130;
  const lines = [
    `${t.signed}: ${sig?.fullName || input.participantName}`,
    `Email: ${input.email}`,
    input.organization ? `Org: ${input.organization}` : '',
    `${t.amount}: ${input.investment.currency || ''} ${input.investment.amountOriginal ?? '—'} (${input.investment.amountKind || ''})`,
    input.investment.description || input.investment.what || '',
    `${t.receipts}: ${receipts.map((file) => file.originalName).join(', ') || '—'}`,
    `${t.code}: ${sig?.verificationCode || '—'}`,
    `ID: ${sig?.documentId || input.investment.id}`,
    `${formatProjectDate(sig?.signedAt, locale)}`,
  ].filter(Boolean);

  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line, 500);
    doc.text(wrapped, 40, y);
    y += wrapped.length * 16 + 8;
  }

  y += 12;
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(doc.splitTextToSize(t.note, 500), 40, y);
  doc.setFontSize(9);
  doc.text(PROJECT_EXECUTOR, 40, 800);

  return doc.output('blob');
}
