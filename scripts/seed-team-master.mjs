#!/usr/bin/env node
/**
 * Upsert master team user without storing plaintext password in git.
 *
 * Usage (on server):
 *   PROJETO_MASTER_EMAIL=... PROJETO_MASTER_PASSWORD=... node scripts/seed-team-master.mjs
 */

import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomBytes, scryptSync } from 'crypto';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = path.join(root, 'data', 'project-team-members.json');

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const email = (process.env.PROJETO_MASTER_EMAIL || 'tiagorezende@ruralcommerceglobal.com').trim().toLowerCase();
  const password = (process.env.PROJETO_MASTER_PASSWORD || '').trim();
  const name = (process.env.PROJETO_MASTER_NAME || 'Tiago Rezende').trim();

  if (!password) {
    console.error('[seed-team-master] Defina PROJETO_MASTER_PASSWORD no ambiente.');
    process.exit(1);
  }

  let members = [];
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    members = Array.isArray(parsed) ? parsed : [];
  } catch {
    members = [];
  }

  const id = 'team_master_tiago';
  const now = new Date().toISOString();
  const passwordHash = hashPassword(password);
  const index = members.findIndex((member) => member.id === id || member.email === email);

  if (index === -1) {
    members.push({
      id,
      name,
      email,
      role: 'master',
      passwordHash,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    members[index] = {
      ...members[index],
      name,
      email,
      role: 'master',
      passwordHash,
      active: true,
      updatedAt: now,
    };
  }

  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(members, null, 2), 'utf8');
  console.log(`[seed-team-master] OK: ${email} (${id})`);
}

main().catch((error) => {
  console.error('[seed-team-master] Falhou:', error instanceof Error ? error.message : error);
  process.exit(1);
});
