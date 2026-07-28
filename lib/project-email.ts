import { PROJECT_EXECUTOR, PROJECT_NAME } from '@/lib/project-brand';

export type ProjectEmailContent = {
  locale?: string;
  recipientName?: string;
  subject: string;
  /** Short headline inside the email */
  headline: string;
  /** Body paragraphs (plain strings) */
  paragraphs: string[];
  /** Optional numbered steps */
  steps?: string[];
  ctaLabel: string;
  ctaUrl: string;
  footnote?: string;
};

function localeKey(locale?: string) {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}

function greeting(name: string | undefined, locale?: string) {
  const key = localeKey(locale);
  if (key === 'en') return name ? `Hello ${name},` : 'Hello,';
  if (key === 'pt-BR') return name ? `Olá ${name},` : 'Olá,';
  return name ? `Hola ${name},` : 'Hola,';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function paragraphsToHtml(paragraphs: string[]) {
  return paragraphs
    .map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2F3336;">${escapeHtml(p)}</p>`)
    .join('');
}

function stepsToHtml(steps: string[], locale?: string) {
  const title =
    localeKey(locale) === 'en'
      ? 'What to do next'
      : localeKey(locale) === 'pt-BR'
        ? 'O que fazer agora'
        : 'Qué hacer ahora';
  const items = steps
    .map(
      (step, index) =>
        `<li style="margin:0 0 10px;font-size:15px;line-height:1.55;color:#2F3336;"><strong style="color:#071F5E;">${index + 1}.</strong> ${escapeHtml(step)}</li>`
    )
    .join('');
  return `<p style="margin:20px 0 10px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1D6359;">${title}</p><ol style="margin:0;padding-left:20px;">${items}</ol>`;
}

export function buildProjectEmailHtml(content: ProjectEmailContent) {
  const stepsBlock = content.steps?.length ? stepsToHtml(content.steps, content.locale) : '';
  const footnote = content.footnote
    ? `<p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:#6B7280;">${escapeHtml(content.footnote)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="${localeKey(content.locale)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F7FA;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5F7FA;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E6EBF1;">
        <tr><td style="background:#071F5E;padding:22px 24px;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9FD6D6;">${escapeHtml(PROJECT_NAME)}</p>
          <p style="margin:6px 0 0;font-size:14px;color:#ffffff;">${escapeHtml(PROJECT_EXECUTOR)}</p>
        </td></tr>
        <tr><td style="padding:24px;">
          <p style="margin:0 0 12px;font-size:15px;color:#2F3336;">${escapeHtml(greeting(content.recipientName, content.locale))}</p>
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.35;color:#071F5E;">${escapeHtml(content.headline)}</h1>
          ${paragraphsToHtml(content.paragraphs)}
          ${stepsBlock}
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0 8px;">
            <tr><td style="border-radius:999px;background:#52ADAD;">
              <a href="${escapeHtml(content.ctaUrl)}" style="display:inline-block;padding:14px 22px;font-size:15px;font-weight:700;color:#071F5E;text-decoration:none;">${escapeHtml(content.ctaLabel)}</a>
            </td></tr>
          </table>
          <p style="margin:12px 0 0;font-size:13px;line-height:1.5;color:#6B7280;word-break:break-all;">${escapeHtml(content.ctaUrl)}</p>
          ${footnote}
        </td></tr>
        <tr><td style="padding:16px 24px 22px;border-top:1px solid #E6EBF1;background:#FBFCFD;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#6B7280;">${escapeHtml(PROJECT_NAME)} · ${escapeHtml(PROJECT_EXECUTOR)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildProjectEmailText(content: ProjectEmailContent) {
  const lines = [
    greeting(content.recipientName, content.locale),
    '',
    content.headline,
    '',
    ...content.paragraphs,
  ];
  if (content.steps?.length) {
    lines.push('', localeKey(content.locale) === 'en' ? 'What to do next:' : localeKey(content.locale) === 'pt-BR' ? 'O que fazer agora:' : 'Qué hacer ahora:');
    content.steps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
  }
  lines.push('', content.ctaLabel + ':', content.ctaUrl);
  if (content.footnote) lines.push('', content.footnote);
  lines.push('', `— ${PROJECT_NAME} / ${PROJECT_EXECUTOR}`);
  return lines.join('\n');
}
