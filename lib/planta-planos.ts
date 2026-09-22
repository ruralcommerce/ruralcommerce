import type { ProjectLocaleKey } from '@/lib/project-locale';

type LocaleCopy<T> = Record<ProjectLocaleKey, T>;

export const PLANTA_W = 4.0;
export const PLANTA_D = 5.5;
export const PLANTA_AREA = 22;
/** Exterior wall thickness in the drawings, metres. */
export const PLANTA_WALL_M = 0.14;
export const PLANTA_WALL_H = 2.35;
export const PLANTA_DOOR_H = 2.05;
export const PLANTA_WIN_SILL = 0.9;
export const PLANTA_WIN_HEAD = 2.15;

/** Building openings. Origin = back-left, X → right, Y → front. */
export const plantaDoors = {
  /** People and packed product. Front wall, right. */
  front: { id: 'P1', x0: 3.15, x1: 3.95 },
  /** Raw material / acopio. Back wall, into recepción. */
  back: { id: 'P2', x0: 2.45, x1: 3.25 },
} as const;

export const plantaWindows = {
  /** Original front window, over the entry strip. */
  front: { id: 'V1', x0: 0.45, x1: 2.05 },
  /** Side window with insect mesh. Left wall, transformation strip. */
  side: { id: 'V2', y0: 2.4, y1: 3.55 },
} as const;

export type PlanoTab = 'original' | 'distribucion' | 'procesos' | 'iso' | 'iso3d' | 'materiales' | 'tecnica' | 'agua' | 'energia';
export type ZonaId = 'recepcion' | 'lavado' | 'preparacion' | 'transformacion' | 'envase' | 'almacen' | 'ingreso';

/** Interior coords in metres. Origin = back-left (acopio / parte trasera). X → right, Y → front. */
export type RectM = { x: number; y: number; w: number; h: number };

export const zonaRects: Record<ZonaId, RectM> = {
  lavado: { x: 0, y: 0, w: 2.05, h: 1.2 },
  recepcion: { x: 2.05, y: 0, w: 1.95, h: 1.2 },
  preparacion: { x: 0, y: 1.2, w: 4.0, h: 1.05 },
  transformacion: { x: 0, y: 2.25, w: 4.0, h: 1.35 },
  envase: { x: 0, y: 3.6, w: 2.35, h: 0.95 },
  almacen: { x: 2.35, y: 3.6, w: 1.65, h: 0.95 },
  ingreso: { x: 0, y: 4.55, w: 4.0, h: 0.95 },
};

export const zonaColors: Record<ZonaId, string> = {
  recepcion: '#c45c26',
  lavado: '#009179',
  preparacion: '#5c7a3a',
  transformacion: '#9f2d2d',
  envase: '#071f5e',
  almacen: '#3d6b99',
  ingreso: '#c4a35a',
};

export const zonaOrder: ZonaId[] = [
  'recepcion',
  'lavado',
  'preparacion',
  'transformacion',
  'envase',
  'almacen',
  'ingreso',
];

export const zonaShort: LocaleCopy<Record<ZonaId, string>> = {
  es: {
    recepcion: 'Recepción',
    lavado: 'Lavado',
    preparacion: 'Corte',
    transformacion: 'Transformación',
    envase: 'Envase',
    almacen: 'Almacén',
    ingreso: 'Salida',
  },
  'pt-BR': {
    recepcion: 'Recepção',
    lavado: 'Lavagem',
    preparacion: 'Corte',
    transformacion: 'Transformação',
    envase: 'Envase',
    almacen: 'Armazém',
    ingreso: 'Saída',
  },
  en: {
    recepcion: 'Receiving',
    lavado: 'Wash',
    preparacion: 'Cut',
    transformacion: 'Transform',
    envase: 'Packing',
    almacen: 'Store',
    ingreso: 'Exit',
  },
};

export function zonaArea(id: ZonaId) {
  const r = zonaRects[id];
  return Math.round(r.w * r.h * 100) / 100;
}

export type TomaSpec = {
  id: string;
  x: number;
  y: number;
  nema: string;
  volts: 120 | 240;
  amps: number;
  poles: 1 | 2;
  gfci: boolean;
  circuit: string;
  zone: ZonaId | 'exterior';
};

export const tomas: TomaSpec[] = [
  { id: 'T1', x: 0.35, y: 0.4, nema: '5-20R', volts: 120, amps: 20, poles: 1, gfci: true, circuit: 'C1', zone: 'lavado' },
  { id: 'T2', x: 2.0, y: 1.55, nema: '5-20R', volts: 120, amps: 20, poles: 1, gfci: true, circuit: 'C1', zone: 'preparacion' },
  { id: 'T3', x: 1.45, y: 2.95, nema: '6-20R', volts: 240, amps: 20, poles: 2, gfci: false, circuit: 'C2', zone: 'transformacion' },
  { id: 'T4', x: 0.7, y: 2.45, nema: '5-20R', volts: 120, amps: 20, poles: 1, gfci: false, circuit: 'C3', zone: 'transformacion' },
  { id: 'T5', x: 0.45, y: 4.05, nema: '5-15R', volts: 120, amps: 15, poles: 1, gfci: true, circuit: 'C4', zone: 'envase' },
  { id: 'T6', x: 1.85, y: 4.05, nema: '5-15R', volts: 120, amps: 15, poles: 1, gfci: true, circuit: 'C4', zone: 'envase' },
  { id: 'T7', x: 3.55, y: 5.05, nema: '5-15R', volts: 120, amps: 15, poles: 1, gfci: false, circuit: 'C5', zone: 'ingreso' },
  { id: 'T8', x: 0.35, y: -0.35, nema: '5-20R', volts: 120, amps: 20, poles: 1, gfci: true, circuit: 'C6', zone: 'exterior' },
];

