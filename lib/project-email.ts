import {
  PROJECT_EXECUTOR,
  PROJECT_NAME,
  PROJECT_NAME_SHORT,
  PROJECT_LOGO_PATH,
  RURAL_COMMERCE_LOGO_WHITE_PATH,
  RURAL_COMMERCE_TAGLINE,
  absoluteProjectAsset,
  projectSiteBaseUrl,
} from '@/lib/project-brand';

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

function officialLabel(locale?: string) {
  const key = localeKey(locale);
  if (key === 'en') return 'Official notice';
  if (key === 'pt-BR') return 'Comunicado oficial';
  return 'Comunicado oficial';
}

function stepsTitle(locale?: string) {
  const key = localeKey(locale);
  if (key === 'en') return 'What to do next';
  if (key === 'pt-BR') return 'O que fazer agora';
  return 'Qué hacer ahora';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function splitHeadline(headline: string) {
  const words = headline.trim().split(/\s+/);
  if (words.length < 3) {
    return { lead: headline, accent: '' };
  }
  const mid = Math.ceil(words.length / 2);
  return {
    lead: words.slice(0, mid).join(' '),
    accent: words.slice(mid).join(' '),
  };
}

function paragraphsToHtml(paragraphs: string[]) {
  return paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:#333333;">${escapeHtml(p)}</p>`
    )
    .join('');
}

function stepsToHtml(steps: string[], locale?: string) {
  const items = steps
    .map(
      (step, index) =>
        `<tr>
          <td width="36" valign="top" style="padding:0 0 14px;">
            <div style="width:28px;height:28px;border-radius:50%;background:#23b8b5;color:#061f5b;font-size:14px;font-weight:800;line-height:28px;text-align:center;">${index + 1}</div>
          </td>
          <td valign="top" style="padding:4px 0 14px;font-size:15px;line-height:1.5;color:#333333;">${escapeHtml(step)}</td>
        </tr>`
    )
    .join('');

  return `
    <p style="margin:28px 0 14px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#061f5b;">${escapeHtml(stepsTitle(locale))}</p>
    <div style="width:34px;height:2px;background:#23b8b5;margin:0 0 18px;"></div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items}</table>`;
}

/**
 * Transactional emails based on Rural Commerce corporate email-mkt.html.
 * Keeps RC white logo in hero/footer; project logo appears in a supporting band.
 */
