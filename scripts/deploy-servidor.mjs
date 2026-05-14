/**
 * Depois do "sync:saida" (Git), este script atualiza a VPS (ex.: Hetzner) via SSH.
 *
 * Configure no .env.local (na raiz do projeto):
 *   HETZNER_DEPLOY_HOST=IP_ou_dominio
 *   HETZNER_DEPLOY_USER=usuario_ssh
 *   HETZNER_DEPLOY_REMOTE_CMD=comando_unico_rodado_no_servidor
 *
 * Opcional:
 *   HETZNER_SSH_PORT=22
 *   HETZNER_SSH_IDENTITY_FILE=C:/Users/seuusuario/.ssh/id_ed25519
 *
 * Uso: npm run deploy:servidor
 */

import { execFileSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const KEYS = [
  'HETZNER_DEPLOY_HOST',
  'HETZNER_DEPLOY_USER',
  'HETZNER_DEPLOY_REMOTE_CMD',
  'HETZNER_SSH_PORT',
  'HETZNER_SSH_IDENTITY_FILE',
];

function loadKeysFromProjectEnv() {
  const out = Object.fromEntries(KEYS.map((k) => [k, '']));

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
      if (!KEYS.includes(key)) continue;
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (val && !out[key]) out[key] = val;
    }
  }

  for (const k of KEYS) {
    if (process.env[k]?.trim()) out[k] = process.env[k].trim();
  }

  return out;
}

console.log('\n========== DEPLOY NO SERVIDOR (SSH / Hetzner) ==========');
console.log('Pasta do projeto (local):', root);

const env = loadKeysFromProjectEnv();
const host = env.HETZNER_DEPLOY_HOST;
const user = env.HETZNER_DEPLOY_USER;
const remoteCmd = env.HETZNER_DEPLOY_REMOTE_CMD;
const port = env.HETZNER_SSH_PORT || '22';
const identity = env.HETZNER_SSH_IDENTITY_FILE;

if (!host || !user || !remoteCmd) {
  console.error('\n[ERRO] Falta configuracao no arquivo .env.local (na raiz do projeto).\n');
  console.error('Crie ou edite .env.local e coloque estas linhas (ajuste os valores):\n');
  console.error('  HETZNER_DEPLOY_HOST=IP_do_servidor_ou_dominio');
  console.error('  HETZNER_DEPLOY_USER=nome_do_usuario_ssh');
  console.error('  HETZNER_DEPLOY_REMOTE_CMD=cd /caminho/do/projeto && git pull && docker compose up -d --build');
  console.error('\n(O ultimo comando depende de como o site sobe na Hetzner: Docker, PM2, etc.)\n');
  console.error('Opcional: HETZNER_SSH_PORT=22');
  console.error('Opcional: HETZNER_SSH_IDENTITY_FILE=C:/Users/seuusuario/.ssh/id_ed25519\n');
  process.exit(1);
}

if (identity && !existsSync(identity)) {
  console.error(`\n[ERRO] Chave SSH nao encontrada: ${identity}\n`);
  process.exit(1);
}

const target = `${user}@${host}`;
const sshArgs = [
  '-o',
  'BatchMode=yes',
  '-o',
  'StrictHostKeyChecking=accept-new',
  '-p',
  String(port),
];

if (identity) {
  sshArgs.push('-i', identity);
}

sshArgs.push(target, remoteCmd);

console.log('\nConectando:', target, '(porta', port + ')');
console.log('Comando remoto:', remoteCmd);
console.log('');

try {
  execFileSync('ssh', sshArgs, { stdio: 'inherit' });
  console.log('\n----------');
  console.log('[OK] Comando no servidor terminou. Confira o site no navegador.');
  console.log('----------\n');
  process.exit(0);
} catch {
  console.error('\n----------');
  console.error('[ERRO] SSH falhou.');
  console.error('Verifique: IP/usuario, chave SSH, firewall (porta 22), e o comando remoto.');
  console.error('----------\n');
  process.exit(1);
}
