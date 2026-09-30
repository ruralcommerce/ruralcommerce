import { buildOnePageCopy, computeVisualProfile } from './profile';
import type { MarcaContract, MarcaImage, MarcaSection, MarcaVisualProfile } from './types';

export const TONE_PALETTES: Record<string, string[]> = {
  pastel: ['#E8D5D0', '#F5E6DC', '#C9D5C4', '#A8B5C4', '#F0C9B0'],
  sobrio: ['#2F3336', '#5A6168', '#A8ADB2', '#E8E4DC', '#1A1D21'],
  terroso: ['#8B6914', '#C4A574', '#5C4033', '#D4C4A8', '#3D2914'],
  vibrante: ['#E85D04', '#F48C06', '#DC2F02', '#370617', '#FFBA08'],
};

export type MoodboardTile = {
  id: string;
  src: string;
  alt: string;
  tone?: string;
  section?: string;
  votes: number;
};

export type FinalWorkshopMoodboard = {
  clientName: string;
  title: string;
  generatedAt: string;
  dominantTone: string;
  /** tones that contributed to the suggested palette, ranked */
  contributingTones: string[];
  paletteColors: string[];
  winnersBySection: Partial<Record<MarcaSection, MoodboardTile>>;
  collage: MoodboardTile[];
  topWords: { word: string; count: number }[];
  synthesis: string;
  visualDirection?: string;
  generatedByAi?: boolean;
  onePage: { headline: string; promise: string; personality: string; voice: string };
  participantCount: number;
  completedCount: number;
};

function voteCount(contract: MarcaContract, imageId: string): number {
  let n = 0;
  for (const p of contract.participants) {
    for (const id of Object.values(p.sectionPicks || {})) {
      if (id === imageId) n += 1;
    }
  }
  return n;
}

function pickSectionWinner(
  contract: MarcaContract,
  images: MarcaImage[],
  section: MarcaSection
): MoodboardTile | undefined {
  const byId = new Map(images.map((img) => [img.id, img]));
  const counts = new Map<string, number>();
  for (const p of contract.participants) {
    const id = p.sectionPicks?.[section];
    if (!id) continue;
    counts.set(id, (counts.get(id) || 0) + 1);
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!best) return undefined;
  const img = byId.get(best[0]);
  if (!img) return undefined;
  return {
    id: img.id,
    src: img.src,
    alt: img.alt,
    tone: img.tone,
    section,
    votes: best[1],
  };
}

/** Rank tones from palette votes first, then all section picks as tie-breakers. */
export function rankTonesFromVotes(
  contract: MarcaContract,
  images: MarcaImage[]
): { tone: string; count: number }[] {
  const byId = new Map(images.map((img) => [img.id, img]));
  const paletteCounts = new Map<string, number>();
  const allCounts = new Map<string, number>();

  for (const p of contract.participants) {
    const paletteId = p.sectionPicks?.palette;
    if (paletteId) {
      const tone = (byId.get(paletteId)?.tone || 'outro').toString();
      paletteCounts.set(tone, (paletteCounts.get(tone) || 0) + 1);
    }
    for (const section of ['palette', 'logo', 'packaging'] as MarcaSection[]) {
      const id = p.sectionPicks?.[section];
      if (!id) continue;
      const tone = (byId.get(id)?.tone || 'outro').toString();
      allCounts.set(tone, (allCounts.get(tone) || 0) + 1);
    }
  }

  const tones = new Set([...paletteCounts.keys(), ...allCounts.keys()]);
  return [...tones]
    .map((tone) => ({
      tone,
      count: (paletteCounts.get(tone) || 0) * 3 + (allCounts.get(tone) || 0),
    }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);
}

/**
 * Build a suggested brand palette from ALL voted tones (interleaved),
 * not a single hardcoded tone — so vibrante + sobrio does not collapse to greys.
 */
export function buildSuggestedPaletteColors(input: {
  rankedTones: { tone: string; count: number }[];
  images: MarcaImage[];
  winnerIds: string[];
}): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  const push = (hex?: string) => {
    if (!hex) return;
    const key = hex.toUpperCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(hex);
  };

  for (const id of input.winnerIds) {
    const img = input.images.find((i) => i.id === id);
    push(img?.moodColor);
  }

  const top = input.rankedTones.slice(0, 3);
  if (!top.length) {
    TONE_PALETTES.pastel.forEach(push);
    return out.slice(0, 6);
  }

  const pools = top.map(({ tone, count }) => ({
    colors: [...(TONE_PALETTES[tone] || TONE_PALETTES.pastel)],
    weight: Math.max(1, count),
  }));

  let guard = 0;
  while (out.length < 6 && guard < 24) {
    guard += 1;
    let added = false;
    for (const pool of pools) {
      const take = pool.weight >= pools[0].weight ? 2 : 1;
      for (let i = 0; i < take && pool.colors.length && out.length < 6; i += 1) {
        push(pool.colors.shift());
        added = true;
      }
    }
    if (!added) break;
  }

  return out.slice(0, 6);
}

