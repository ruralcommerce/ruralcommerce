#!/usr/bin/env node
/**
 * Informe mensual de inversiones (silencio + envíos).
 * Crontab Hetzner, día 1 a las 14:00 CR (20:00 UTC):
 *   0 20 1 * * curl -sS -X POST -H "x-cron-secret: $PROJETO_CRON_SECRET" -H "Content-Type: application/json" -d '{}' https://ruralcommerceglobal.com/api/projeto/investments/digest
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseEnv(filePath) {
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

const env = { ...parseEnv(path.join(root, '.env.local')), ...process.env };
const secret = (env.PROJETO_CRON_SECRET || '').trim();
const base = (env.PROJETO_SITE_URL || 'https://ruralcommerceglobal.com').replace(/\/$/, '');
if (!secret) {
  console.error('Falta PROJETO_CRON_SECRET');
  process.exit(1);
}

const response = await fetch(`${base}/api/projeto/investments/digest`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-cron-secret': secret },
  body: JSON.stringify({}),
});
const payload = await response.json();
if (!response.ok || !payload.ok) {
  console.error(payload);
  process.exit(1);
}
console.log('Digest OK', payload.result);