export function buildProjectEmailHtml(content: ProjectEmailContent) {
  const ruralLogoWhite = absoluteProjectAsset(RURAL_COMMERCE_LOGO_WHITE_PATH);
  const projectLogo = absoluteProjectAsset(PROJECT_LOGO_PATH);
  const siteUrl = projectSiteBaseUrl();
  const { lead, accent } = splitHeadline(content.headline);
  const stepsBlock = content.steps?.length ? stepsToHtml(content.steps, content.locale) : '';
  const footnote = content.footnote
    ? `<p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#666666;">${escapeHtml(content.footnote)}</p>`
    : '';

  const headlineHtml = accent
    ? `${escapeHtml(lead)}<br><span style="color:#23b8b5;">${escapeHtml(accent)}</span>`
    : escapeHtml(lead);

  return `<!DOCTYPE html>
<html lang="${localeKey(content.locale)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(content.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f8;font-family:Arial, Helvetica, sans-serif;color:#061f5b;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f7f8;">
<tr>
<td align="center" style="padding:24px 12px;">

<table width="800" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:800px;background:#ffffff;">

  <!-- HERO -->
  <tr>
    <td style="background:#061f5b;padding:40px 48px 44px;color:#ffffff;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="left" style="vertical-align:middle;">
            <a href="${escapeHtml(siteUrl)}" style="text-decoration:none;">
              <img src="${escapeHtml(ruralLogoWhite)}" alt="${escapeHtml(PROJECT_EXECUTOR)}" width="170" style="display:block;border:0;max-width:170px;height:auto;">
            </a>
          </td>
          <td align="right" style="vertical-align:middle;font-size:15px;color:#ffffff;">
            ${escapeHtml(officialLabel(content.locale))}
          </td>
        </tr>
      </table>

      <div style="height:1px;background:rgba(255,255,255,0.35);margin:28px 0 36px;"></div>

      <p style="margin:0 0 18px;font-size:15px;line-height:1.45;color:#ffffff;">
        ${escapeHtml(greeting(content.recipientName, content.locale))}
      </p>

      <h1 style="margin:0;font-size:36px;line-height:1.05;font-weight:800;color:#ffffff;">
        ${headlineHtml}
      </h1>

      <p style="margin:22px 0 0;max-width:520px;font-size:17px;line-height:1.45;color:#ffffff;">
        ${escapeHtml(PROJECT_NAME)}
        <span style="color:#23b8b5;font-weight:700;"> · ${escapeHtml(PROJECT_EXECUTOR)}</span>
      </p>
    </td>
  </tr>

  <!-- CONTENT -->
  <tr>
    <td style="padding:44px 48px 20px;background:#ffffff;">
      <div style="width:34px;height:2px;background:#23b8b5;margin:0 0 24px;"></div>
      ${paragraphsToHtml(content.paragraphs)}
      ${stepsBlock}
      ${footnote}
    </td>
  </tr>

  <!-- PROJECT BAND (project logo — RC logo stays in hero/footer) -->
  <tr>
    <td style="padding:28px 48px;background:#effafa;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="88" valign="middle" style="padding-right:20px;">
            <img src="${escapeHtml(projectLogo)}" alt="${escapeHtml(PROJECT_NAME_SHORT)}" width="72" style="display:block;border:0;max-width:72px;height:auto;">
          </td>
          <td valign="middle">
            <p style="margin:0;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#061f5b;">
              ${escapeHtml(PROJECT_NAME_SHORT)}
            </p>
            <p style="margin:6px 0 0;font-size:14px;line-height:1.4;color:#333333;">
              ${escapeHtml(PROJECT_NAME)}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td style="background:#061f5b;padding:42px 48px 40px;color:#ffffff;">
      <h2 style="margin:0;font-size:24px;line-height:1.2;font-weight:800;color:#ffffff;">
        ${escapeHtml(content.ctaLabel)}
      </h2>
      <div style="width:34px;height:2px;background:#23b8b5;margin:20px 0;"></div>
      <div align="center" style="margin-top:8px;">
        <a href="${escapeHtml(content.ctaUrl)}" style="display:inline-block;background:#5ad8c5;color:#061f5b;text-decoration:none;padding:16px 42px;border-radius:40px;font-size:15px;font-weight:800;">
          ${escapeHtml(content.ctaLabel)} →
        </a>
      </div>
      <p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:rgba(255,255,255,0.7);word-break:break-all;">
        ${escapeHtml(content.ctaUrl)}
      </p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#202020;padding:24px 48px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="34%" valign="middle">
            <img src="${escapeHtml(ruralLogoWhite)}" alt="${escapeHtml(PROJECT_EXECUTOR)}" width="140" style="display:block;border:0;max-width:140px;height:auto;">
          </td>
          <td width="66%" valign="middle" style="border-left:1px solid rgba(255,255,255,0.35);padding-left:28px;">
            <p style="margin:0;font-size:11px;line-height:1.5;letter-spacing:2px;color:#ffffff;">
              INTELIGENCIA <span style="color:#23b8b5;">SISTÉMICA</span><br>
              PARA CADENAS REGENERATIVAS
            </p>
            <p style="margin:10px 0 0;font-size:11px;line-height:1.4;color:rgba(255,255,255,0.55);">
              ${escapeHtml(PROJECT_NAME)} · ${escapeHtml(PROJECT_EXECUTOR)}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>

</td>
</tr>
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
    lines.push('', stepsTitle(content.locale) + ':');
    content.steps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
  }
  lines.push('', content.ctaLabel + ':', content.ctaUrl);
  if (content.footnote) lines.push('', content.footnote);
  lines.push('', RURAL_COMMERCE_TAGLINE);
  lines.push(`— ${PROJECT_NAME} / ${PROJECT_EXECUTOR}`);
  return lines.join('\n');
}
