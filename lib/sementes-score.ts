import type { SementeRecord, SementeScoreBreakdown } from '@/lib/sementes-types';

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function specificity(value: string, min: number, max: number, cap: number) {
  const words = wordCount(value);
  if (words < 3) return 0;
  if (words >= min && words <= max) return cap;
  if (words > max) return Math.max(Math.round(cap * 0.65), cap - 6);
  return Math.round(cap * (words / min));
}

function feasibilityScore(fuel: string, chips: string[]) {
  const text = `${fuel} ${chips.join(' ')}`.toLowerCase();
  if (!text.trim()) return 0;
  let score = 6;
  if (chips.length) score += Math.min(6, chips.length * 2);
  if (/\d/.test(text)) score += 4;
  if (/(amanh|tomorrow|mañana|celular|whatsapp|teste|prueba|r\$|\$)/i.test(text)) score += 4;
  return Math.min(20, score);
}

function tokenize(value: string) {
  return new Set(
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 3)
  );
}

function jaccard(a: string, b: string) {
  const left = tokenize(a);
  const right = tokenize(b);
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  left.forEach((token) => {
    if (right.has(token)) overlap += 1;
  });
  return overlap / (left.size + right.size - overlap);
}

export function scoreSemente(seed: SementeRecord, others: SementeRecord[] = []): {
  total: number;
  breakdown: SementeScoreBreakdown;
} {
  const filled = [
    seed.path,
    seed.problem.trim(),
    seed.solution.trim(),
    seed.impacts.length,
    seed.impactNote.trim(),
    seed.fuel.trim() || seed.fuelChips.length,
  ].filter(Boolean).length;
  const complete = Math.round((filled / 6) * 12) + (seed.videoKey ? 3 : 0);

  const clarity = Math.min(
    20,
    Math.round(
      specificity(seed.problem, 6, 28, 10) + specificity(seed.solution, 8, 40, 10)
    )
  );

  const impact = Math.min(
    20,
    seed.impacts.length * 5 + (seed.impactNote.trim().length > 12 ? 5 : seed.impactNote.trim() ? 2 : 0)
  );

  const feasibility = feasibilityScore(seed.fuel, seed.fuelChips);
  const signal = seed.videoKey ? 15 : seed.status === 'published' ? 4 : 0;

  let originality = 10;
  const selfText = `${seed.problem} ${seed.solution}`;
  if (selfText.trim().length > 20 && others.length) {
    const closest = others.reduce((max, item) => {
      if (item.id === seed.id) return max;
      return Math.max(max, jaccard(selfText, `${item.problem} ${item.solution}`));
    }, 0);
    originality = closest > 0.55 ? 2 : closest > 0.35 ? 5 : 10;
  }

  const breakdown: SementeScoreBreakdown = {
    complete: Math.min(15, complete),
    clarity,
    impact,
    feasibility,
    signal,
    originality,
  };

  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  return { total, breakdown };
}

export function sementeHook(seed: Pick<SementeRecord, 'solution' | 'problem'>): string {
  const solution = seed.solution.trim();
  if (solution) return solution.length > 140 ? `${solution.slice(0, 137).trim()}…` : solution;
  const problem = seed.problem.trim();
  if (problem) return problem.length > 140 ? `${problem.slice(0, 137).trim()}…` : problem;
  return '';
}
