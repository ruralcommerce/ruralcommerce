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

function ssh(cmd) {
  const args = ['-o', 'BatchMode=yes', '-p', out.HETZNER_SSH_PORT || '22'];
  if (out.HETZNER_SSH_IDENTITY_FILE) args.push('-i', out.HETZNER_SSH_IDENTITY_FILE);
  args.push(`${out.HETZNER_DEPLOY_USER}@${out.HETZNER_DEPLOY_HOST}`, cmd);
  execFileSync('ssh', args, { stdio: 'inherit' });
}

function scp(local, remote) {
  const args = ['-o', 'BatchMode=yes', '-P', out.HETZNER_SSH_PORT || '22'];
  if (out.HETZNER_SSH_IDENTITY_FILE) args.push('-i', out.HETZNER_SSH_IDENTITY_FILE);
  args.push(local, `${out.HETZNER_DEPLOY_USER}@${out.HETZNER_DEPLOY_HOST}:${remote}`);
  execFileSync('scp', args, { stdio: 'inherit' });
}

function scpFrom(remote, local) {
  const args = ['-o', 'BatchMode=yes', '-P', out.HETZNER_SSH_PORT || '22'];
  if (out.HETZNER_SSH_IDENTITY_FILE) args.push('-i', out.HETZNER_SSH_IDENTITY_FILE);
  args.push(`${out.HETZNER_DEPLOY_USER}@${out.HETZNER_DEPLOY_HOST}:${remote}`, local);
  execFileSync('scp', args, { stdio: 'inherit' });
}

const action = process.argv[2] || 'all';
if (action === 'upload-nomina' || action === 'all') {
  ssh('mkdir -p /var/www/ruralcommerce/tmp');
  scp(
    path.join(root, 'tmp', 'frutalcoop-nomina-2026-09.json'),
    '/var/www/ruralcommerce/tmp/frutalcoop-nomina-2026-09.json'
  );
}
if (action === 'sync' || action === 'all') {
  ssh(
    'cd /var/www/ruralcommerce && node scripts/sync-frutalcoop-nomina.mjs tmp/frutalcoop-nomina-2026-09.json'
  );
}
if (action === 'welcome' || action === 'all') {
  ssh('cd /var/www/ruralcommerce && node scripts/send-frutalcoop-welcome.mjs --from-sync');
}
if (action === 'pull' || action === 'all') {
  scpFrom(
    '/var/www/ruralcommerce/tmp/frutalcoop-credentials-update.json',
    path.join(root, 'tmp', 'frutalcoop-credentials-update.json')
  );
  scpFrom(
    '/var/www/ruralcommerce/tmp/frutalcoop-sync-result.json',
    path.join(root, 'tmp', 'frutalcoop-sync-result.json')
  );
  scpFrom(
    '/var/www/ruralcommerce/tmp/frutalcoop-welcome-send-result.json',
    path.join(root, 'tmp', 'frutalcoop-welcome-send-result.json')
  );
}
