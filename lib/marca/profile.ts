import type {
  MarcaContract,
  MarcaImage,
  MarcaTagScore,
  MarcaVisualProfile,
  MarcaVoteValue,
  MarcaWords,
} from './types';

const VOTE_WEIGHT: Record<MarcaVoteValue, number> = {
  yes: 1,
  neutral: 0.15,
  no: -1,
};

const STRONG_MIN = 0.45;
const MODERATE_MIN = 0.15;
const REJECTION_MAX = -0.35;

function emptyWords(): MarcaWords {
  return { people: [], places: [], product: [] };
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
  const tagMap = new Map<string, { score: number; yes: number; no: number; neutral: number; weight: number }>();

  for (const image of images) {
    for (const tag of image.tags) {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, { score: 0, yes: 0, no: 0, neutral: 0, weight: 0 });
      }
    }
  }

  let completedCount = 0;

  for (const participant of contract.participants) {
    const hasVotes = Object.keys(participant.votes).length > 0;
    if (participant.completedAt || hasVotes) completedCount += 1;

    for (const image of images) {
      const vote = participant.votes[image.id];
      if (!vote) continue;
      for (const tag of image.tags) {
        const row = tagMap.get(tag);
        if (!row) continue;
        row.score += VOTE_WEIGHT[vote];
        row.weight += 1;
        if (vote === 'yes') row.yes += 1;
        else if (vote === 'no') row.no += 1;
        else row.neutral += 1;
      }
    }
  }

  const tagScores: MarcaTagScore[] = [...tagMap.entries()]
    .map(([tag, row]) => ({
      tag,
      score: row.weight > 0 ? row.score / row.weight : 0,
      yes: row.yes,
      no: row.no,
      neutral: row.neutral,
    }))
    .sort((a, b) => b.score - a.score);

  const strong = tagScores.filter((t) => t.score >= STRONG_MIN).map((t) => t.tag);
  const moderate = tagScores
    .filter((t) => t.score >= MODERATE_MIN && t.score < STRONG_MIN)
    .map((t) => t.tag);
  const low = tagScores
    .filter((t) => t.score < MODERATE_MIN && t.score > REJECTION_MAX)
    .map((t) => t.tag);
  const rejections = tagScores.filter((t) => t.score <= REJECTION_MAX).map((t) => t.tag);

  const words: MarcaWords = {
    people: mergeUnique(contract.participants.map((p) => p.words?.people || [])),
    places: mergeUnique(contract.participants.map((p) => p.words?.places || [])),
    product: mergeUnique(contract.participants.map((p) => p.words?.product || [])),
  };

  if (!words.people.length && !words.places.length && !words.product.length) {
    Object.assign(words, emptyWords());
  }

  return {
    contractId: contract.id,
    participantCount: contract.participants.length,
    completedCount,
    strong,
    moderate,
    low,
    rejections,
    tagScores,
    words,
    specialMeanings: contract.participants
      .filter((p) => p.specialMeaning?.trim())
      .map((p) => ({ name: p.name, text: p.specialMeaning.trim() })),
    customerNotes: contract.participants
      .filter((p) => p.customer && Object.keys(p.customer).length > 0)
      .map((p) => ({ name: p.name, customer: p.customer })),
  };
}