export const luces = [
  { id: 'L1', x: 1.0, y: 0.6 },
  { id: 'L2', x: 3.0, y: 0.6 },
  { id: 'L3', x: 1.0, y: 2.85 },
  { id: 'L4', x: 3.0, y: 2.85 },
  { id: 'L5', x: 1.0, y: 4.05 },
  { id: 'L6', x: 3.0, y: 4.05 },
];

export const desagues = [
  { id: 'D1', x: 1.0, y: 0.7 },
  { id: 'D2', x: 2.9, y: 2.7 },
];

export const circuitos = [
  { id: 'C1', breaker: '1P 20 A + GFCI 30 mA', load: 'Pila T1 y mesa de corte T2', volts: '120 V' },
  { id: 'C2', breaker: '2P 20 A', load: 'Molino T3', volts: '240 V' },
  { id: 'C3', breaker: '1P 20 A', load: 'Deshidratadora T4 1,2 kW', volts: '120 V' },
  { id: 'C4', breaker: '1P 20 A + GFCI', load: 'Envasado T5–T6', volts: '120 V' },
  { id: 'C5', breaker: '1P 15 A', load: 'Iluminación L1–L6 + T7', volts: '120 V' },
  { id: 'C6', breaker: '1P 20 A GFCI intemperie', load: 'Pila exterior / bomba lluvia T8', volts: '120 V' },
  { id: 'C7', breaker: '2P 20 A', load: 'Inversor solar 3 kW', volts: '240 V' },
];

export type Equipo3D = {
  id: string;
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  zone: ZonaId | 'exterior' | 'techo';
};

export const equipos3d: Equipo3D[] = [
  { id: 'pila', x: 0.2, y: 0.12, w: 1.2, d: 0.5, h: 0.9, zone: 'lavado' },
  { id: 'canastas', x: 2.25, y: 0.15, w: 1.4, d: 0.6, h: 0.85, zone: 'recepcion' },
  { id: 'mesa-prep', x: 0.35, y: 1.32, w: 3.3, d: 0.7, h: 0.9, zone: 'preparacion' },
  { id: 'dehydrator', x: 0.2, y: 2.35, w: 1.05, d: 0.65, h: 1.45, zone: 'transformacion' },
  { id: 'molino', x: 1.4, y: 2.5, w: 0.6, d: 0.55, h: 1.15, zone: 'transformacion' },
  { id: 'fogon', x: 2.45, y: 2.45, w: 0.95, d: 0.7, h: 0.9, zone: 'transformacion' },
  { id: 'extractor', x: 3.5, y: 2.3, w: 0.35, d: 0.28, h: 0.3, zone: 'transformacion' },
  { id: 'mesa-env', x: 0.2, y: 3.72, w: 1.35, d: 0.6, h: 0.9, zone: 'envase' },
  { id: 'selladora', x: 1.65, y: 3.75, w: 0.55, d: 0.5, h: 1.0, zone: 'envase' },
  { id: 'estante', x: 2.55, y: 3.7, w: 1.2, d: 0.7, h: 1.6, zone: 'almacen' },
  { id: 'gabachas', x: 0.15, y: 4.65, w: 0.35, d: 0.7, h: 1.5, zone: 'ingreso' },
  { id: 'lavamanos', x: 2.7, y: 4.7, w: 0.5, d: 0.4, h: 0.95, zone: 'ingreso' },
  { id: 'tablero', x: 3.5, y: 4.7, w: 0.3, d: 0.4, h: 1.2, zone: 'ingreso' },
  { id: 'pila-ext', x: 0.9, y: -0.55, w: 0.7, d: 0.4, h: 0.85, zone: 'exterior' },
  { id: 'tanque', x: 4.25, y: 3.6, w: 0.9, d: 0.9, h: 1.3, zone: 'exterior' },
];

export const planoTabs: LocaleCopy<Record<PlanoTab, string>> = {
  es: {
    original: 'Original',
    distribucion: 'Distribución',
    procesos: 'Procesos',
    iso: 'Equipos',
    iso3d: '3D',
    materiales: 'Materiales',
    tecnica: 'Técnica',
    agua: 'Agua',
    energia: 'Energía',
  },
  'pt-BR': {
    original: 'Original',
    distribucion: 'Distribuição',
    procesos: 'Processos',
    iso: 'Equipamentos',
    iso3d: '3D',
    materiales: 'Materiais',
    tecnica: 'Técnica',
    agua: 'Água',
    energia: 'Energia',
  },
  en: {
    original: 'Original',
    distribucion: 'Layout',
    procesos: 'Process',
    iso: 'Equipment',
    iso3d: '3D',
    materiales: 'Materials',
    tecnica: 'Technical',
    agua: 'Water',
    energia: 'Energy',
  },
};

