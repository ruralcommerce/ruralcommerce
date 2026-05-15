/**
 * Copia resend-server.env (na raiz) para a VPS como .env.production.local — sem nano.
 *
 * Requisitos:
 *   - OpenSSH no Windows (comando `scp` no PATH)
 *   - Ficheiro resend-server.env na raiz (copiar de resend-server.env.example)
 *   - Mesmas variáveis HETZNER_* no .env.local que já usas para deploy:servidor
 *
 * Uso: npm run push:resend-env
 */

import { execFileSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCAL_FILE = path.join(root, 'resend-server.env');
const REMOTE_PATH = '/var/www/ruralcommerce/.env.production.local';

const HETZNER_KEYS = [
  'HETZNER_DEPLOY_HOST',
  'HETZNER_DEPLOY_USER',
  'HETZNER_DEPLOY_REMOTE_CMD',
  'HETZNER_SSH_PORT',
  'HETZNER_SSH_IDENTITY_FILE',
];

function loadHetznerFromEnvFiles() {
  const out = Object.fromEntries(HETZNER_KEYS.map((k) => [k, '']));

  for (const name of ['.env.local', '.env']) {
    const filePath = path.join(root, name);
    if (!existsSync(filePath)) continue;

    const text = readFileSync(filePath, 'utf8');
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      const key = m[1];
      if (!HETZNER_KEYS.includes(key)) continue;
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (val && !out[key]) out[key] = val;
    }
  }

  for (const k of HETZNER_KEYS) {
    if (process.env[k]?.trim()) out[k] = process.env[k].trim();
  }

  return out;
}

console.log('\n========== Enviar Resend → servidor (.env.production.local) ==========\n');

if (!existsSync(LOCAL_FILE)) {
  console.error('[ERRO] Falta o ficheiro na raiz do projeto:\n');
  console.error('  ', LOCAL_FILE);
  console.error('\n1) Copie resend-server.env.example → resend-server.env');
  console.error('2) Edite resend-server.env com a chave Resend e os emails.');
  console.error('3) Volte a correr: npm run push:resend-env\n');
  process.exit(1);
}

const env = loadHetznerFromEnvFiles();
const host = env.HETZNER_DEPLOY_HOST;
const user = env.HETZNER_DEPLOY_USER;
const port = env.HETZNER_SSH_PORT || '22';
const identity = env.HETZNER_SSH_IDENTITY_FILE;

if (!host || !user) {
  console.error('[ERRO] Defina HETZNER_DEPLOY_HOST e HETZNER_DEPLOY_USER no .env.local\n');
  process.exit(1);
}

if (identity && !existsSync(identity)) {
  console.error(`[ERRO] Chave SSH não encontrada: ${identity}\n`);
  process.exit(1);
}

const target = `${user}@${host}:${REMOTE_PATH}`;
const scpArgs = ['-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=accept-new', '-P', String(port)];

if (identity) {
  scpArgs.push('-i', identity);
}

scpArgs.push(LOCAL_FILE, target);

console.log('Origem (PC):', LOCAL_FILE);
console.log('Destino:', target);
console.log('');

try {
  execFileSync('scp', scpArgs, { stdio: 'inherit' });
  console.log('\n[OK] Ficheiro enviado. Reinicie o site no servidor:\n');
  console.log(`  ssh ${identity ? `-i ${identity} ` : ''}-p ${port} ${user}@${host} "pm2 restart ruralcommerce"\n`);
  console.log('(Se o processo PM2 tiver outro nome, use: pm2 list)\n');
  process.exit(0);
} catch {
  console.error('\n[ERRO] scp falhou. Confirme: OpenSSH instalado, chave SSH, IP e utilizador.\n');
  process.exit(1);
}
