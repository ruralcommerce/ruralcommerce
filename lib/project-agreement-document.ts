import { getProjectAgreementCopy, type ProjectAgreementLocaleKey } from '@/lib/project-agreement-copy';
import { PROJECT_EXECUTOR, PROJECT_NAME } from '@/lib/project-brand';
import { formatProjectDate } from '@/lib/project-locale';

export type SignedAgreementDocumentInput = {
  candidateId?: string;
  fullName: string;
  email: string;
  organization?: string;
  signedAt?: string;
  locale?: string;
  documentId?: string;
  verificationCode?: string;
  ipAddress?: string;
};

const docLabels: Record<
  ProjectAgreementLocaleKey,
  {
    documentTitle: string;
    signedHeading: string;
    signedBy: string;
    signedEmail: string;
    signedOrganization: string;
    signedDate: string;
    acceptedTerms: string;
    signatureLine: string;
    electronicNote: string;
  }
> = {
  es: {
    documentTitle: 'Convenio de participación firmado',
    signedHeading: 'Constancia de firma electrónica',
    signedBy: 'Nombre completo',
    signedEmail: 'Correo electrónico',
    signedOrganization: 'Organización',
    signedDate: 'Fecha de firma',
    acceptedTerms: 'Términos aceptados al firmar',
    signatureLine: 'Firma electrónica',
    electronicNote:
      'Este documento refleja la firma electrónica registrada en la plataforma del proyecto. Conserva una copia para tus registros.',
  },
  'pt-BR': {
    documentTitle: 'Convênio de participação assinado',
    signedHeading: 'Comprovante de assinatura eletrônica',
    signedBy: 'Nome completo',
    signedEmail: 'E-mail',
    signedOrganization: 'Organização',
    signedDate: 'Data da assinatura',
    acceptedTerms: 'Termos aceitos ao assinar',
    signatureLine: 'Assinatura eletrônica',
    electronicNote:
      'Este documento reflete a assinatura eletrônica registrada na plataforma do projeto. Guarde uma cópia para seus registros.',
  },
  en: {
    documentTitle: 'Signed participation agreement',
    signedHeading: 'Electronic signature record',
    signedBy: 'Full name',
    signedEmail: 'Email',
    signedOrganization: 'Organization',
    signedDate: 'Signed on',
    acceptedTerms: 'Terms accepted when signing',
    signatureLine: 'Electronic signature',
    electronicNote:
      'This document reflects the electronic signature recorded on the project platform. Keep a copy for your records.',
  },
};

export function buildLegacyAgreementDocumentId(candidateId: string, signedAt?: string) {
  const base = `${candidateId}:${signedAt || 'legacy'}`;
  let hash = 0;
  for (let i = 0; i < base.length; i += 1) {
    hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
  }
  return `IMLS-LEG-${hash.toString(16).toUpperCase().padStart(8, '0')}`;
}

