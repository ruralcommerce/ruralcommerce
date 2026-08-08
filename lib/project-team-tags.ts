export const PROJECT_TEAM_TAGS = ['frutalcoop', 'aliados-frutalcoop', 'participantes'] as const;

export type ProjectTeamTag = (typeof PROJECT_TEAM_TAGS)[number];

export type ProjectTeamTagFilter = 'all' | 'none' | ProjectTeamTag;

const TAG_LABELS: Record<ProjectTeamTag, string> = {
  frutalcoop: 'Frutalcoop',
  'aliados-frutalcoop': 'Aliados Frutalcoop',
  participantes: 'Participantes',
};

export function isProjectTeamTag(value: unknown): value is ProjectTeamTag {
  return typeof value === 'string' && (PROJECT_TEAM_TAGS as readonly string[]).includes(value);
}

export function getProjectTeamTagLabel(tag: ProjectTeamTag | null | undefined) {
  if (!tag || !isProjectTeamTag(tag)) return '';
  return TAG_LABELS[tag];
}

export function normalizeProjectTeamTag(value: unknown): ProjectTeamTag | null {
  if (value === null || value === '' || value === 'none') return null;
  return isProjectTeamTag(value) ? value : null;
}
