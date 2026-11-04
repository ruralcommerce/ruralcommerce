export type MnsCheckMoment = 'pre' | 'post';

export type MnsCheckQuestion = {
  id: string;
  /** Pregunta corta en pantalla */
  prompt: string;
  /** Título del tip (!) */
  tipTitle: string;
  /** Contexto / números / por qué importa — solo dentro del tip */
  tip: string;
  options: { value: string; label: string }[];
  correct: string;
  /** Criterio que se mide (para revisión / facilitador) */
  explain: string;
};

/**
 * Cuatro juicios del mapa. Misma batería en pre y post.
 * Cada ítem enseña UN criterio; los números viven en el tip, no en la pregunta.
 */
export const MNS_CHECK_QUESTIONS: MnsCheckQuestion[] = [
  {
    id: 'norma_cumple',
    prompt: '¿Encontrar una norma aplicable alcanza para marcar “cumple”?',
    tipTitle: 'Qué estás decidiendo',
    tip:
      'Revisás un requisito de tu producto para un mercado (p. ej. Estados Unidos).\n\n' +
      '“Cumple” no significa “la norma existe”. Significa que tenés evidencia y sabés cuándo ejecutar la obligación.\n\n' +
      'Aprendizaje: norma encontrada ≠ cumplimiento demostrado.',
    options: [
      { value: 'si_norma', label: 'Sí: si la norma existe y aplica, ya puedo marcar “cumple”.' },
      {
        value: 'no_evidencia',
        label: 'No: primero evidencia y cuándo debo cumplir la obligación.',
      },
      { value: 'si_comprador', label: 'Sí: si el comprador lo menciona, alcanza.' },
    ],
    correct: 'no_evidencia',
    explain:
      'Encontrar una norma aplicable no autoriza “cumple”. Hay que verificar evidencia y el momento de ejecución.',
  },
  {
    id: 'cert_universal',
    prompt: 'Si un comprador pide una certificación, ¿es obligatoria para todos?',
    tipTitle: 'Qué estás decidiendo',
    tip:
      'Una distribuidora pide un certificado para seguir la conversación comercial.\n\n' +
      'Eso puede ser: (1) condición comercial de ese comprador, (2) exigencia legal de alcance general, o ambas.\n\n' +
      'Aprendizaje: pedido del comprador ≠ obligación universal automática.',
    options: [
      { value: 'si_universal', label: 'Sí: si un comprador lo pide, es obligatorio para todos.' },
      {
        value: 'no_distinguir',
        label: 'No: hay que distinguir condición comercial y exigencia legal.',
      },
      { value: 'solo_alimentos', label: 'Solo si el producto es alimentario.' },
    ],
    correct: 'no_distinguir',
    explain:
      'Una solicitud del comprador es condición comercial hasta demostrar que también es exigencia legal de alcance general.',
  },
  {
    id: 'rosa_precio',
    prompt: 'Si sumás costos de exportación y mantenés el mismo precio local, ¿qué pasa?',
    tipTitle: 'Caso de práctica (Rosa)',
    tip:
      'Objetivo del ejercicio: ver por qué el precio final hay que ajustarlo para cubrir costos y dejar margen.\n\n' +
      'Números del ejemplo:\n' +
      '• Producir 300 frascos: 2.600\n' +
      '• Costos extra de exportar: +600 → costo total 3.200\n' +
      '• Precio local que quiere mantener: 10 → ingreso 3.000 (300×10)\n' +
      '• 3.000 − 3.200 = −200 → queda en pérdida\n\n' +
      'Para no perder y conservar margen, el precio por frasco tiene que subir (en el ejemplo, a 12). Las cifras son unidades de práctica, no dólares.',
    options: [
      { value: 'gana_400', label: 'Conservás el mismo margen que en el mercado local.' },
      {
        value: 'pierde_200',
        label: 'Podés quedar en pérdida: el precio local ya no cubre el costo nuevo.',
      },
      { value: 'igual', label: 'No cambia nada: los costos de exportar ya estaban incluidos.' },
    ],
    correct: 'pierde_200',
    explain:
      'Con costos nuevos de exportación, mantener el precio local puede no cubrir el total. Hay que recalcular el precio para pagar costos y dejar margen.',
  },
  {
    id: 'trazabilidad_l05',
    prompt: 'Hay un problema en un lote ya enviado. ¿Qué conviene hacer?',
    tipTitle: 'Caso de práctica (registros)',
    tip:
      'El comprador reporta un problema en un lote que ya recibió.\n\n' +
      'En el ejemplo hay códigos de documentos (comprador, expedición, lote, lote de materia prima, proveedor, control de calidad).\n\n' +
      'Aprendizaje: seguir la cadena de registros hacia atrás y hacia adelante. No inventar la causa ni cerrar solo con lo que diga el comprador.',
    options: [
      { value: 'solo_comprador', label: 'Preguntar solo al comprador qué falló y cerrar.' },
      {
        value: 'cadena_completa',
        label: 'Seguir la cadena de documentos y ver si el lote o el insumo salió en otras entregas.',
      },
      { value: 'culpar_p01', label: 'Culpar de inmediato al proveedor.' },
    ],
    correct: 'cadena_completa',
    explain:
      'La trazabilidad relaciona documentos hacia atrás y hacia adelante. No se atribuyen causas sin consultar los registros.',
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
