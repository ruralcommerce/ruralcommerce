/**
 * Envío de comunicaciones Impulsa Mipymes (formato corporativo).
 *
 *   # Solo validación (Tiago)
 *   node scripts/send-impulsa-comunicacion.mjs --validate
 *
 *   # Tras validación: masa a beneficiarios con consentimiento
 *   node scripts/send-impulsa-comunicacion.mjs --mass
 *
 *   # Destinatario puntual
 *   node scripts/send-impulsa-comunicacion.mjs --to=correo@ejemplo.com
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const rawLine of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}

loadEnvFile(path.join(root, '.env.production.local'));
loadEnvFile(path.join(root, '.env.local'));
loadEnvFile(path.join(root, '.env'));

const PROJECT_NAME = 'Impulsa Mipymes: digitaliza Los Santos';
const PROJECT_NAME_SHORT = 'Impulsa Mipymes';
const PROJECT_EXECUTOR = 'Rural Commerce';
const VALIDATION_EMAIL = 'tiagorezende@ruralcommerceglobal.com';

const siteUrl = (process.env.PROJETO_SITE_URL || 'https://ruralcommerceglobal.com').replace(
  /\/$/,
  ''
);

/** Contiene el comunicado actual — editar aquí antes de cada envío. */
const MESSAGE = {
  subject: 'Inscríbete al Taller de Digitalización Rural',
  headline: 'Taller de Digitalización Rural',
  recipientName: 'equipo',
  paragraphs: [
    'La tecnología puede ser la mejor aliada para tu negocio agrícola o agroindustrial. Te invitamos a participar en nuestro próximo taller presencial sobre Digitalización Rural, una sesión enfocada en mostrarte herramientas prácticas para mejorar tu eficiencia operativa y productiva.',
  ],
  topicsTitle: '¿Qué aprenderás en este taller?',
  topics: [
    {
      title: 'Sensores Agrícolas y Agroindustriales (IoT)',
      body: 'Conocerás cómo funcionan los sensores de bajo costo para medir humedad, clima y consumo de recursos, ayudándote a tomar decisiones precisas.',
    },
    {
      title: 'Automatización Básica',
      body: 'Descubrirás cómo la tecnología puede automatizar procesos clave, como el riego o el control en una deshidratadora solar, para ahorrar tiempo y reducir pérdidas.',
    },
    {
      title: 'Trazabilidad Digital',
      body: 'Aprenderás a integrar registros automáticos de pesaje y control de inventarios, eliminando el papel y lápiz.',
    },
    {
      title: 'Eficiencia Empresarial',
      body: 'Te mostraremos cómo la digitalización de estos procesos se traduce directamente en ahorro de costos y mayor rentabilidad para tu negocio.',
    },
  ],
  details: [
    { label: 'Fecha', value: '30 de noviembre' },
    { label: 'Hora', value: '14:00 h' },
    { label: 'Lugar', value: 'Por confirmar (te notificaremos pronto)' },
  ],
  steps: [
    'Reserva tu cupo con el botón de inscripción.',
    'Anota la fecha: 30 de noviembre a las 14:00 h.',
    'Llega listo para explorar herramientas prácticas de digitalización.',
  ],
  ctaLabel: 'Inscribirme al taller',
  ctaUrl: 'https://ruralcommerceglobal.com/es/actividad/ET2SJD',
  footnote: `Mensaje del proyecto ${PROJECT_NAME} / ${PROJECT_EXECUTOR}.`,
};

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function splitHeadline(headline) {
  const words = String(headline).trim().split(/\s+/);
  if (words.length < 3) return { lead: headline, accent: '' };
  const mid = Math.ceil(words.length / 2);
  return { lead: words.slice(0, mid).join(' '), accent: words.slice(mid).join(' ') };
}

