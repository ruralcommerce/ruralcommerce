import type {
  MarcaContract,
  MarcaImage,
  MarcaSection,
  MarcaVisualProfile,
  MarcaWords,
} from './types';

function emptyWords(): MarcaWords {
  return { selected: [], people: [], places: [], product: [] };
}

function mergeUnique(lists: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of lists) {
    for (const raw of list) {
      const word = raw.trim();
      if (!word) continue;
      const key = word.toLocaleLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(word);
    }
  }
  return out;
}

export function computeVisualProfile(contract: MarcaContract, images: MarcaImage[]): MarcaVisualProfile {
  const byId = new Map(images.map((img) => [img.id, img]));
  const sections: MarcaSection[] = ['palette', 'logo', 'packaging'];
  const bySection: MarcaVisualProfile['bySection'] = {};
  const toneTotals = new Map<string, number>();
  const imagePickCount = new Map<string, number>();

  for (const section of sections) {
    const counts = new Map<string, number>();
    for (const p of contract.participants) {
      if (section === 'palette' && p.paletteTones?.length) {
        for (const tone of p.paletteTones) {
          const t = tone.toString();
          counts.set(t, (counts.get(t) || 0) + 1);
          toneTotals.set(t, (toneTotals.get(t) || 0) + 1);
        }
        continue;
      }
      const pickId = p.sectionPicks?.[section];
      if (!pickId) continue;
      imagePickCount.set(pickId, (imagePickCount.get(pickId) || 0) + 1);
      const img = byId.get(pickId);
      const tone = (img?.tone || img?.tags?.[0] || 'otro').toString();
      counts.set(tone, (counts.get(tone) || 0) + 1);
      toneTotals.set(tone, (toneTotals.get(tone) || 0) + 1);
    }
    bySection[section] = [...counts.entries()]
      .map(([tone, count]) => ({ tone, count }))
      .sort((a, b) => b.count - a.count);
  }

  for (const p of contract.participants) {
    for (const id of p.styleImageIds || []) {
      imagePickCount.set(id, (imagePickCount.get(id) || 0) + 1);
      const img = byId.get(id);
      const tone = (img?.tone || img?.tags?.[0] || '').toString();
      if (tone) toneTotals.set(tone, (toneTotals.get(tone) || 0) + 1);
    }
  }

  const rankedTones = [...toneTotals.entries()].sort((a, b) => b[1] - a[1]);
  const strong = rankedTones.filter(([, c]) => c >= Math.max(2, Math.ceil(contract.participants.length * 0.5))).map(([t]) => t);
  const moderate = rankedTones
    .filter(([t, c]) => !strong.includes(t) && c >= 1)
    .map(([t]) => t)
    .slice(0, 4);
  const low: string[] = [];
  const rejections: string[] = [];

  const wordCounts = new Map<string, number>();
  for (const p of contract.participants) {
    for (const w of p.words?.selected || []) {
      const key = w.trim();
      if (!key) continue;
      wordCounts.set(key, (wordCounts.get(key) || 0) + 1);
    }
  }

  const words: MarcaWords = {
    selected: mergeUnique(contract.participants.map((p) => p.words?.selected || [])),
    people: mergeUnique(contract.participants.map((p) => p.words?.people || [])),
    places: mergeUnique(contract.participants.map((p) => p.words?.places || [])),
    product: mergeUnique(contract.participants.map((p) => p.words?.product || [])),
  };
  if (!words.selected.length && !words.people.length) Object.assign(words, emptyWords());

  const topImageIds = [...imagePickCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([id]) => id);

  return {
    contractId: contract.id,
    participantCount: contract.participants.length,
    completedCount: contract.participants.filter(
      (p) =>
        p.completedAt ||
        Object.keys(p.sectionPicks || {}).length > 0 ||
        (p.paletteTones && p.paletteTones.length > 0) ||
        (p.styleImageIds && p.styleImageIds.length > 0)
    ).length,
    bySection,
    strong,
    moderate,
    low,
    rejections,
    tagScores: rankedTones.map(([tag, score]) => ({ tag, score, yes: score, no: 0, neutral: 0 })),
    words,
    wordFrequency: [...wordCounts.entries()]
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count),
    specialMeanings: contract.participants
      .filter((p) => p.specialMeaning?.trim())
      .map((p) => ({ name: p.name, text: p.specialMeaning.trim() })),
    freeTexts: contract.participants
      .filter((p) => p.freeText?.trim())
      .map((p) => ({ name: p.name, text: p.freeText.trim() })),
    customerNotes: contract.participants
      .filter((p) => p.customer && Object.keys(p.customer).length > 0)
      .map((p) => ({ name: p.name, customer: p.customer })),
    topImageIds,
  };
}

export function buildOnePageCopy(input: {
  clientName: string;
  strong: string[];
  words: string[];
  freeTexts: string[];
}): { headline: string; promise: string; personality: string; voice: string } {
  const tone = input.strong[0] || 'natural';
  const words = input.words.slice(0, 6).join(', ') || 'origen, cuidado, territorio';
  const free = input.freeTexts[0] || '';
  return {
    headline: `${input.clientName}: marca con alma ${tone}`,
    promise: free
      ? free.slice(0, 180)
      : `Una marca que se siente ${tone}, cercana al territorio y clara para quien compra.`,
    personality: `Palabras que la representan: ${words}.`,
    voice: `Hablar simple, con orgullo del origen y sin complicar. El tono visual dominante es ${tone}.`,
  };
}