export const planoChrome: LocaleCopy<{
  kicker: string;
  title: string;
  lead: string;
  originalTitle: string;
  originalLead: string;
  originalHow: string[];
  distTitle: string;
  distLead: string;
  distHint: string;
  sepTitle: string;
  procTitle: string;
  procLead: string;
  tecTitle: string;
  tecLead: string;
  tecDisclaimer: string;
  isoTitle: string;
  isoLead: string;
  iso3dTitle: string;
  iso3dLead: string;
  matTitle: string;
  isoOutside: string;
  where: string;
  yes: string;
  no: string;
  area: string;
  size: string;
  sep: string;
  circuit: string;
  type: string;
  load: string;
  breaker: string;
  panel: string;
  panelSpec: string;
  luxNote: string;
  slope: string;
  back: string;
  front: string;
  acopio: string;
  window: string;
  windowSide: string;
  door: string;
  doorService: string;
  lamps: string;
  sink: string;
  gfci: string;
  volts: string;
  nema: string;
  amps: string;
  use: string;
  height: string;
  ledNote: string;
  screen: string;
  floorUp: string;
  origCaption: string;
}> = {
  es: {
    kicker: 'Planos 4,0 × 5,5 m · 22 m²',
    title: 'Mini-biorrefinería Copey de Dota',
    lead: '',
    originalTitle: 'Croquis de la cooperativa',
    originalLead: '',
    originalHow: [
      'P1 puerta de frente (personas y producto). P2 puerta de servicio al acopio. V1 ventana de frente. V2 ventana lateral con malla.',
      'Puerta de atrás: materia prima desde el acopio.',
      'Puerta de frente: personas y producto terminado.',
      'Pila de atrás: producto. Lavamanos de pedal al frente: manos.',
      'Deshidratadora, molino y fogón en la misma franja de transformación. Solar = techo.',
    ],
    distTitle: 'Zonificación',
    distLead: 'Recibir → lavar → pelar/cortar → transformar → envasar → almacenar → salir.',
    distHint: '',
    sepTitle: 'Separación de áreas',
    procTitle: 'Flujo de proceso',
    procLead: 'Nada sucio cruza la mesa de envasado.',
    tecTitle: 'Eléctrica e hidráulica',
    tecLead: '',
    tecDisclaimer: '',
    isoTitle: 'Equipos en planta',
    isoLead: '',
    iso3dTitle: 'Vista 3D',
    iso3dLead: '',
    matTitle: 'Materiales y divisiones',
    isoOutside: 'Patio',
    where: 'Dónde',
    yes: 'Sí',
    no: 'No',
    area: 'Área',
    size: 'Medida',
    sep: 'Separación',
    circuit: 'Circuito',
    type: 'Toma',
    load: 'Carga',
    breaker: 'Breaker',
    panel: 'Tablero TAB',
    panelSpec: '12 espacios · principal 60 A · 120/240 V · inversor 3 kW',
    luxNote: 'LED IP65 18 W 4000 K con cubierta. 220 lux en elaboración, 540 lux en inspección/envasado.',
    slope: 'Pendiente 1,5–2 % hacia D1 y D2. No encharcar la zona de envase.',
    back: 'Parte trasera',
    front: 'Frente',
    acopio: 'Centro de acopio',
    window: 'Ventana',
    windowSide: 'Ventana lateral',
    door: 'Puerta',
    doorService: 'Puerta servicio',
    lamps: '2 lámparas (el código pide 6)',
    sink: 'Lavatorio existente',
    gfci: 'GFCI 30 mA',
    volts: 'V',
    nema: 'NEMA',
    amps: 'A',
    use: 'Uso',
    height: 'Altura toma',
    ledNote: 'LED IP65 · no 2, sino 6',
    screen: 'Pantalla 1,20 m',
    floorUp: 'Piso +1 cm',
    origCaption: 'Croquis original entregado por la cooperativa.',
  },
  'pt-BR': {
    kicker: 'Plantas 4,0 × 5,5 m · 22 m²',
    title: 'Mini-biorrefinaria Copey de Dota',
    lead: '',
    originalTitle: 'Croqui da cooperativa',
    originalLead: '',
    originalHow: [
      'P1 porta da frente (pessoas e produto). P2 porta de serviço ao acopio. V1 janela da frente. V2 janela lateral com tela.',
      'Porta de trás: matéria-prima do acopio.',
      'Porta da frente: pessoas e produto acabado.',
      'Pia de trás: produto. Lavatório de pedal na frente: mãos.',
      'Desidratadora, moinho e fogão na mesma faixa de transformação. Solar = telhado.',
    ],
    distTitle: 'Zonificação',
    distLead: 'Receber → lavar → descascar/cortar → transformar → envasar → armazenar → sair.',
    distHint: '',
    sepTitle: 'Separação das áreas',
    procTitle: 'Fluxo de processo',
    procLead: 'Nada sujo cruza a mesa de envase.',
    tecTitle: 'Elétrica e hidráulica',
    tecLead: '',
    tecDisclaimer: '',
    isoTitle: 'Equipamentos em planta',
    isoLead: '',
    iso3dTitle: 'Vista 3D',
    iso3dLead: '',
    matTitle: 'Materiais e divisões',
    isoOutside: 'Pátio',
    where: 'Onde',
    yes: 'Sim',
    no: 'Não',
    area: 'Área',
    size: 'Medida',
    sep: 'Separação',
    circuit: 'Circuito',
    type: 'Tomada',
    load: 'Carga',
    breaker: 'Disjuntor',
    panel: 'Quadro TAB',
    panelSpec: '12 espaços · principal 60 A · 120/240 V · inversor 3 kW',
    luxNote: 'LED IP65 18 W 4000 K com cobertura. 220 lux na elaboração, 540 lux na inspeção/envase.',
    slope: 'Caimento 1,5–2 % rumo a D1 e D2. Não empoçar a zona de envase.',
    back: 'Parte de trás',
    front: 'Frente',
    acopio: 'Centro de acopio',
    window: 'Janela',
    windowSide: 'Janela lateral',
    door: 'Porta',
    doorService: 'Porta de serviço',
    lamps: '2 lâmpadas (o código pede 6)',
    sink: 'Pia existente',
    gfci: 'GFCI 30 mA',
    volts: 'V',
    nema: 'NEMA',
    amps: 'A',
    use: 'Uso',
    height: 'Altura da tomada',
    ledNote: 'LED IP65 · não 2, e sim 6',
    screen: 'Tela 1,20 m',
    floorUp: 'Piso +1 cm',
    origCaption: 'Croqui original entregue pela cooperativa.',
  },
  en: {
    kicker: 'Drawings 4.0 × 5.5 m · 22 m²',
    title: 'Copey de Dota mini-biorefinery',
    lead: '',
    originalTitle: 'Cooperative sketch',
    originalLead: '',
    originalHow: [
      'P1 front door (people and packed product). P2 service door to the collection center. V1 front window. V2 side window with mesh.',
      'Back door: raw material from the collection center.',
      'Front door: people and finished product.',
      'Back sink: product. Pedal handwash at the front: hands.',
      'Dehydrator, mill and stove in the same transformation strip. Solar = roof.',
    ],
    distTitle: 'Zoning',
    distLead: 'Receive → wash → peel/cut → transform → pack → store → exit.',
    distHint: '',
    sepTitle: 'Area separation',
    procTitle: 'Process flow',
    procLead: 'Nothing dirty crosses the packing table.',
    tecTitle: 'Electrical and plumbing',
    tecLead: '',
    tecDisclaimer: '',
    isoTitle: 'Equipment plan',
    isoLead: '',
    iso3dTitle: '3D view',
    iso3dLead: '',
    matTitle: 'Materials and partitions',
    isoOutside: 'Yard',
    where: 'Where',
    yes: 'Do',
    no: 'Don’t',
    area: 'Area',
    size: 'Size',
    sep: 'Separation',
    circuit: 'Circuit',
    type: 'Receptacle',
    load: 'Load',
    breaker: 'Breaker',
    panel: 'Panel TAB',
    panelSpec: '12 spaces · 60 A main · 120/240 V · 3 kW inverter',
    luxNote: 'IP65 18 W 4000 K LED with cover. 220 lux in processing, 540 lux at inspection/packing.',
    slope: '1.5–2% slope toward D1 and D2. Do not pond the packing zone.',
    back: 'Back',
    front: 'Front',
    acopio: 'Collection center',
    window: 'Window',
    windowSide: 'Side window',
    door: 'Door',
    doorService: 'Service door',
    lamps: '2 lamps (code requires 6)',
    sink: 'Existing sink',
    gfci: 'GFCI 30 mA',
    volts: 'V',
    nema: 'NEMA',
    amps: 'A',
    use: 'Use',
    height: 'Receptacle height',
    ledNote: 'IP65 LED · not 2, but 6',
    screen: '1.20 m screen',
    floorUp: 'Floor +1 cm',
    origCaption: 'Original sketch supplied by the cooperative.',
  },
};