function formatFromAddress(raw) {
  const email = String(raw || '').trim();
  if (!email) return '';
  if (email.includes('<') && email.includes('>')) return email;
  const name = (process.env.RESEND_FROM_NAME || PROJECT_EXECUTOR).replace(/"/g, '');
  return `"${name}" <${email}>`;
}

function deliverabilityHeaders() {
  const fromMailbox = String(process.env.RESEND_FROM_EMAIL || '')
    .replace(/^.*<([^>]+)>.*$/, '$1')
    .trim();
  const unsubUrl = `${siteUrl}/es/perfil`;
  const listUnsub = fromMailbox
    ? `<${unsubUrl}>, <mailto:${fromMailbox}?subject=unsubscribe>`
    : `<${unsubUrl}>`;
  return {
    'List-Unsubscribe': listUnsub,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    Precedence: 'bulk',
  };
}

function buildHtml(content) {
  const ruralLogoWhite = `${siteUrl}/images/logo-branco.png`;
  const projectLogo = `${siteUrl}/images/projeto/im-los-santos-logo-azul.png`;
  const { lead, accent } = splitHeadline(content.headline);
  const headlineHtml = accent
    ? `${escapeHtml(lead)}<br><span style="color:#23b8b5;">${escapeHtml(accent)}</span>`
    : escapeHtml(lead);

  const paragraphsHtml = content.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:#333333;">${escapeHtml(p)}</p>`
    )
    .join('');

  const topicsHtml = content.topics?.length
    ? `
    <p style="margin:32px 0 10px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#061f5b;">${escapeHtml(content.topicsTitle || 'Temas')}</p>
    <div style="width:34px;height:2px;background:#23b8b5;margin:0 0 22px;"></div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${content.topics
        .map(
          (topic, index) => `
        <tr>
          <td style="padding:0 0 ${index === content.topics.length - 1 ? '8' : '18'}px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4fbfb;border-radius:12px;">
              <tr>
                <td width="6" style="background:#23b8b5;border-radius:12px 0 0 12px;font-size:0;line-height:0;">&nbsp;</td>
                <td style="padding:18px 20px 18px 16px;">
                  <p style="margin:0 0 8px;font-size:16px;line-height:1.3;font-weight:800;color:#061f5b;">${escapeHtml(topic.title)}</p>
                  <p style="margin:0;font-size:15px;line-height:1.55;color:#444444;">${escapeHtml(topic.body)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
        )
        .join('')}
    </table>`
    : '';

  const detailsHtml = content.details?.length
    ? `
    <p style="margin:36px 0 10px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#061f5b;">Detalles de la actividad</p>
    <div style="width:34px;height:2px;background:#23b8b5;margin:0 0 18px;"></div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f9fb;border-radius:12px;">
      ${content.details
        .map(
          (row, index) => `
        <tr>
          <td style="padding:${index === 0 ? '16px' : '10px'} 20px ${index === content.details.length - 1 ? '16px' : '10px'} 20px;${index < content.details.length - 1 ? 'border-bottom:1px solid #e4ebef;' : ''}">
            <p style="margin:0 0 4px;font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#23b8b5;">${escapeHtml(row.label)}</p>
            <p style="margin:0;font-size:15px;line-height:1.45;color:#061f5b;font-weight:700;">${escapeHtml(row.value)}</p>
          </td>
        </tr>`
        )
        .join('')}
    </table>`
    : '';

  const stepsHtml = content.steps?.length
    ? `
    <p style="margin:36px 0 14px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#061f5b;">Qué hacer ahora</p>
    <div style="width:34px;height:2px;background:#23b8b5;margin:0 0 18px;"></div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${content.steps
        .map(
          (step, index) => `<tr>
          <td width="36" valign="top" style="padding:0 0 14px;">
            <div style="width:28px;height:28px;border-radius:50%;background:#23b8b5;color:#061f5b;font-size:14px;font-weight:800;line-height:28px;text-align:center;">${index + 1}</div>
          </td>
          <td valign="top" style="padding:4px 0 14px;font-size:15px;line-height:1.5;color:#333333;">${escapeHtml(step)}</td>
        </tr>`
        )
        .join('')}
    </table>`
    : '';

  const footnote = content.footnote
    ? `<p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#666666;">${escapeHtml(content.footnote)}</p>`
    : '';

  const greeting = content.recipientName
    ? `Hola ${escapeHtml(content.recipientName)},`
    : 'Hola,';

  return `<!DOCTYPE html>
<html lang="es">
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
  <tr>
    <td style="background:#061f5b;padding:40px 48px 44px;color:#ffffff;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="left" style="vertical-align:middle;">
            <a href="${escapeHtml(siteUrl)}" style="text-decoration:none;">
              <img src="${escapeHtml(ruralLogoWhite)}" alt="${escapeHtml(PROJECT_EXECUTOR)}" width="170" style="display:block;border:0;max-width:170px;height:auto;">
            </a>
          </td>
          <td align="right" style="vertical-align:middle;font-size:15px;color:#ffffff;">Comunicado oficial</td>
        </tr>
      </table>
      <div style="height:1px;background:rgba(255,255,255,0.35);margin:28px 0 36px;"></div>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.45;color:#ffffff;">${greeting}</p>
      <h1 style="margin:0;font-size:36px;line-height:1.05;font-weight:800;color:#ffffff;">${headlineHtml}</h1>
      <p style="margin:22px 0 0;max-width:520px;font-size:17px;line-height:1.45;color:#ffffff;">
        ${escapeHtml(PROJECT_NAME)}
        <span style="color:#23b8b5;font-weight:700;"> · ${escapeHtml(PROJECT_EXECUTOR)}</span>
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:44px 48px 20px;background:#ffffff;">
      <div style="width:34px;height:2px;background:#23b8b5;margin:0 0 24px;"></div>
      ${paragraphsHtml}
      ${topicsHtml}
      ${detailsHtml}
      ${stepsHtml}
      ${footnote}
    </td>
  </tr>
  <tr>
    <td style="padding:28px 48px;background:#effafa;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="88" valign="middle" style="padding-right:20px;">
            <img src="${escapeHtml(projectLogo)}" alt="${escapeHtml(PROJECT_NAME_SHORT)}" width="72" style="display:block;border:0;max-width:72px;height:auto;">
          </td>
          <td valign="middle">
            <p style="margin:0;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#061f5b;">${escapeHtml(PROJECT_NAME_SHORT)}</p>
            <p style="margin:6px 0 0;font-size:14px;line-height:1.4;color:#333333;">${escapeHtml(PROJECT_NAME)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="background:#061f5b;padding:42px 48px 40px;color:#ffffff;">
      <h2 style="margin:0;font-size:24px;line-height:1.2;font-weight:800;color:#ffffff;">${escapeHtml(content.ctaLabel)}</h2>
      <div style="width:34px;height:2px;background:#23b8b5;margin:20px 0;"></div>
      <div align="center" style="margin-top:8px;">
        <a href="${escapeHtml(content.ctaUrl)}" style="display:inline-block;background:#5ad8c5;color:#061f5b;text-decoration:none;padding:16px 42px;border-radius:40px;font-size:15px;font-weight:800;">
          ${escapeHtml(content.ctaLabel)} →
        </a>
      </div>
      <p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:rgba(255,255,255,0.7);word-break:break-all;">${escapeHtml(content.ctaUrl)}</p>
    </td>
  </tr>
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

function buildText(content) {
  const lines = [
    content.recipientName ? `Hola ${content.recipientName},` : 'Hola,',
    '',
    content.headline,
    '',
    ...content.paragraphs,
  ];
  if (content.topics?.length) {
    lines.push('', content.topicsTitle || 'Temas', '');
    content.topics.forEach((topic) => {
      lines.push(`• ${topic.title}`, `  ${topic.body}`, '');
    });
  }
  if (content.details?.length) {
    lines.push('Detalles de la actividad:');
    content.details.forEach((row) => lines.push(`${row.label}: ${row.value}`));
  }
  if (content.steps?.length) {
    lines.push('', 'Qué hacer ahora:');
    content.steps.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
  }
  lines.push('', `${content.ctaLabel}:`, content.ctaUrl);
  if (content.footnote) lines.push('', content.footnote);
  lines.push('', 'INTELIGENCIA SISTÉMICA PARA CADENAS REGENERATIVAS');
  lines.push(`— ${PROJECT_NAME} / ${PROJECT_EXECUTOR}`);
  return lines.join('\n');
}

function isPlaceholderEmail(email) {
  return /@acceso\.ruralcommerceglobal\.com$/i.test(String(email || ''));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

function listMassRecipients(options = {}) {
  const dataFile =
    options.dataFile ||
    path.join(root, 'data', 'project-inscriptions.json');
  if (!existsSync(dataFile)) {
    throw new Error(`No existe ${dataFile}`);
  }
  const raw = JSON.parse(readFileSync(dataFile, 'utf8'));
  const list = Array.isArray(raw) ? raw : raw.inscriptions || raw.items || [];
  const requireConsent = options.requireConsent !== false;
  const seen = new Set();
  const recipients = [];
  let skippedPlaceholder = 0;
  let skippedNoConsent = 0;
  let skippedInvalid = 0;

  for (const item of list) {
    const profile = item.profile || {};
    const user = item.user || {};
    const email = String(user.email || item.email || item.correo || '')
      .trim()
      .toLowerCase();
    if (!email || !isValidEmail(email)) {
      skippedInvalid += 1;
      continue;
    }
    if (isPlaceholderEmail(email)) {
      skippedPlaceholder += 1;
      continue;
    }
    if (seen.has(email)) continue;
    if (requireConsent && profile.marketingConsent !== true) {
      skippedNoConsent += 1;
      continue;
    }
    seen.add(email);
    recipients.push({
      email,
      name: String(profile.name || item.contactName || item.name || '').trim() || 'participante',
    });
  }

  return { recipients, skippedPlaceholder, skippedNoConsent, skippedInvalid, totalRecords: list.length };
}

function parseArgs(argv) {
  const flags = {
    validate: false,
    mass: false,
    to: null,
    dryRun: false,
    allInscriptions: false,
    dataFile: null,
  };
  for (const arg of argv) {
    if (arg === '--validate') flags.validate = true;
    else if (arg === '--mass') flags.mass = true;
    else if (arg === '--dry-run') flags.dryRun = true;
    else if (arg === '--all-inscriptions') flags.allInscriptions = true;
    else if (arg.startsWith('--to=')) flags.to = arg.slice(5).trim().toLowerCase();
    else if (arg.startsWith('--data=')) flags.dataFile = path.resolve(root, arg.slice('--data='.length).trim());
  }
  return flags;
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  if (!flags.validate && !flags.mass && !flags.to) {
    console.error('Usa --validate, --mass o --to=correo@dominio.com');
    process.exit(1);
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = formatFromAddress(process.env.RESEND_FROM_EMAIL);
  if (!apiKey || !from) {
    console.error('Falta RESEND_API_KEY o RESEND_FROM_EMAIL en el entorno.');
    process.exit(1);
  }

  let recipients = [];
  let massMeta = null;
  if (flags.validate) {
    recipients = [{ email: VALIDATION_EMAIL, name: 'Tiago' }];
  } else if (flags.to) {
    recipients = [{ email: flags.to, name: 'equipo' }];
  } else if (flags.mass) {
    massMeta = listMassRecipients({
      dataFile: flags.dataFile,
      requireConsent: !flags.allInscriptions,
    });
    recipients = massMeta.recipients;
    console.log(
      `Registros: ${massMeta.totalRecords} · omitidos placeholder: ${massMeta.skippedPlaceholder} · sin consentimiento: ${massMeta.skippedNoConsent} · inválidos: ${massMeta.skippedInvalid}`
    );
  }

  console.log(
    `Modo: ${flags.validate ? 'VALIDACIÓN' : flags.mass ? 'MASA' : 'PUNTUAL'} · ${recipients.length} destinatario(s)${flags.allInscriptions ? ' (todos los inscritos)' : ''}`
  );
  if (flags.dryRun) {
    console.log(recipients.map((r) => r.email).join('\n'));
    return;
  }

  const resend = new Resend(apiKey);
  const subject = `${PROJECT_NAME_SHORT} · ${MESSAGE.subject}`;
  const results = [];

  for (const recipient of recipients) {
    const content = {
      ...MESSAGE,
      recipientName: recipient.name,
    };
    const html = buildHtml(content);
    const text = buildText(content);
    try {
      const { data, error } = await resend.emails.send({
        from,
        to: [recipient.email],
        subject: flags.validate ? `[VALIDACIÓN] ${subject}` : subject,
        html,
        text,
        replyTo: process.env.RESEND_REPLY_TO || process.env.RESEND_FROM_EMAIL || undefined,
        headers: deliverabilityHeaders(),
        tags: [
          { name: 'category', value: flags.validate ? 'project_broadcast_validation' : 'project_broadcast' },
          { name: 'locale', value: 'es' },
        ],
      });
      if (error) {
        console.error('FAIL', recipient.email, error.message || error);
        results.push({ email: recipient.email, ok: false, error: error.message || String(error) });
      } else {
        console.log('OK', recipient.email, data?.id || '');
        results.push({ email: recipient.email, ok: true, id: data?.id });
      }
    } catch (err) {
      console.error('FAIL', recipient.email, err);
      results.push({
        email: recipient.email,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const outDir = path.join(root, 'tmp');
  mkdirSync(outDir, { recursive: true });
  const outFile = path.join(
    outDir,
    `impulsa-comunicacion-${flags.validate ? 'validate' : flags.mass ? 'mass' : 'to'}-${Date.now()}.json`
  );
  writeFileSync(
    outFile,
    JSON.stringify(
      {
        subject,
        ctaUrl: MESSAGE.ctaUrl,
        mode: flags.validate ? 'validate' : flags.mass ? 'mass' : 'to',
        sentAt: new Date().toISOString(),
        results,
      },
      null,
      2
    )
  );
  console.log('Log:', outFile);
  const failed = results.filter((r) => !r.ok).length;
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