function buildSynthesis(freeTexts: { name: string; text: string }[], words: string[], tone: string): string {
  const snippets = freeTexts
    .map((f) => f.text.trim())
    .filter(Boolean)
    .slice(0, 3);
  const wordLine = words.slice(0, 8).join(', ');
  if (snippets.length) {
    const joined = snippets.map((s) => (s.length > 140 ? `${s.slice(0, 140)}…` : s)).join(' · ');
    return `A partir de las historias del grupo (${tone}): ${joined}${wordLine ? ` Palabras clave: ${wordLine}.` : ''}`;
  }
  if (wordLine) {
    return `La marca del taller se organiza en torno a ${tone}, con énfasis en: ${wordLine}.`;
  }
  return `El taller apunta a una identidad ${tone}, aún en construcción a partir de las elecciones visuales.`;
}

export function buildFinalWorkshopMoodboard(
  contract: MarcaContract,
  images: MarcaImage[],
  profile?: MarcaVisualProfile
): FinalWorkshopMoodboard {
  const computed = profile || computeVisualProfile(contract, images);
  const sections: MarcaSection[] = ['palette', 'logo', 'packaging'];
  const winnersBySection: FinalWorkshopMoodboard['winnersBySection'] = {};
  for (const section of sections) {
    const winner = pickSectionWinner(contract, images, section);
    if (winner) winnersBySection[section] = winner;
  }

  const rankedTones = rankTonesFromVotes(contract, images);
  const contributingTones = rankedTones.map((t) => t.tone);
  const dominantTone =
    contributingTones.length > 1
      ? contributingTones.slice(0, 2).join(' · ')
      : contributingTones[0] || computed.strong[0] || 'natural';

  const winnerIds = [
    ...Object.values(winnersBySection).map((w) => w.id),
    ...computed.topImageIds,
  ];

  const paletteColors = buildSuggestedPaletteColors({
    rankedTones,
    images,
    winnerIds,
  });

  const collageMap = new Map<string, MoodboardTile>();
  for (const winner of Object.values(winnersBySection)) {
    collageMap.set(winner.id, winner);
  }
  for (const id of computed.topImageIds) {
    if (collageMap.has(id)) continue;
    const img = images.find((i) => i.id === id);
    if (!img) continue;
    collageMap.set(id, {
      id: img.id,
      src: img.src,
      alt: img.alt,
      tone: img.tone,
      section: img.section,
      votes: voteCount(contract, img.id),
    });
  }

  const ordered: MoodboardTile[] = [];
  for (const section of sections) {
    const w = winnersBySection[section];
    if (w && !ordered.find((t) => t.id === w.id)) ordered.push(w);
  }
  // Every participant pick (all sections) so the board is a real mix of choices
  const byId = new Map(images.map((img) => [img.id, img]));
  for (const p of contract.participants) {
    for (const section of sections) {
      const id = p.sectionPicks?.[section];
      if (!id || ordered.find((t) => t.id === id)) continue;
      const img = byId.get(id);
      if (!img) continue;
      ordered.push({
        id: img.id,
        src: img.src,
        alt: img.alt,
        tone: img.tone,
        section,
        votes: voteCount(contract, img.id),
      });
    }
  }
  for (const tile of collageMap.values()) {
    if (!ordered.find((t) => t.id === tile.id)) ordered.push(tile);
  }

  const topWords = computed.wordFrequency.slice(0, 16);
  const onePage = buildOnePageCopy({
    clientName: contract.clientName,
    strong: contributingTones.length ? contributingTones : computed.strong,
    words: topWords.map((w) => w.word),
    freeTexts: computed.freeTexts.map((f) => f.text),
  });

  return {
    clientName: contract.clientName,
    title: contract.title,
    generatedAt: new Date().toISOString(),
    dominantTone,
    contributingTones,
    paletteColors: paletteColors.slice(0, 6),
    winnersBySection,
    collage: ordered.slice(0, 12),
    topWords,
    synthesis: buildSynthesis(computed.freeTexts, topWords.map((w) => w.word), dominantTone),
    onePage,
    participantCount: computed.participantCount,
    completedCount: computed.completedCount,
  };
}
