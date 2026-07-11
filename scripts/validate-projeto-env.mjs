#!/usr/bin/env node
/**
 * Validates Impulso MiPyMEs project env vars (Resend, admin, WhatsApp, push).
 * Usage: node scripts/validate-projeto-env.mjs [--file .env.local]
 */

import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const args = process.argv.slice(2);
const fileArgIndex = args.indexOf('--file');
const envFile =
  fileArgIndex >= 0 && args[fileArgIndex + 1]
    ? path.resolve(root, args[fileArgIndex + 1])
    : path.join(root, '.env.local');

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const text = readFileSync(filePath, 'utf8');
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const fileEnv = parseEnvFile(envFile);
const env = { ...fileEnv, ...process.env };

function get(key) {
  return (env[key] || '').trim();
}

function status(ok, label, detail = '') {
  const icon = ok ? 'OK' : 'FALTA';
  console.log(`  [${icon}] ${label}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

const checks = [];

console.log('\nImpulso MiPyMEs — validação de ambiente\n');
console.log(`Arquivo: ${existsSync(envFile) ? envFile : '(não encontrado, só process.env)'}\n`);

console.log('Essencial (fluxo básico):');
checks.push(status(get('PROJETO_TEAM_PASSWORD').length >= 8, 'PROJETO_TEAM_PASSWORD', 'senha do painel /admin'));
checks.push(status(Boolean(get('RESEND_API_KEY')), 'RESEND_API_KEY', 'e-mails (equipe + aprovação + broadcast)'));
checks.push(status(Boolean(get('RESEND_FROM_EMAIL')), 'RESEND_FROM_EMAIL'));
checks.push(
  status(
    Boolean(get('PROJETO_SITE_URL')) || true,
    'PROJETO_SITE_URL',
    get('PROJETO_SITE_URL') || 'usa default https://ruralcommerceglobal.com'
  )
);

console.log('\nWhatsApp Utility (opcional — pula se vazio):');
const waOk =
  Boolean(get('WHATSAPP_CLOUD_TOKEN')) &&
  Boolean(get('WHATSAPP_PHONE_NUMBER_ID'));
checks.push(status(waOk, 'WHATSAPP_CLOUD_TOKEN + WHATSAPP_PHONE_NUMBER_ID'));
checks.push(
  status(
    true,
    'WHATSAPP_UTILITY_TEMPLATE_NAME',
    get('WHATSAPP_UTILITY_TEMPLATE_NAME') || 'projeto_atualizacao (default)'
  )
);
checks.push(
  status(
    true,
    'Template Meta',
    'Aprovar Utility "projeto_atualizacao" em Meta Business Manager'
  )
);

console.log('\nPush web (opcional — pula se vazio):');
const pushOk = Boolean(get('VAPID_PUBLIC_KEY')) && Boolean(get('VAPID_PRIVATE_KEY'));
checks.push(status(pushOk, 'VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY'));
checks.push(
  status(
    Boolean(get('VAPID_SUBJECT')) || pushOk,
    'VAPID_SUBJECT',
    get('VAPID_SUBJECT') || 'mailto:operations@...'
  )
);

if (!pushOk) {
  console.log('\n  Gerar chaves push: npx web-push generate-vapid-keys');
}

console.log('\nOnde enviar comunicações:');
console.log('  1. Login equipe → /[locale]/admin (ex. /es/admin)');
console.log('  2. Painel "Comunicação do projeto" no topo');
console.log('  3. Preencher assunto + mensagem + canais → Enviar');
console.log('  Destinatários: quem assinou convênio seção 6 (marketingConsent=true)\n');

const essentialOk = get('PROJETO_TEAM_PASSWORD').length >= 8 && get('RESEND_API_KEY') && get('RESEND_FROM_EMAIL');
if (!essentialOk) {
  console.log('Resultado: configure o essencial antes do deploy.\n');
  process.exit(1);
}

console.log('Resultado: essencial OK. WhatsApp/push são opcionais mas recomendados.\n');
process.exit(0);