export const zonaCopyFull: LocaleCopy<
  Record<
    ZonaId,
    { name: string; role: string; where: string; do: string; dont: string; sep: string }
  >
> = {
  es: {
    recepcion: {
      name: 'Recepción',
      role: 'Materia prima entra por la puerta de atrás, desde el acopio.',
      where: 'Esquina trasera derecha. 1,95 × 1,20 m (2,34 m²).',
      do: 'Canastas plásticas, mesa de acero, no tocar el piso.',
      dont: 'No mezclar producto terminado ni empaque limpio.',
      sep: 'Línea naranja en piso hacia el lavado.',
    },
    lavado: {
      name: 'Lavado',
      role: 'Lavar fruta, raíz, hoja o grano y utensilios.',
      where: 'Pared de atrás, pila existente. 2,05 × 1,20 m (2,46 m²).',
      do: 'Pila de acero, agua potable, desagüe D1.',
      dont: 'Esa pila no sustituye el lavamanos de personal.',
      sep: 'Piso continuo con recepción y corte.',
    },
    preparacion: {
      name: 'Pelar y cortar',
      role: 'Mesa de trabajo: pelar, picar, porcionar. Sale de aquí listo para transformar.',
      where: 'Franja completa detrás de las máquinas. 4,00 × 1,05 m (4,20 m²).',
      do: 'Mesa de acero, tablas, cuchillos. Toma T2. Producto ya lavado.',
      dont: 'No envasar aquí. No meter canastas sucias del acopio.',
      sep: 'Piso húmedo continuo. Cinta hacia recepción/lavado.',
    },
    transformacion: {
      name: 'Transformación',
      role: 'Acá se trabaja el producto: deshidratar, triturar o cocinar. Son técnicas, no etapas distintas.',
      where: 'Franja central. 4,00 × 1,35 m (5,40 m²). Gabinete, molino y fogón en la misma zona.',
      do: 'La receta elige la técnica. Extractor en el fogón. T4 deshidratadora, T3 molino.',
      dont: 'El vapor del fogón no sopla al envase.',
      sep: 'Pantalla 1,20 m hacia envase y almacén.',
    },
    envase: {
      name: 'Envasado',
      role: 'Zona limpia y seca. Lote, fecha, humedad.',
      where: 'Franja delantera izquierda. 2,35 × 0,95 m (2,23 m²).',
      do: 'Mesa, selladora, balanza.',
      dont: 'No abrir canastas sucias aquí.',
      sep: 'Piso 1 cm más alto. Pantalla hacia transformación.',
    },
    almacen: {
      name: 'Almacenamiento',
      role: 'Producto ya envasado, separado de la materia prima.',
      where: 'Franja delantera derecha. 1,65 × 0,95 m (1,57 m²).',
      do: 'Estante limpio, lote visible, lejos del acopio.',
      dont: 'No guardar canastas sucias ni químicos aquí.',
      sep: 'Misma cota que envase. Cinta de piso basta.',
    },
    ingreso: {
      name: 'Salida de producto / ingreso de personas',
      role: 'Puerta de frente: sale el producto; entra el personal por el lavamanos.',
      where: 'Franja de la puerta. 4,00 × 0,95 m (3,80 m²).',
      do: 'Lavamanos de pedal, gabachas, tapete. Producto termina sale por aquí.',
      dont: 'No entrar con botas del acopio llenas de lodo.',
      sep: 'El tapete y el lavamanos cortan el paso.',
    },
  },
  'pt-BR': {
    recepcion: {
      name: 'Recepção',
      role: 'Matéria-prima entra pela porta de trás, do acopio.',
      where: 'Canto traseiro direito. 1,95 × 1,20 m (2,34 m²).',
      do: 'Cestos plásticos, mesa de aço, nada no piso.',
      dont: 'Não misturar produto acabado nem embalagem limpa.',
      sep: 'Faixa laranja no piso rumo à lavagem.',
    },
    lavado: {
      name: 'Lavagem',
      role: 'Lavar fruta, raiz, folha ou grão e utensílios.',
      where: 'Parede de trás, pia existente. 2,05 × 1,20 m (2,46 m²).',
      do: 'Pia de aço, água potável, ralo D1.',
      dont: 'Essa pia não substitui o lavatório de pessoal.',
      sep: 'Piso contínuo com recepção e corte.',
    },
    preparacion: {
      name: 'Descascar e cortar',
      role: 'Mesa de trabalho: descascar, picar, porcionar. Sai daqui pronto para transformar.',
      where: 'Faixa inteira atrás das máquinas. 4,00 × 1,05 m (4,20 m²).',
      do: 'Mesa de aço, tábuas, facas. Tomada T2. Produto já lavado.',
      dont: 'Não envasar aqui. Não meter cestos sujos do acopio.',
      sep: 'Piso úmido contínuo.',
    },
    transformacion: {
      name: 'Transformação',
      role: 'Aqui se trabalha o produto: desidratar, triturar ou cozinhar. São técnicas, não etapas distintas.',
      where: 'Faixa central. 4,00 × 1,35 m (5,40 m²). Gabinete, moinho e fogão na mesma zona.',
      do: 'A receita escolhe a técnica. Exaustor no fogão. T4 desidratadora, T3 moinho.',
      dont: 'O vapor do fogão não sopra ao envase.',
      sep: 'Tela 1,20 m rumo ao envase e armazém.',
    },
    envase: {
      name: 'Envase',
      role: 'Zona limpa e seca. Lote, data, umidade.',
      where: 'Faixa da frente à esquerda. 2,35 × 0,95 m (2,23 m²).',
      do: 'Mesa, seladora, balança.',
      dont: 'Não abrir cestos sujos aqui.',
      sep: 'Piso 1 cm mais alto. Tela rumo à transformação.',
    },
    almacen: {
      name: 'Armazenamento',
      role: 'Produto já envasado, separado da matéria-prima.',
      where: 'Faixa da frente à direita. 1,65 × 0,95 m (1,57 m²).',
      do: 'Prateleira limpa, lote visível, longe do acopio.',
      dont: 'Não guardar cestos sujos nem químicos aqui.',
      sep: 'Mesma cota que o envase. Fita no piso basta.',
    },
    ingreso: {
      name: 'Saída de produto / ingresso de pessoas',
      role: 'Porta da frente: sai o produto; entra o pessoal pelo lavatório.',
      where: 'Faixa da porta. 4,00 × 0,95 m (3,80 m²).',
      do: 'Lavatório de pedal, aventais, tapete. O produto acabado sai por aqui.',
      dont: 'Não entrar com botas do acopio cheias de barro.',
      sep: 'O tapete e o lavatório cortam o passo.',
    },
  },
  en: {
    recepcion: {
      name: 'Receiving',
      role: 'Raw material enters by the back door from the collection center.',
      where: 'Back-right corner. 1.95 × 1.20 m (2.34 m²).',
      do: 'Plastic crates, steel table, nothing on the floor.',
      dont: 'Do not mix finished goods or clean packaging.',
      sep: 'Orange floor tape toward wash.',
    },
    lavado: {
      name: 'Wash',
      role: 'Wash fruit, root, leaf or grain and utensils.',
      where: 'Back wall, existing sink. 2.05 × 1.20 m (2.46 m²).',
      do: 'Steel sink, potable water, drain D1.',
      dont: 'That sink does not replace the staff handwash.',
      sep: 'Continuous floor with receiving and cutting.',
    },
    preparacion: {
      name: 'Peel and cut',
      role: 'Work table: peel, chop, portion. Leaves here ready to transform.',
      where: 'Full strip behind the machines. 4.00 × 1.05 m (4.20 m²).',
      do: 'Steel table, boards, knives. T2. Already washed.',
      dont: 'Do not pack here. No dirty crates from the collection center.',
      sep: 'Continuous wet floor.',
    },
    transformacion: {
      name: 'Transformation',
      role: 'The product is worked here: dry, mill or cook. Techniques, not separate stages.',
      where: 'Center strip. 4.00 × 1.35 m (5.40 m²). Cabinet, mill and stove in the same zone.',
      do: 'The recipe picks the technique. Extractor on the stove. T4 dehydrator, T3 mill.',
      dont: 'Stove steam must not blow toward packing.',
      sep: '1.20 m screen toward packing and storage.',
    },
    envase: {
      name: 'Packing',
      role: 'Clean, dry zone. Lot, date, moisture.',
      where: 'Front-left strip. 2.35 × 0.95 m (2.23 m²).',
      do: 'Table, sealer, scale.',
      dont: 'Do not open dirty crates here.',
      sep: 'Floor 1 cm higher. Screen toward transformation.',
    },
    almacen: {
      name: 'Storage',
      role: 'Packed product, apart from raw material.',
      where: 'Front-right strip. 1.65 × 0.95 m (1.57 m²).',
      do: 'Clean shelf, lot visible, away from the collection center.',
      dont: 'No dirty crates or chemicals here.',
      sep: 'Same level as packing. Floor tape is enough.',
    },
    ingreso: {
      name: 'Product exit / staff entry',
      role: 'Front door: finished goods leave; staff enter at the handwash.',
      where: 'Door strip. 4.00 × 0.95 m (3.80 m²).',
      do: 'Pedal handwash, aprons, mat. Packed product leaves here.',
      dont: 'Do not enter with muddy collection-center boots.',
      sep: 'Mat and handwash cut the path.',
    },
  },
};

