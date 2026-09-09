/** Canonical affiliation label for Frutalcoop associates (not the cooperative entity itself). */
export const FRUTALCOOP_AFFILIATION = 'Frutalcoop';

const FRUTALCOOP_COOP_ENTITY_ID = 'participant_1782404518722_4fpnwh';
const FRUTALCOOP_COOP_EMAILS = new Set(['gerencia@frutalcoop.net']);

export function normalizeOrgText(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

/** True when organization text is the cooperative name, not a distinct business. */
export function looksLikeFrutalcoopOrganization(organization: unknown): boolean {
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

/** The one inscription that represents Cooperativa Frutalcoop RL itself. */
export function isFrutalcoopCooperativeEntity(record: {
  id?: string;
  user?: { email?: string };
  profile?: { email?: string; name?: string; organization?: string };
}): boolean {
  if (record.id === FRUTALCOOP_COOP_ENTITY_ID) return true;
  const email = String(record.user?.email || record.profile?.email || '')
    .trim()
    .toLowerCase();
  if (FRUTALCOOP_COOP_EMAILS.has(email)) return true;
  const org = normalizeOrgText(record.profile?.organization);
  const name = normalizeOrgText(record.profile?.name);
  return (
    /^cooperativa\s+frutalcoop\b/i.test(org) && /johanna/i.test(name)
  );
}
