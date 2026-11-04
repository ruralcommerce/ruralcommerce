import type { MnsFichaDef } from './types';

/** Contenido pedagógico del Mapa de Negocio (4 fichas · edición 2×2 h). */
export const MNS_COURSE = {
  name: 'Modelos de Negocios Sostenibles Internacionales',
  shortName: 'MNS Internacional',
  edition: 'Edición taller · 2 h × 2 días',
  market: 'Mercado de referencia: Estados Unidos · enfoque B2B',
  mapNote:
    'Cuatro dinámicas, mismo producto y misma oportunidad. En cada una: se explica, se ve un ejemplo y se hace una cosa concreta. El detalle vive en el (!).',
};

/**
 * Flujo corto (~16 pantallas de trabajo + 4 portadas).
 * Ritmo por dinámica: portada (explicar) → 3 actos (hacer).
 * Pre/post (4+4) quedan fuera de este conteo.
 */
export const MNS_FICHAS: MnsFichaDef[] = [
  {
    id: 'ficha1',
    number: 1,
    title: 'Mi propuesta internacional',
    subtitle: 'Dinámica 1 · Una propuesta que otro entienda',
    day: 1,
    durationMin: 45,
    consigna: 'Elegí un producto y un tipo de comprador B2B. Después armá una presentación breve que otro pueda entender.',
    proposito:
      'Formular una propuesta clara: qué ofrezco, a quién, con qué evidencia (o pendiente). No hace falta demostrar que ya exportás.',
    tipRevision:
      'Ejemplo Rosa: mermelada de mora en frasco, Costa Rica → distribuidora specialty en EE. UU. Evidencia y volumen aún pendientes. En pareja: 2 min de explicación; el otro dice qué entendió.',
    steps: [
      {
        id: 'f1-hacer',
        title: 'Propuesta',
        intro: 'Tres actos: producto, comprador, presentación.',
        fields: [
          {
            id: 'producto',
            label: '¿Qué producto vas a trabajar en el mapa?',
            kind: 'tagged-text',
            required: true,
            placeholder: 'Ej.: mermelada de mora en frasco de 250 g, Costa Rica',
            help: {
              paraQue: 'Las cuatro fichas hablan del mismo producto. Sin anclarlo, el mapa se diluye.',
              como: 'Nombre + presentación (envase/formato) + país de origen. Marcá confirmado, hipótesis o pendiente.',
              ejemplo:
                'Rosa: mermeladas de mora en frasco de vidrio, elaboradas en Costa Rica. Capacidad exportable adicional: pendiente.',
            },
          },
          {
            id: 'comprador',
            label: '¿A qué tipo de comprador B2B se lo propondrías?',
            kind: 'chips',
            required: true,
            options: [
              { value: 'distribuidora', label: 'Distribuidora' },
              { value: 'importadora', label: 'Importadora' },
              { value: 'foodservice', label: 'Foodservice' },
              { value: 'retail', label: 'Retail / tienda' },
              { value: 'otro_b2b', label: 'Otro B2B' },
            ],
            help: {
              paraQue: 'Una propuesta B2B apunta a una empresa, no a un consumidor genérico.',
              como: 'Elegí el tipo. El detalle del uso y el pedido (si existe) lo podés mencionar en la presentación.',
              ejemplo: 'Distribuidora specialty en EE. UU. para reventa a tiendas. Todavía no hay pedido confirmado.',
            },
          },
          {
            id: 'presentacion',
            label: 'Armá tu presentación breve',
            kind: 'presentation',
            required: true,
            help: {
              paraQue: 'Practicar decir la propuesta en pocos minutos, con evidencia o pendientes honestos.',
              como: 'Completá: Somos… Ofrecemos… para… Nos diferenciamos por… Evidencia… Necesitamos confirmar…',
              ejemplo:
                'Somos un obrador en Costa Rica. Ofrecemos mermelada de mora en frasco para una distribuidora en EE. UU. Nos diferenciamos por origen y proceso. Evidencia: ficha técnica pendiente. Necesitamos confirmar volumen y plazo.',
              alerta: 'No conviertas una intención en resultado. Lo que no podés demostrar, queda pendiente.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'ficha2',
    number: 2,
    title: 'Un requisito de mi mercado',
    subtitle: 'Dinámica 2 · ¿Aplica? ¿Se cumple?',
    day: 1,
    durationMin: 45,
    consigna:
      'Elegí UN requisito. Clasificalo. Decidí si aplica a tu caso y si podés marcar cumplimiento (con evidencia) o pendiente.',
    proposito:
      'Separar: (1) qué se pide, (2) si aplica a mi producto/operación, (3) si hay evidencia de cumplimiento. Norma encontrada ≠ “cumple”.',
    tipRevision:
      'Ejemplos: Prior Notice (legal FDA) · ficha técnica pedida por el comprador (comercial) · sello voluntario (diferencial). NOP orgánico no aplica si vendés convencional sin declaración orgánica.',
    steps: [
      {
        id: 'f2-hacer',
        title: 'Verificación',
        intro: 'Un requisito basta. Los pendientes son válidos.',
        fields: [
          {
            id: 'requisitoTipo',
            label: '¿Qué requisito vas a verificar?',
            kind: 'textarea',
            rows: 3,
            required: true,
            help: {
              paraQue: 'Trabajar un caso concreto evita “cumplir todo” en abstracto.',
              como: 'Nombre del requisito + fuente (documento o comunicación) + fecha de consulta. Mismo producto de la Ficha 1.',
              ejemplo: 'Prior Notice (FDA) · Guidance Prior Notice · consulta 27/10/2026.',
            },
          },
          {
            id: 'requisitoClase',
            label: '¿Qué tipo de requisito es?',
            kind: 'chips',
            required: true,
            options: [
              { value: 'legal', label: 'Legal' },
              { value: 'comercial', label: 'Comercial (pide el comprador)' },
              { value: 'diferencial', label: 'Diferencial / voluntario' },
            ],
            help: {
              paraQue: 'No todo lo que pide un comprador es obligación legal para todos.',
              como: 'Elegí una clase. Si dudás, mirá el (!) con ejemplos.',
              ejemplo: 'Prior Notice = legal · Ficha técnica pedida por distribuidora = comercial · Sello voluntario = diferencial.',
            },
          },
          {
            id: 'cumple',
            label: '¿Aplica a tu caso y podés marcar “cumple”?',
            kind: 'choice',
            required: true,
            options: [
              {
                value: 'pendiente',
                label: 'Aplica (o puede aplicar), pero aún no hay evidencia → pendiente',
              },
              {
                value: 'cumple',
                label: 'Aplica y tengo evidencia + sé cuándo ejecutarlo → cumple',
              },
              {
                value: 'no_aplica',
                label: 'No aplica a este producto / operación (con motivo claro)',
              },
              {
                value: 'no_cumple',
                label: 'Aplica y hoy no se cumple',
              },
            ],
            help: {
              paraQue: 'El aprendizaje clave: encontrar la norma no autoriza marcar “cumple”.',
              como: 'Elegí el estado. Si es pendiente o no aplica, anotá el motivo mentalmente para la revisión en pareja.',
              ejemplo:
                'Prior Notice en etapa de propuesta: pendiente (aún no hay envío). NOP en café convencional: no aplica. Ficha técnica pedida y no hecha: no cumple / pendiente de elaborar.',
              alerta: 'No confundas “falta información” con “no aplica”.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'ficha3',
    number: 3,
    title: 'Mi estructura de precio',
    subtitle: 'Dinámica 3 · El precio se recalcula',
    day: 2,
    durationMin: 45,
    consigna:
      'Definí la condición de entrega. Recorré el cálculo de práctica (Rosa). Anotá qué te falta cotizar en tu negocio real.',
    proposito:
      'Ver que exportar suma costos: el precio local no se copia. Hay que recalcular para cubrir costos y dejar margen. Lo desconocido no se anota como cero.',
    tipRevision:
      'Rosa (práctica): producir 300 frascos = 2.600; +600 de exportar = 3.200; precio local 10 → ingreso 3.000 → −200. Precio necesario con margen ≈ 12. Las u. m. no son dólares.',
    steps: [
      {
        id: 'f3-hacer',
        title: 'Precio',
        intro: 'Condición → cálculo → pendientes reales.',
        fields: [
          {
            id: 'condicionEntrega',
            label: '¿Bajo qué condición de entrega cotizarías?',
            kind: 'incoterm',
            required: true,
            help: {
              paraQue: 'FCA, DAP u otra condición cambia quién asume costos y riesgos — y por tanto el precio.',
              como: 'Elegí Incoterm o “otra”, indicá lugar y si está acordado o es propuesta.',
              ejemplo: 'Escenario propuesto FCA o DAP (acordar con el comprador). Mismo producto de las fichas anteriores.',
            },
          },
          {
            id: 'operacionResultado',
            label: 'Recorré el cálculo: ¿qué pasa si no ajustás el precio?',
            kind: 'rosa-calc',
            required: true,
            help: {
              paraQue: 'Ver el mecanismo: costos nuevos → precio nuevo. No memorizar la cuenta a ciegas.',
              como: 'Tocá cada paso. Después usá el siguiente acto para tus pendientes reales.',
              ejemplo:
                '2.600 + 600 = 3.200. Para conservar margen 400 → ingreso 3.600 → 12 por frasco. Si mantenés 10: 3.000 − 3.200 = −200.',
              alerta: 'Las 12 u. m. del caso no son 12 USD.',
            },
          },
          {
            id: 'faltaCotizar',
            label: 'En tu negocio: ¿qué costo o dato te falta para cotizar de verdad?',
            kind: 'textarea',
            rows: 3,
            required: true,
            help: {
              paraQue: 'El ejercicio Rosa enseña el criterio; tu negocio necesita datos reales pendientes.',
              como: 'Lista lo que falta (flete, embalaje, cumplimiento, tasa, comisión…). No inventes ceros.',
              ejemplo: 'Pendiente: embalaje exportable, flete según Incoterm, y si hay conversión a USD (tasa + fuente + fecha).',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'ficha4',
    number: 4,
    title: 'Mi recorrido y siguiente paso',
    subtitle: 'Dinámica 4 · Seguir el producto',
    day: 2,
    durationMin: 45,
    consigna:
      'Armá la cadena de registros del caso. Pensá la ruta inversa si el comprador reporta un problema. Cerrá con una acción prioritaria.',
    proposito:
      'Relacionar documentos hacia adelante y hacia atrás. Una ficha completa no sustituye la validación técnica de una operación real.',
    tipRevision:
      'Cadena ejemplo: P-01/F-02 → RF-01 → L-05 → QC-05 → EX-03 → C-01. Incidencia: C-01 → EX-03 → L-05 → atrás. No atribuir causa sin registros.',
    steps: [
      {
        id: 'f4-hacer',
        title: 'Recorrido y cierre',
        intro: 'Cadena → prueba inversa → acción.',
        fields: [
          {
            id: 'recorridoTexto',
            label: 'Armá el recorrido de registros',
            kind: 'trace-builder',
            required: true,
            help: {
              paraQue: 'Ver la cadena con vínculos documentados, no solo “etapas” sueltas.',
              como: 'Tocá y ordená los registros del caso de práctica. Si en tu negocio hay otros códigos, anotalos después en la acción.',
              ejemplo: 'Hacia adelante: P-01/F-02 → RF-01 → L-05 → QC-05 → EX-03 → C-01.',
            },
          },
          {
            id: 'pruebaComprador',
            label: 'El comprador reporta un problema en un lote. ¿Qué consultas?',
            kind: 'textarea',
            rows: 3,
            required: true,
            help: {
              paraQue: 'Practicar la ruta inversa: no adivinar la culpa.',
              como: 'Escribí la secuencia de documentos que seguirías y qué más revisarías (otros lotes / otras expediciones).',
              ejemplo:
                'C-01 → EX-03 → L-05 → RF-01 → P-01/F-02 y QC-05. Revisar si RF-01 aparece en otros lotes y si L-05 salió en otras expediciones.',
              alerta: 'No atribuir causas ni inventar destinos sin consultar registros.',
            },
          },
          {
            id: 'accionMotivo',
            label: '¿Cuál es tu próxima acción prioritaria (y por qué)?',
            kind: 'textarea',
            rows: 3,
            required: true,
            help: {
              paraQue: 'Salir del taller con un paso realista del mapa, no con la ficha “llena”.',
              como: 'Una acción + motivo + responsable (vos u otro rol). Podés sumar plazo tentativo.',
              ejemplo:
                'Elaborar ficha técnica y verificar Prior Notice con asesor — porque quedaron pendientes en las fichas 1 y 2. Responsable: titular. Plazo: antes del próximo encuentro.',
            },
          },
        ],
      },
    ],
  },
];

export function getFicha(id: string): MnsFichaDef | undefined {
  return MNS_FICHAS.find((f) => f.id === id);
}

export function fichaOrder(): MnsFichaDef[] {
  return MNS_FICHAS;
}