export const procesoSteps: LocaleCopy<Array<{ n: string; title: string; text: string }>> = {
  es: [
    { n: '01', title: 'Recibir', text: 'Puerta de atrás, desde el acopio. Canastas, no piso.' },
    { n: '02', title: 'Lavar', text: 'Pila de atrás, agua potable, D1.' },
    { n: '03', title: 'Pelar y cortar', text: 'Mesa de trabajo. Picar, pelar, porcionar. Producto ya lavado.' },
    { n: '04', title: 'Transformar', text: 'Deshidratar, triturar o cocinar: la receta elige. Misma zona.' },
    { n: '05', title: 'Envasar', text: 'Zona limpia. Lote, fecha, humedad.' },
    { n: '06', title: 'Almacenar', text: 'Estante de producto terminado, separado de la materia prima.' },
    { n: '07', title: 'Salir', text: 'Producto por la puerta de frente.' },
  ],
  'pt-BR': [
    { n: '01', title: 'Receber', text: 'Porta de trás, do acopio. Cestos, não piso.' },
    { n: '02', title: 'Lavar', text: 'Pia de trás, água potável, D1.' },
    { n: '03', title: 'Descascar e cortar', text: 'Mesa de trabalho. Picar, descascar, porcionar. Produto já lavado.' },
    { n: '04', title: 'Transformar', text: 'Desidratar, triturar ou cozinhar: a receita escolhe. Mesma zona.' },
    { n: '05', title: 'Envasar', text: 'Zona limpa. Lote, data, umidade.' },
    { n: '06', title: 'Armazenar', text: 'Prateleira de produto acabado, separado da matéria-prima.' },
    { n: '07', title: 'Sair', text: 'Produto pela porta da frente.' },
  ],
  en: [
    { n: '01', title: 'Receive', text: 'Back door, from the collection center. Crates, not the floor.' },
    { n: '02', title: 'Wash', text: 'Back sink, potable water, D1.' },
    { n: '03', title: 'Peel and cut', text: 'Work table. Chop, peel, portion. Already washed.' },
    { n: '04', title: 'Transform', text: 'Dry, mill or cook: the recipe chooses. Same zone.' },
    { n: '05', title: 'Pack', text: 'Clean zone. Lot, date, moisture.' },
    { n: '06', title: 'Store', text: 'Finished-goods shelf, apart from raw material.' },
    { n: '07', title: 'Exit', text: 'Product out the front door.' },
  ],
};

