/**
 * Send Frutalcoop welcome / convenio emails.
 *
 *   node scripts/send-frutalcoop-welcome.mjs
 *   node scripts/send-frutalcoop-welcome.mjs --from-sync
 *   node scripts/send-frutalcoop-welcome.mjs --pending-convenio
 *   node scripts/send-frutalcoop-welcome.mjs --ids=id1,id2
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dataFile = path.join(root, 'data', 'project-inscriptions.json');
const outFile = path.join(root, 'tmp', 'frutalcoop-welcome-send-result.json');

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

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isPlaceholderEmail(email) {
  return /@acceso\.ruralcommerceglobal\.com$/i.test(String(email || ''));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

const siteUrl = (process.env.PROJETO_SITE_URL || 'https://ruralcommerceglobal.com').replace(/\/$/, '');
const SUBJECT = 'Bienvenida Frutalcoop · activa tu cuenta, firma el convenio y completa el diagnóstico';

function buildHtml(name) {
  const greeting = name ? `Hola ${escapeHtml(name)},` : 'Hola,';
  const profileUrl = `${siteUrl}/es/perfil`;
  const convenioUrl = `${siteUrl}/es/projeto/convenio`;
  return `<!DOCTYPE html><html lang="es"><body style="margin:0;padding:0;background:#f4f7f8;font-family:Arial,Helvetica,sans-serif;color:#061f5b;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f8;"><tr><td align="center" style="padding:24px 12px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#061f5b;padding:28px 32px;color:#fff;">
<p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#23b8b5;">Comunicado oficial</p>
<h1 style="margin:0;font-size:28px;line-height:1.2;">Bienvenida Frutalcoop<br><span style="color:#23b8b5;">activa tu cuenta y continúa el proceso</span></h1>
</td></tr>
<tr><td style="padding:28px 32px;">
<p style="margin:0 0 16px;font-size:15px;line-height:1.55;">${greeting}</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.55;">Te escribimos desde Rural Commerce, organización ejecutora del proyecto Impulso MiPyMEs: digitaliza Los Santos. Tu participación como asociado/a de Frutalcoop ya fue registrada y aprobada. Si actualizamos tu correo, este es el mensaje oficial para continuar (la contraseña no cambia, salvo cuentas nuevas).</p>
<p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Qué hacer ahora</p>
<ol style="margin:0 0 20px;padding-left:20px;font-size:15px;line-height:1.55;">
<li>Entra a tu perfil con el correo de este mensaje y tu contraseña.</li>
<li>Cambia la contraseña provisional si aún no lo hiciste.</li>
<li>Firma el convenio de participación (obligatorio).</li>
<li>Completa el diagnóstico cuando el convenio esté firmado.</li>
</ol>
<p style="margin:0 0 12px;"><a href="${profileUrl}" style="display:inline-block;background:#52ADAD;color:#061f5b;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px;">Ir a mi perfil</a></p>
<p style="margin:0;"><a href="${convenioUrl}" style="color:#1D6359;font-weight:700;">Ir a firmar el convenio</a></p>
</td></tr>
</table>
</td></tr></table></body></html>`;
}

function buildText(name) {
  return `${name ? `Hola ${name},` : 'Hola,'}

Tu participación Frutalcoop está aprobada en Impulso MiPyMEs.

1) Entra a ${siteUrl}/es/perfil
2) Cambia la contraseña provisional si aplica
3) Firma el convenio: ${siteUrl}/es/projeto/convenio
4) Completa el diagnóstico

Rural Commerce`;
}

const idsArg = process.argv.find((a) => a.startsWith('--ids='));
const onlyIds = idsArg
  ? new Set(idsArg.slice(6).split(',').map((s) => s.trim()).filter(Boolean))
  : null;
const pendingConvenioOnly = process.argv.includes('--pending-convenio');
const fromSync = process.argv.includes('--from-sync');

let syncIds = null;
if (fromSync) {
  const syncPath = path.join(root, 'tmp', 'frutalcoop-sync-result.json');
  if (existsSync(syncPath)) {
    syncIds = new Set(JSON.parse(readFileSync(syncPath, 'utf8')).sendWelcomeIds || []);
  }
}

const apiKey = process.env.RESEND_API_KEY || '';
const from =
  process.env.RESEND_FROM_EMAIL ||
  process.env.PROJETO_EMAIL_FROM ||
  process.env.RESEND_FROM ||
  '';
if (!apiKey || !from) {
  console.error('Missing RESEND_API_KEY or RESEND_FROM_EMAIL');
  process.exit(1);
}

const resend = new Resend(apiKey);
const records = JSON.parse(readFileSync(dataFile, 'utf8'));
const results = [];

for (const record of records) {
  if (record.teamTag !== 'frutalcoop') continue;
  if (onlyIds && !onlyIds.has(record.id)) continue;
  if (syncIds && !syncIds.has(record.id)) continue;
  if (pendingConvenioOnly && record.profile?.agreement?.signed === true) continue;
  if (record.profile?.emailPending) continue;

  const email = String(record.user?.email || record.profile?.email || '')
    .trim()
    .toLowerCase();
  if (!email || !isValidEmail(email) || isPlaceholderEmail(email)) continue;

  const name = record.profile?.name || '';
  try {
    const { error } = await resend.emails.send({
      from,
      to: [email],
      subject: SUBJECT,
      html: buildHtml(name),
      text: buildText(name),
    });
    results.push({ id: record.id, email, name, ok: !error, error: error?.message || null });
    console.log(error ? `fail ${email}` : `sent ${email}`);
  } catch (err) {
    results.push({ id: record.id, email, name, ok: false, error: String(err) });
    console.error('fail', email, err);
  }
}

mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(
  outFile,
  JSON.stringify(
    {
      at: new Date().toISOString(),
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    },
    null,
    2
  ),
  'utf8'
);
console.log(
  JSON.stringify(
    { sent: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length },
    null,
    2
  )
);
