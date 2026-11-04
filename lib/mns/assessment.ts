export type MnsCheckMoment = 'pre' | 'post';

export type MnsCheckQuestion = {
  id: string;
  prompt: string;
  context?: string;
  options: { value: string; label: string }[];
  correct: string;
  explain: string;
};

/** Mismas 4 situaciones del cierre del curso — sirven para medir mejora. */
export const MNS_CHECK_QUESTIONS: MnsCheckQuestion[] = [
  {
    id: 'norma_cumple',
    prompt: 'Encontré una norma aplicable. ¿Puedo marcar “cumple”?',
    context: 'Estás revisando un requisito para tu producto hacia Estados Unidos.',
    options: [
      { value: 'si_norma', label: 'Sí: si la norma existe y aplica, ya puedo marcar “cumple”.' },
      {
        value: 'no_evidencia',
        label: 'No: primero debo comprobar evidencia y cuándo corresponde ejecutar la obligación.',
      },
      { value: 'si_comprador', label: 'Sí: si el comprador lo menciona, alcanza con marcarlo.' },
    ],
    correct: 'no_evidencia',
    explain:
      'Encontrar una norma aplicable no autoriza “cumple”. Hay que verificar evidencia y el momento de ejecución.',
  },
  {
    id: 'cert_universal',
    prompt: 'El comprador solicita una certificación. ¿Se vuelve una obligación universal?',
    context: 'Una distribuidora pide un certificado como condición para seguir la conversación comercial.',
    options: [
      { value: 'si_universal', label: 'Sí: si un comprador lo pide, es obligatorio para todos.' },
      {
        value: 'no_distinguir',
        label: 'No: hay que distinguir condición comercial, alcance y exigencia legal.',
      },
      { value: 'solo_alimentos', label: 'Solo si el producto es alimentario.' },
    ],
    correct: 'no_distinguir',
    explain:
      'Una solicitud del comprador es condición comercial hasta demostrar que también es exigencia legal de alcance general.',
  },
  {
    id: 'rosa_precio',
    prompt: 'Rosa agrega 600 u. m. de costos internacionales y mantiene 10 u. m. por frasco (300 frascos). ¿Qué ocurre?',
    context: 'Costo del escenario internacional: 3.200 u. m. Precio local que quiere mantener: 10.',
    options: [
      { value: 'gana_400', label: 'Conserva la diferencia de 400 u. m.' },
      { value: 'pierde_200', label: 'Queda en −200 u. m. (300×10 − 3.200).' },
      { value: 'igual', label: 'No cambia el resultado porque las 600 ya estaban incluidas.' },
    ],
    correct: 'pierde_200',
    explain:
      '300 × 10 − 3.200 = −200 u. m. Mantener 10 no conserva la diferencia deseada. Además, 12 u. m. del caso no son 12 USD.',
  },
  {
    id: 'trazabilidad_l05',
    prompt:
      'El comprador informa un problema en el lote L-05 recibido por EX-03. ¿Qué conviene hacer para rastrear el origen y otras entregas relacionadas?',
    context: 'Registros del caso: P-01/F-02, RF-01, L-05, QC-05, EX-03, C-01.',
    options: [
      { value: 'solo_comprador', label: 'Preguntar solo al comprador qué falló y cerrar el caso.' },
      {
        value: 'cadena_completa',
        label:
          'Seguir C-01 → EX-03 → L-05 → RF-01 → P-01/F-02 y QC-05; revisar si RF-01 aparece en otros lotes y si L-05 salió en otras expediciones.',
      },
      { value: 'culpar_p01', label: 'Atribuir de inmediato la causa al proveedor P-01.' },
    ],
    correct: 'cadena_completa',
    explain:
      'La ruta relaciona documentos hacia atrás y hacia adelante. No se atribuyen causas ni se inventan resultados sin consultar los registros.',
  },
];

export type MnsCheckAnswers = Record<string, string>;

export type MnsCheckResult = {
  answers: MnsCheckAnswers;
  score: number;
  max: number;
  completedAt: string;
};

export function scoreCheck(answers: MnsCheckAnswers): { score: number; max: number; byId: Record<string, boolean> } {
  const byId: Record<string, boolean> = {};
  let score = 0;
  for (const q of MNS_CHECK_QUESTIONS) {
    const ok = answers[q.id] === q.correct;
    byId[q.id] = ok;
    if (ok) score += 1;
  }
  return { score, max: MNS_CHECK_QUESTIONS.length, byId };
}

export function emptyCheckAnswers(): MnsCheckAnswers {
  return Object.fromEntries(MNS_CHECK_QUESTIONS.map((q) => [q.id, '']));
}

export function formatScore(score: number, max: number) {
  return `${score}/${max}`;
}

export function deltaLabel(pre?: number | null, post?: number | null) {
  if (pre == null || post == null) return '—';
  const d = post - pre;
  if (d > 0) return `+${d}`;
  if (d < 0) return `${d}`;
  return '0';
}