export function buildLegacyVerificationCode(candidateId: string, signedAt?: string, fullName?: string) {
  const base = `${candidateId}:${signedAt || 'legacy'}:${fullName || ''}`;
  let hash = 0;
  for (let i = 0; i < base.length; i += 1) {
    hash = (hash * 33 + base.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).toUpperCase().slice(0, 8);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getLocaleKey(locale?: string): ProjectAgreementLocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

export function buildSignedAgreementDocument(input: SignedAgreementDocumentInput) {
  const localeKey = getLocaleKey(input.locale);
  const agreement = getProjectAgreementCopy(localeKey);
  const labels = docLabels[localeKey];
  const signedDate = formatProjectDate(input.signedAt, localeKey);
  const organization = input.organization?.trim() || '—';

  const acceptanceItems = [
    agreement.networkCheckbox,
    agreement.imageRightsCheckbox,
    agreement.commitmentCheckbox,
    agreement.communicationsCheckbox,
  ];

  const acceptanceList = acceptanceItems
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');

  const agreementBody = [
    ...agreement.agreementParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`),
    `<h2>${escapeHtml(agreement.networkHeading)}</h2><p>${escapeHtml(agreement.networkText)}</p>`,
    `<h2>${escapeHtml(agreement.benefitsHeading)}</h2><p>${escapeHtml(agreement.benefitsText)}</p>`,
    `<h2>${escapeHtml(agreement.imageRightsHeading)}</h2><p>${escapeHtml(agreement.imageRightsText)}</p>`,
    `<h2>${escapeHtml(agreement.commitmentHeading)}</h2><p>${escapeHtml(agreement.commitmentText)}</p>`,
    `<h2>${escapeHtml(agreement.communicationsHeading)}</h2><p>${escapeHtml(agreement.communicationsText)}</p>`,
  ].join('');

  return `<!doctype html>
<html lang="${localeKey}">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(labels.documentTitle)} - ${escapeHtml(input.fullName)}</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; color: #1f2937; line-height: 1.55; margin: 32px; }
      h1 { color: #071f5e; font-size: 24px; margin: 0 0 8px; }
      h2 { color: #1d6359; font-size: 16px; margin: 24px 0 8px; }
      p { margin: 0 0 12px; font-size: 14px; }
      .meta { margin: 20px 0; border: 1px solid #d9e3ec; border-radius: 12px; padding: 16px; background: #f7fafb; }
      .meta-row { display: flex; gap: 12px; margin-bottom: 8px; font-size: 14px; }
      .meta-label { min-width: 160px; font-weight: 700; color: #071f5e; }
      .signature { margin-top: 24px; padding-top: 16px; border-top: 2px solid #52adad; }
      .signature-name { font-size: 22px; font-weight: 700; color: #071f5e; margin-top: 8px; }
      ul { margin: 8px 0 0 18px; padding: 0; }
      li { margin-bottom: 8px; font-size: 14px; }
      .note { margin-top: 24px; font-size: 12px; color: #4b5563; }
      .brand { font-size: 12px; color: #6b7280; margin-bottom: 16px; }
    </style>
  </head>
  <body>
    <p class="brand">${escapeHtml(PROJECT_NAME)} · ${escapeHtml(PROJECT_EXECUTOR)}</p>
    <h1>${escapeHtml(agreement.title)}</h1>
    <p>${escapeHtml(agreement.intro)}</p>

    <div class="meta">
      <h2 style="margin-top:0">${escapeHtml(labels.signedHeading)}</h2>
      <div class="meta-row"><span class="meta-label">${escapeHtml(labels.signedBy)}</span><span>${escapeHtml(input.fullName)}</span></div>
      <div class="meta-row"><span class="meta-label">${escapeHtml(labels.signedEmail)}</span><span>${escapeHtml(input.email)}</span></div>
      <div class="meta-row"><span class="meta-label">${escapeHtml(labels.signedOrganization)}</span><span>${escapeHtml(organization)}</span></div>
      <div class="meta-row"><span class="meta-label">${escapeHtml(labels.signedDate)}</span><span>${escapeHtml(signedDate)}</span></div>
    </div>

    <h2>${escapeHtml(agreement.agreementHeading)}</h2>
    ${agreementBody}

    <h2>${escapeHtml(labels.acceptedTerms)}</h2>
    <ul>${acceptanceList}</ul>

    <div class="signature">
      <p><strong>${escapeHtml(labels.signatureLine)}</strong></p>
      <p class="signature-name">${escapeHtml(input.fullName)}</p>
      <p>${escapeHtml(signedDate)}</p>
    </div>

    <p class="note">${escapeHtml(labels.electronicNote)}</p>
  </body>
</html>`;
}

export function buildSignedAgreementFilename(fullName: string, locale?: string) {
  const localeKey = getLocaleKey(locale);
  const prefix =
    localeKey === 'pt-BR' ? 'convenio-assinado' : localeKey === 'en' ? 'signed-agreement' : 'convenio-firmado';
  const slug = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `${prefix}${slug ? `-${slug}` : ''}.doc`;
}
