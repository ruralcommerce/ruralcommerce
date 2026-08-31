export const DIAGNOSIS_QUESTION_IDS = Array.from({ length: 26 }, (_, index) => `q${index + 1}`);

export type DiagnosisDraft = {
  answers: Record<string, string>;
  currentStep?: number;
  locale?: string;
  updatedAt: string;
};

export function sanitizeDiagnosisAnswers(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw || typeof raw !== 'object') return out;

  const source = raw as Record<string, unknown>;
  for (const key of DIAGNOSIS_QUESTION_IDS) {
    const value = source[key];
    if (typeof value === 'string') {
      const trimmed = value.trim().slice(0, 500);
      if (trimmed) out[key] = trimmed;
    }
  }

  return out;
}

export function hasAllDiagnosisAnswers(answers: Record<string, string>) {
  return DIAGNOSIS_QUESTION_IDS.every((key) => {
    const value = answers[key];
    return typeof value === 'string' && value.trim().length > 0;
  });
}

export function countFilledDiagnosisAnswers(answers: Record<string, string>) {
  return DIAGNOSIS_QUESTION_IDS.filter((key) => answers[key]?.trim()).length;
}

export function clampDiagnosisStep(step: unknown, maxStep: number) {
  if (typeof step !== 'number' || Number.isNaN(step)) return 0;
  return Math.min(Math.max(0, Math.floor(step)), maxStep);
}
