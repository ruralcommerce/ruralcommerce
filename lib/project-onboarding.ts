/** Invite-path participants are not fully in the project until diagnosis is done. */
export function isOnboardingStatus(status: unknown) {
  return status === 'onboarding';
}

export function canSignAgreement(status: unknown) {
  return status === 'approved' || status === 'onboarding';
}

export function canSubmitDiagnosis(status: unknown) {
  return status === 'approved' || status === 'onboarding';
}

export function isFullyInProject(record: {
  status?: unknown;
  profile?: { agreement?: { signed?: boolean }; diagnosis?: { answers?: unknown } } | null;
}) {
  if (record.status !== 'approved') return false;
  if (record.profile?.agreement?.signed !== true) return false;
  return Boolean(record.profile?.diagnosis?.answers);
}