export const equipoFicha: LocaleCopy<Record<string, { name: string; spec: string }>> = {
  es: {
    pila: { name: 'Pila de proceso', spec: 'Acero inoxidable, dos senos (lavar / enjuagar). Agua potable. Desagüe a D1.' },
    canastas: { name: 'Mesa de recepción', spec: 'Acero. Canastas plásticas. Materia prima nunca en el piso.' },
    'mesa-prep': { name: 'Mesa de corte', spec: 'Acero. Pelar, picar, porcionar. Producto ya lavado. Toma T2.' },
    molino: { name: 'Molino', spec: 'Acero de contacto. 1–1,5 HP. Toma T3 240 V 20 A. 50 cm a la pared.' },
    fogon: { name: 'Fogón industrial', spec: 'Cuatro quemadores, con extractor al exterior. No va en el envase. Grasa a la trampa.' },
    dehydrator: { name: 'Deshidratadora eléctrica', spec: 'Gabinete de bandejas adentro. 1,2 kW, T4 120 V. Corre de día con el techo solar. Higrómetro de lote.' },
    extractor: { name: 'Extractor de humedad', spec: 'Ducto al exterior con malla. El aire no sopla hacia el envase.' },
    'mesa-env': { name: 'Mesa de envasado', spec: 'Acero. 540 lux. Balanza e higrómetro de lote.' },
    selladora: { name: 'Selladora', spec: 'Toma T6 120 V. Envases nuevos, lote y fecha.' },
    estante: { name: 'Estante producto terminado', spec: 'Separado de la materia prima.' },
    gabachas: { name: 'Pared de gabachas', spec: 'Cofias, delantales y guantes en el ingreso. De la propuesta de la cooperativa: se queda.' },
    lavamanos: { name: 'Lavamanos de personal', spec: 'Pedal, rodilla o sensor. Jabón y papel. RTCA 5.4.3.' },
    tablero: { name: 'Tablero TAB', spec: '12 polos, 60 A, 120/240 V, inversor 3 kW (C7). Zona seca.' },
    'pila-ext': { name: 'Pila exterior', spec: 'Canastas y botas. Agua de lluvia, no de alimento. Desagüe a trampa de grasas. T8 GFCI.' },
    tanque: { name: 'Tanque de lluvia 1 000 L', spec: 'Canaleta, primeras aguas, tapa sanitaria. Red verde (piso y canastas), nunca cruzada con potable.' },
  },
  'pt-BR': {
    pila: { name: 'Pia de processo', spec: 'Aço inox, duas cubas. Água potável. Dreno para D1.' },
    canastas: { name: 'Mesa de recepção', spec: 'Aço. Cestos plásticos. Matéria-prima nunca no piso.' },
    'mesa-prep': { name: 'Mesa de corte', spec: 'Aço. Descascar, picar, porcionar. Produto já lavado. Tomada T2.' },
    molino: { name: 'Moinho', spec: 'Aço de contato. 1–1,5 HP. Tomada T3 240 V 20 A. 50 cm à parede.' },
    fogon: { name: 'Fogão industrial', spec: 'Quatro bocas, com exaustor ao exterior. Não vai no envase. Gordura à caixa.' },
    dehydrator: { name: 'Desidratadora elétrica', spec: 'Gabinete de bandejas dentro. 1,2 kW, T4 120 V. Funciona de dia com o telhado solar.' },
    extractor: { name: 'Exaustor de umidade', spec: 'Duto ao exterior com tela. O ar não sopra ao envase.' },
    'mesa-env': { name: 'Mesa de envase', spec: 'Aço. 540 lux. Balança e higrômetro de lote.' },
    selladora: { name: 'Seladora', spec: 'Tomada T6 120 V. Embalagens novas, lote e data.' },
    estante: { name: 'Prateleira de produto acabado', spec: 'Separado da matéria-prima.' },
    gabachas: { name: 'Parede de aventais', spec: 'Toucas, aventais e luvas no ingresso. Da proposta da cooperativa: fica.' },
    lavamanos: { name: 'Lavatório de pessoal', spec: 'Pedal, joelho ou sensor. Sabão e papel. RTCA 5.4.3.' },
    tablero: { name: 'Quadro TAB', spec: '12 polos, 60 A, 120/240 V, inversor 3 kW (C7).' },
    'pila-ext': { name: 'Pia exterior', spec: 'Cestos e botas. Água de chuva, não de alimento. T8 GFCI.' },
    tanque: { name: 'Tanque de chuva 1 000 L', spec: 'Calha, primeiras águas, tampa. Rede verde, nunca cruzada com potável.' },
  },
  en: {
    pila: { name: 'Process sink', spec: 'Stainless, two bowls. Potable water. Drain to D1.' },
    canastas: { name: 'Receiving table', spec: 'Steel. Plastic crates. Raw material never on the floor.' },
    'mesa-prep': { name: 'Cutting table', spec: 'Steel. Peel, chop, portion. Already washed. T2.' },
    molino: { name: 'Mill', spec: 'Food-contact steel. 1–1.5 HP. Dedicated T3 240 V 20 A. 50 cm to the wall.' },
    fogon: { name: 'Industrial stove', spec: 'Four burners, extractor outdoors. Not in packing. Fat to the grease trap.' },
    dehydrator: { name: 'Electric dehydrator', spec: 'Tray cabinet indoors. 1.2 kW, T4 120 V. Runs in daylight off the roof array.' },
    extractor: { name: 'Moisture extractor', spec: 'Duct outdoors with screen. Air must not blow toward packing.' },
    'mesa-env': { name: 'Packing table', spec: 'Steel. 540 lux. Scale and lot hygrometer.' },
    selladora: { name: 'Sealer', spec: 'T6 120 V. New packs, lot and date.' },
    estante: { name: 'Finished-goods shelf', spec: 'Apart from raw material.' },
    gabachas: { name: 'Apron wall', spec: 'Hairnets, aprons and gloves at entry. From the cooperative drawing: keep.' },
    lavamanos: { name: 'Staff handwash', spec: 'Pedal, knee or sensor. Soap and paper. RTCA 5.4.3.' },
    tablero: { name: 'Panel TAB', spec: '12 spaces, 60 A, 120/240 V, 3 kW inverter (C7).' },
    'pila-ext': { name: 'Outdoor sink', spec: 'Crates and boots. Rainwater, not food. T8 GFCI.' },
    tanque: { name: '1,000 L rain tank', spec: 'Gutter, first flush, lid. Green network, never crossed with potable.' },
  },
};

