/**
 * Merge project env vars from .env.local into resend-server.env (not committed).
 * Usage: node scripts/merge-projeto-env.mjs
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = path.join(root, 'resend-server.env');

const KEYS = [
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'CONTACT_TO_EMAIL',
  'PROJETO_INSCRIPTION_NOTIFY_EMAILS',
  'PROJETO_SITE_URL',
  'PROJETO_TEAM_PASSWORD',
  'WHATSAPP_CLOUD_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_UTILITY_TEMPLATE_NAME',
  'WHATSAPP_UTILITY_TEMPLATE_LANG',
  'WHATSAPP_DEFAULT_COUNTRY_CODE',
  'VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY',
  'VAPID_SUBJECT',
];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const out = {};
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

const local = parseEnvFile(path.join(root, '.env.local'));
const existing = parseEnvFile(TARGET);
const merged = { ...existing };

for (const key of KEYS) {
  if (local[key]) merged[key] = local[key];
}

const header = [
  '# NAO commitar. Enviar ao servidor: npm run push:resend-env',
  '',
].join('\n');

const body = KEYS.filter((key) => merged[key]).map((key) => `${key}=${merged[key]}`).join('\n');

writeFileSync(TARGET, `${header}${body}\n`, 'utf8');
console.log('[OK] resend-server.env atualizado:', KEYS.filter((key) => merged[key]).join(', '));
