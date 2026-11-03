import { execFileSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const KEYS = [
  'HETZNER_DEPLOY_HOST',
  'HETZNER_DEPLOY_USER',
  'HETZNER_SSH_PORT',
  'HETZNER_SSH_IDENTITY_FILE',
];
const out = Object.fromEntries(KEYS.map((k) => [k, '']));
for (const name of ['.env.local', '.env']) {
  const filePath = path.join(root, name);
  if (!existsSync(filePath)) continue;
  for (const rawLine of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m || !KEYS.includes(m[1])) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (val && !out[m[1]]) out[m[1]] = val;
  }
}

const remoteCmd = process.argv.slice(2).join(' ');
if (!remoteCmd) {
  console.error('Usage: node scripts/ssh-remote.mjs <remote command>');
  process.exit(1);
}
const args = ['-o', 'BatchMode=yes', '-p', out.HETZNER_SSH_PORT || '22'];
if (out.HETZNER_SSH_IDENTITY_FILE) args.push('-i', out.HETZNER_SSH_IDENTITY_FILE);
args.push(`${out.HETZNER_DEPLOY_USER}@${out.HETZNER_DEPLOY_HOST}`, remoteCmd);
execFileSync('ssh', args, { stdio: 'inherit' });
