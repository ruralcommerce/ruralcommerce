/**
 * Move Frutalcoop out of profile.organization into profile.cooperative for associates.
 * Keeps the real cooperative entity (Johanna / Cooperativa Frutalcoop RL) unchanged.
 * When organization was just "Frutalcoop…", set organization to the person's name.
 *
 *   node scripts/migrate-frutalcoop-affiliation.mjs
 *   node scripts/migrate-frutalcoop-affiliation.mjs --dry-run
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataFile = path.join(root, 'data', 'project-inscriptions.json');
const dryRun = process.argv.includes('--dry-run');

const FRUTALCOOP_AFFILIATION = 'Frutalcoop';
const FRUTALCOOP_COOP_ENTITY_ID = 'participant_1782404518722_4fpnwh';
const FRUTALCOOP_COOP_EMAILS = new Set(['gerencia@frutalcoop.net']);

function normalizeOrgText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function looksLikeFrutalcoopOrganization(organization) {
  const raw = normalizeOrgText(organization).toLowerCase();
  if (!raw) return false;
  const compact = raw.replace(/[.\s_-]+/g, '');
  return (
    compact === 'frutalcoop' ||
    compact === 'frutalcooprl' ||
    compact === 'cooperativafrutalcoop' ||
    compact === 'cooperativafrutalcooprl' ||
    /^cooperativa\s*frutalcoop\b/.test(raw) ||
    /^frutalcoop(\s*r\.?\s*l\.?)?$/.test(raw)
  );
}

function isFrutalcoopCooperativeEntity(record) {
  if (record.id === FRUTALCOOP_COOP_ENTITY_ID) return true;
  const email = String(record.user?.email || record.profile?.email || '')
    .trim()
    .toLowerCase();
  if (FRUTALCOOP_COOP_EMAILS.has(email)) return true;
  const org = normalizeOrgText(record.profile?.organization);
  const name = normalizeOrgText(record.profile?.name);
  return /^cooperativa\s+frutalcoop\b/i.test(org) && /johanna/i.test(name);
}

if (!existsSync(dataFile)) {
  console.error('Missing', dataFile);
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = `${dataFile}.bak-frutalcoop-aff-${stamp}`;
if (!dryRun) {
  writeFileSync(backup, readFileSync(dataFile));
}

const records = JSON.parse(readFileSync(dataFile, 'utf8'));
const summary = {
  ok: true,
  dryRun,
  skippedCooperativeEntity: 0,
  setAffiliation: 0,
  replacedOrgWithName: 0,
  keptRealOrg: 0,
  samples: [],
};

for (const record of records) {
  if (!record.profile || typeof record.profile !== 'object') continue;
  if (record.teamTag !== 'frutalcoop') continue;

  if (isFrutalcoopCooperativeEntity(record)) {
    summary.skippedCooperativeEntity += 1;
    continue;
  }

  const name = normalizeOrgText(record.profile.name);
  const org = normalizeOrgText(record.profile.organization);
  const before = {
    id: record.id,
    name,
    organization: org,
    cooperative: record.profile.cooperative || null,
  };

  let changed = false;

  if (normalizeOrgText(record.profile.cooperative) !== FRUTALCOOP_AFFILIATION) {
    record.profile.cooperative = FRUTALCOOP_AFFILIATION;
    summary.setAffiliation += 1;
    changed = true;
  }

  if (looksLikeFrutalcoopOrganization(org) && name) {
    record.profile.organization = name;
    summary.replacedOrgWithName += 1;
    changed = true;
  } else if (org && !looksLikeFrutalcoopOrganization(org)) {
    summary.keptRealOrg += 1;
  } else if (!org && name) {
    record.profile.organization = name;
    summary.replacedOrgWithName += 1;
    changed = true;
  }

  if (changed) {
    record.updatedAt = new Date().toISOString();
    if (summary.samples.length < 8) {
      summary.samples.push({
        before,
        after: {
          organization: record.profile.organization,
          cooperative: record.profile.cooperative,
        },
      });
    }
  }
}

if (!dryRun) {
  writeFileSync(dataFile, JSON.stringify(records, null, 2), 'utf8');
  summary.backup = backup;
}

console.log(JSON.stringify(summary, null, 2));
