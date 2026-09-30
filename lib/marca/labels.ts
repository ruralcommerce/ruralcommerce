export function normalizeToneLabel(tone: string): string {
  const t = tone.toLowerCase();
  if (t === 'sobrio') return 'sóbrio';
  return t;
}