export const separacionesList: LocaleCopy<string[]> = {
  es: [
    'Sucio / húmedo (atrás) vs limpio (frente): envase y almacén 1 cm más altos.',
    'Pantalla 1,20 m entre transformación y envase. 50 cm libres alrededor de cada máquina.',
    'Pelar y cortar tiene franja propia: mesa de acero, no es una esquina de la pila.',
    'Deshidratar, triturar y cocinar conviven en transformación. La receta elige la técnica.',
    'Ingreso: lavamanos de pedal. El producto terminado sale por la misma puerta de frente.',
  ],
  'pt-BR': [
    'Sujo / úmido (atrás) vs limpo (frente): envase e armazém 1 cm mais altos.',
    'Tela 1,20 m entre transformação e envase. 50 cm livres em volta de cada máquina.',
    'Descascar e cortar tem faixa própria: mesa de aço, não é um canto da pia.',
    'Desidratar, triturar e cozinhar convivem na transformação. A receita escolhe a técnica.',
    'Ingresso: lavatório de pedal. O produto acabado sai pela mesma porta da frente.',
  ],
  en: [
    'Dirty / wet (back) vs clean (front): packing and storage sit 1 cm higher.',
    '1.20 m screen between transformation and packing. 50 cm clear around each machine.',
    'Peel and cut has its own strip: steel table, not a corner of the sink.',
    'Drying, milling and cooking share transformation. The recipe picks the technique.',
    'Entry: pedal handwash. Finished goods leave by the same front door.',
  ],
};

