import type { MarcaContract, MarcaImage } from './types';
import { buildFinalWorkshopMoodboard, type FinalWorkshopMoodboard } from './moodboard';
import { computeVisualProfile } from './profile';

export type MarcaAiSynthesis = {
  headline: string;
  promise: string;
  personality: string;
  voice: string;
  synthesis: string;
  visualDirection: string;
  paletteHex: string[];
  toneStory: string;
};

function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash';
  return { apiKey, model };
}

function extractJson(text: string): MarcaAiSynthesis {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Gemini no devolvió JSON');
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<MarcaAiSynthesis>;
  return {
    headline: String(parsed.headline || '').trim(),
    promise: String(parsed.promise || '').trim(),
    personality: String(parsed.personality || '').trim(),
    voice: String(parsed.voice || '').trim(),
    synthesis: String(parsed.synthesis || '').trim(),
    visualDirection: String(parsed.visualDirection || '').trim(),
    paletteHex: Array.isArray(parsed.paletteHex)
      ? parsed.paletteHex.map((c) => String(c).trim()).filter((c) => /^#?[0-9A-Fa-f]{6}$/.test(c)).map((c) => (c.startsWith('#') ? c.toUpperCase() : `#${c.toUpperCase()}`))
      : [],
    toneStory: String(parsed.toneStory || '').trim(),
  };
}

function buildWorkshopBrief(contract: MarcaContract, images: MarcaImage[]) {
  const profile = computeVisualProfile(contract, images);
  const byId = new Map(images.map((img) => [img.id, img]));
  const participants = contract.participants.map((p) => ({
    name: p.name,
    picks: Object.fromEntries(
      Object.entries(p.sectionPicks || {}).map(([section, id]) => {
        const img = id ? byId.get(id) : undefined;
        return [section, img ? { tone: img.tone, alt: img.alt, id: img.id } : null];
      })
    ),
    words: p.words?.selected || [],
    freeText: p.freeText || '',
  }));

  return {
    clientName: contract.clientName,
    title: contract.title,
    locale: contract.locale,
    bySection: profile.bySection,
    strong: profile.strong,
    moderate: profile.moderate,
    wordFrequency: profile.wordFrequency.slice(0, 20),
    freeTexts: profile.freeTexts,
    participants,
  };
}

async function callGemini(prompt: string): Promise<string> {
  const { apiKey, model } = getGeminiConfig();
  if (!apiKey) throw new Error('Falta GEMINI_API_KEY en el servidor');

  const modelsToTry = [model, 'gemini-3.8-flash', 'gemini-3.1-flash-lite'].filter(
    (m, i, arr) => arr.indexOf(m) === i
  );

  let lastError = 'Gemini sin respuesta';
  for (const m of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.55,
          responseMimeType: 'application/json',
        },
      }),
    });
    const raw = await res.text();
    if (!res.ok) {
      lastError = `Gemini ${m}: HTTP ${res.status} ${raw.slice(0, 220)}`;
      continue;
    }
    const data = JSON.parse(raw) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('\n') || '';
    if (text.trim()) return text;
    lastError = `Gemini ${m}: respuesta vacía`;
  }
  throw new Error(lastError);
}

export async function synthesizeWorkshopWithGemini(
  contract: MarcaContract,
  images: MarcaImage[]
): Promise<{ board: FinalWorkshopMoodboard; ai: MarcaAiSynthesis }> {
  const brief = buildWorkshopBrief(contract, images);
  const language =
    contract.locale === 'pt-BR' ? 'português do Brasil' : contract.locale === 'en' ? 'English' : 'español';

  const prompt = `Eres un director de marca para Rural Commerce (talleres con productores rurales / MiPyMEs).
A partir del JSON del taller, sistematiza una dirección de marca clara y útil para el equipo creativo.

Responde SOLO un JSON con estas claves:
- headline: titular corto de marca (máx 12 palabras)
- promise: promesa de marca (1-2 frases)
- personality: personalidad visual/verbal (1-2 frases)
- voice: cómo debe hablar la marca (1-2 frases)
- synthesis: síntesis de las historias libres del grupo (2-4 frases, sin inventar hechos que no estén)
- visualDirection: cómo combinar las elecciones (paleta/logo/packaging) aunque haya tonos distintos (ej. vibrante + sobrio)
- paletteHex: array de 5 o 6 colores hex (#RRGGBB) coherentes con las imágenes/tonos elegidos (NO uses solo grises si hay vibrante/pastel/terroso)
- toneStory: una frase sobre el equilibrio de tonos votados

Reglas:
- Idioma de los textos: ${language}
- No ignores minorías: si hay 2 tonos fuertes, intégralos en la narrativa y en la paleta
- Sé concreto, cálido, rural-profesional; evita clichés vacíos
- No inventes productos ni datos que no aparezcan en el input

INPUT DEL TALLER:
${JSON.stringify(brief)}`;

  const text = await callGemini(prompt);
  const ai = extractJson(text);
  const board = buildFinalWorkshopMoodboard(contract, images);

  if (ai.paletteHex.length >= 4) {
    board.paletteColors = ai.paletteHex.slice(0, 6);
  }
  if (ai.headline) board.onePage.headline = ai.headline;
  if (ai.promise) board.onePage.promise = ai.promise;
  if (ai.personality) board.onePage.personality = ai.personality;
  if (ai.voice) board.onePage.voice = ai.voice;
  if (ai.synthesis) board.synthesis = ai.synthesis;
  if (ai.toneStory) board.dominantTone = ai.toneStory;
  if (ai.visualDirection) board.visualDirection = ai.visualDirection;
  board.generatedByAi = true;

  return { board, ai };
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}
