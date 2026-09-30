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
  paletteColors: string[];
  winnersBySection: Partial<Record<MarcaSection, MoodboardTile>>;
  collage: MoodboardTile[];
  topWords: { word: string; count: number }[];
  synthesis: string;
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

function buildSynthesis(freeTexts: { name: string; text: string }[], words: string[], tone: string): string {
  const snippets = freeTexts
    .map((f) => f.text.trim())
    .filter(Boolean)
    .slice(0, 3);
  const wordLine = words.slice(0, 8).join(', ');
  if (snippets.length) {
    const joined = snippets.map((s) => (s.length > 140 ? `${s.slice(0, 140)}…` : s)).join(' · ');
    return `A partir de las historias del grupo (${normalizeToneForCopy(tone)}): ${joined}${
      wordLine ? ` Palabras clave: ${wordLine}.` : ''
    }`;
  }
  if (wordLine) {
    return `La marca del taller se organiza en torno a lo ${normalizeToneForCopy(tone)}, con énfasis en: ${wordLine}.`;
  }
  return `El taller apunta a una identidad ${normalizeToneForCopy(tone)}, aún en construcción a partir de las elecciones visuales.`;
}

function normalizeToneForCopy(tone: string) {
  if (tone === 'sobrio') return 'sóbrio / sobrio';
  return tone;
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

  const dominantTone =
    computed.strong[0] ||
    winnersBySection.palette?.tone ||
    winnersBySection.logo?.tone ||
    'natural';

  const paletteColors =
    TONE_PALETTES[dominantTone] ||
    TONE_PALETTES.pastel.concat(
      Object.values(winnersBySection)
        .map((w) => images.find((i) => i.id === w.id)?.moodColor)
        .filter((c): c is string => Boolean(c))
    );

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

  const topWords = computed.wordFrequency.slice(0, 16);
  const onePage = buildOnePageCopy({
    clientName: contract.clientName,
    strong: computed.strong.length ? computed.strong : [dominantTone],
    words: topWords.map((w) => w.word),
    freeTexts: computed.freeTexts.map((f) => f.text),
  });

  return {
    clientName: contract.clientName,
    title: contract.title,
    generatedAt: new Date().toISOString(),
    dominantTone,
    paletteColors: paletteColors.slice(0, 6),
    winnersBySection,
    collage: [...collageMap.values()].slice(0, 10),
    topWords,
    synthesis: buildSynthesis(computed.freeTexts, topWords.map((w) => w.word), dominantTone),
    onePage,
    participantCount: computed.participantCount,
    completedCount: computed.completedCount,
  };
}