export const equipoShort: LocaleCopy<Record<string, string>> = {
  es: {
    pila: 'Pila',
    canastas: 'Recepción',
    'mesa-prep': 'Corte',
    molino: 'Molino',
    fogon: 'Fogón',
    dehydrator: 'Deshidratadora',
    extractor: 'Extractor',
    'mesa-env': 'Envase',
    selladora: 'Selladora',
    estante: 'Estante',
    gabachas: 'Gabachas',
    lavamanos: 'Lavamanos',
    tablero: 'TAB',
    'pila-ext': 'Pila ext.',
    tanque: 'Tanque',
  },
  'pt-BR': {
    pila: 'Pia',
    canastas: 'Recepção',
    'mesa-prep': 'Corte',
    molino: 'Moinho',
    fogon: 'Fogão',
    dehydrator: 'Desidratadora',
    extractor: 'Exaustor',
    'mesa-env': 'Envase',
    selladora: 'Seladora',
    estante: 'Prateleira',
    gabachas: 'Aventais',
    lavamanos: 'Lavatório',
    tablero: 'TAB',
    'pila-ext': 'Pia ext.',
    tanque: 'Tanque',
  },
  en: {
    pila: 'Sink',
    canastas: 'Receiving',
    'mesa-prep': 'Cut',
    molino: 'Mill',
    fogon: 'Stove',
    dehydrator: 'Dehydrator',
    extractor: 'Extractor',
    'mesa-env': 'Packing',
    selladora: 'Sealer',
    estante: 'Shelf',
    gabachas: 'Aprons',
    lavamanos: 'Handwash',
    tablero: 'Panel',
    'pila-ext': 'Yard sink',
    tanque: 'Tank',
  },
};

export const tomaUso: LocaleCopy<Record<string, string>> = {
  es: {
    T1: 'Pila de proceso',
    T2: 'Mesa de corte',
    T3: 'Molino 1–1,5 HP',
    T4: 'Deshidratadora 1,2 kW',
    T5: 'Balanza e higrómetro',
    T6: 'Selladora',
    T7: 'Iluminación / ingreso',
    T8: 'Pila exterior / bomba lluvia',
  },
  'pt-BR': {
    T1: 'Pia de processo',
    T2: 'Mesa de corte',
    T3: 'Moinho 1–1,5 HP',
    T4: 'Desidratadora 1,2 kW',
    T5: 'Balança e higrômetro',
    T6: 'Seladora',
    T7: 'Iluminação / ingresso',
    T8: 'Pia exterior / bomba da chuva',
  },
  en: {
    T1: 'Process sink',
    T2: 'Cutting table',
    T3: 'Mill 1–1.5 HP',
    T4: 'Dehydrator 1.2 kW',
    T5: 'Scale and hygrometer',
    T6: 'Sealer',
    T7: 'Lighting / entry',
    T8: 'Outdoor sink / rain pump',
  },
};

export const tomaAltura: Record<string, string> = {
  T1: '1,10 m',
  T2: '1,10 m',
  T3: '1,20 m',
  T4: '0,40 m',
  T5: '1,10 m',
  T6: '1,10 m',
  T7: '1,10 m',
  T8: '0,90 m',
};

export const nemaGloss: LocaleCopy<string[]> = {
  es: [
    'NEMA 5-15R: toma dúplex 120 V 15 A. Uso general (envase, ingreso).',
    'NEMA 5-20R: ranura en T, 120 V 20 A. Pila T1, mesa de corte T2, deshidratadora T4 y pila exterior T8; GFCI en húmedo e intemperie.',
    'NEMA 6-20R: 240 V 20 A. Molino (circuito dedicado). El fogón es gas: no pide toma 30 A.',
    'Altura: 1,10 m en mesas, 1,20 m en el molino, 0,40 m en la deshidratadora (gabinete), 0,90 m intemperie.',
  ],
  'pt-BR': [
    'NEMA 5-15R: tomada 120 V 15 A. Uso geral (envase, ingresso).',
    'NEMA 5-20R: fenda em T, 120 V 20 A. Pia, mesa de corte T2, desidratadora T4 e pia exterior T8; GFCI no úmido.',
    'NEMA 6-20R: 240 V 20 A. Moinho (circuito dedicado). O fogão é gás: não pede tomada 30 A.',
    'Altura: 1,10 m nas mesas, 1,20 m no moinho, 0,40 m na desidratadora, 0,90 m na intempérie.',
  ],
  en: [
    'NEMA 5-15R: 120 V 15 A duplex. General use (packing, entry).',
    'NEMA 5-20R: T-slot, 120 V 20 A. Sink, cutting table T2, dehydrator T4 and outdoor T8; GFCI in wet and outdoor.',
    'NEMA 6-20R: 240 V 20 A. Mill (dedicated). The stove is gas: no 30 A receptacle.',
    'Height: 1.10 m at tables, 1.20 m at the mill, 0.40 m at the dehydrator cabinet, 0.90 m outdoors.',
  ],
};

export function getPlanoLocale(locale: string): ProjectLocaleKey {
  return locale === 'pt-BR' || locale === 'en' ? locale : 'es';
}
