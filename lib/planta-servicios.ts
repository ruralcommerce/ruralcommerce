import type { ProjectLocaleKey } from '@/lib/project-locale';

type LocaleCopy<T> = Record<ProjectLocaleKey, T>;

/** Roof of the 4.0 × 5.5 m shed. Copey de Dota, ~1 800 m, cloudy highland. */
/** Roof 22 m². One 625 W module ≈ 2 kWh/day — lights only. Three cover the dehydrator in daylight. */
export const solarSpec = {
  panels: 3,
  watts: 625,
  kWp: 1.88,
  panelM2: 2.6,
  roofM2: 22,
  usedM2: 7.8,
  sunHours: 4.2,
  derate: 0.75,
  kwhDay: 5.9,
  inverterKw: 3,
  batteryKwh: 0,
  iceServiceA: 60,
};

export const solarLoads = [
  { id: 'dehydrator', w: 1200, hDay: 5, kwh: 6.0 },
  { id: 'mill', w: 1100, hDay: 1, kwh: 1.1 },
  { id: 'lights', w: 108, hDay: 6, kwh: 0.6 },
  { id: 'sealer', w: 300, hDay: 2, kwh: 0.6 },
  { id: 'pumps', w: 250, hDay: 1, kwh: 0.3 },
];

export const aguaSpec = {
  roofM2: 22,
  rainMmYear: 2200,
  capture: 0.8,
  litersYear: 38700,
  tankL: 1000,
  firstFlushL: 40,
  pumpW: 250,
};

export const solarCopy: LocaleCopy<{
  title: string;
  lead: string;
  idea: string;
  budgetOne: string;
  path: string;
  storage: string;
  inverter: string;
  ice: string;
  fit: string;
  disclaimer: string;
  loadsTitle: string;
  roof: string;
  motor: string;
  convertLabel: string;
  storeLabel: string;
}> = {
  es: {
    title: 'Energía solar del galerón',
    lead: 'Un solo panel de 625 W no alcanza para la deshidratadora: solo luces (~2 kWh/día). Con tres paneles (~5,9 kWh/día) el sol cubre el proceso de día; la red ICE cubre nublado. El fogón es gas.',
    idea: 'Meta del croquis: 3 × 625 W (1,88 kWp) en este techo.',
    budgetOne: 'Si el presupuesto solo da para uno: sí se puede instalar 1 × 625 W ya (luces y tomas chicas), y dejar conduit/estructura listos para llegar a tres. Un panel no mueve la deshidratadora de 1,2 kW sola.',
    path: 'Camino de la energía: paneles (DC) → inversor 3 kW en el tablero C7 (pasa a AC 120/240 V) → breakers → equipos. Excedente va a la red ICE por el medidor bidireccional.',
    storage: 'No hay baterías en esta propuesta (caro a esta escala). El “almacén” es la red ICE: de día se inyecta/se usa sol; de noche o nublado se compra a ICE. Un híbrido deja opción de batería después, pero no es obligatoria para arrancar.',
    inverter: 'Inversor híbrido 3 kW en el tablero (C7): es el conversor DC→AC.',
    ice: 'Servicio ICE 60 A + medidor bidireccional (compra/venta).',
    fit: '3 módulos ≈ 8 m² sobre 22 m² de techo. No tapan ventana ni extractor.',
    disclaimer: '',
    loadsTitle: 'Cargas eléctricas de un día de proceso',
    roof: 'Techo 4,0 × 5,5 m',
    motor: 'Inversor 3 kW',
    convertLabel: 'Conversor',
    storeLabel: 'Sin batería',
  },
  'pt-BR': {
    title: 'Energia solar do galpão',
    lead: 'Um painel só de 625 W não basta para a desidratadora: só luzes (~2 kWh/dia). Com três (~5,9 kWh/dia) o sol cobre o processo de dia; a rede ICE cobre nublado. O fogão é gás.',
    idea: 'Meta do croqui: 3 × 625 W (1,88 kWp) neste telhado.',
    budgetOne: 'Se o dinheiro só dá para um: pode instalar 1 × 625 W já (luzes e tomadas pequenas) e deixar eletroduto/estrutura prontos para chegar a três. Um painel sozinho não move a desidratadora de 1,2 kW.',
    path: 'Caminho da energia: painéis (CC) → inversor 3 kW no quadro C7 (vira CA 120/240 V) → disjuntores → equipamentos. Sobra vai para a rede ICE pelo medidor bidirecional.',
    storage: 'Não há baterias nesta proposta (caro nesta escala). O “armazenamento” é a rede ICE: de dia usa/injeta sol; de noite ou nublado compra da ICE. O inversor híbrido deixa opção de bateria depois, mas não é obrigatória para começar.',
    inverter: 'Inversor híbrido 3 kW no quadro (C7): é o conversor CC→CA.',
    ice: 'Serviço ICE 60 A + medidor bidirecional (compra/venda).',
    fit: '3 módulos ≈ 8 m² sobre 22 m² de telhado.',
    disclaimer: '',
    loadsTitle: 'Cargas elétricas de um dia de processo',
    roof: 'Telhado 4,0 × 5,5 m',
    motor: 'Inversor 3 kW',
    convertLabel: 'Conversor',
    storeLabel: 'Sem bateria',
  },
  en: {
    title: 'Solar power for the shed',
    lead: 'One 625 W module is not enough for the dehydrator: lights only (~2 kWh/day). Three modules (~5.9 kWh/day) cover daytime process; ICE covers clouds. The stove is gas.',
    idea: 'Drawing target: 3 × 625 W (1.88 kWp) on this roof.',
    budgetOne: 'If budget only allows one: install 1 × 625 W now (lights and small receptacles) and leave conduit/racking ready for three. One panel alone will not run the 1.2 kW dehydrator.',
    path: 'Energy path: panels (DC) → 3 kW inverter at panel C7 (to AC 120/240 V) → breakers → loads. Surplus goes to ICE via the bidirectional meter.',
    storage: 'No batteries in this proposal (expensive at this scale). “Storage” is the ICE grid: daytime solar use/export; night or clouds buy from ICE. A hybrid inverter leaves a future battery option, but it is not required to start.',
    inverter: '3 kW hybrid inverter at the panel (C7): the DC→AC converter.',
    ice: 'ICE 60 A service + bidirectional meter (buy/sell).',
    fit: '3 modules ≈ 8 m² on a 22 m² roof.',
    disclaimer: '',
    loadsTitle: 'Electrical loads on a process day',
    roof: 'Roof 4.0 × 5.5 m',
    motor: '3 kW inverter',
    convertLabel: 'Converter',
    storeLabel: 'No battery',
  },
};

export const loadLabels: LocaleCopy<Record<string, string>> = {
  es: {
    dehydrator: 'Deshidratadora eléctrica',
    mill: 'Molino',
    lights: '6 LED',
    sealer: 'Selladora y mesa',
    pumps: 'Bomba de lluvia',
  },
  'pt-BR': {
    dehydrator: 'Desidratadora elétrica',
    mill: 'Moinho',
    lights: '6 LED',
    sealer: 'Seladora e mesa',
    pumps: 'Bomba da chuva',
  },
  en: {
    dehydrator: 'Electric dehydrator',
    mill: 'Mill',
    lights: '6 LEDs',
    sealer: 'Sealer and table',
    pumps: 'Rainwater pump',
  },
};

export const aguaCopy: LocaleCopy<{
  title: string;
  lead: string;
  capture: string;
  dual: string;
  treat: string;
  residual: string;
  legal: string;
  potable: string;
  rain: string;
  tank: string;
  stepBlue: string;
  stepGreen: string;
  stepOut: string;
  blueTitle: string;
  greenTitle: string;
  outTitle: string;
}> = {
  es: {
    title: 'Agua: dos redes + desagüe',
    lead: 'Lea el croquis en tres colores: azul = beber/alimento (red). Verde = lluvia para limpiar. Marrón = agua sucia que sale a la trampa. Nunca se mezclan.',
    capture: 'Techo → canaleta → primeras 40 L se tiran (sucias) → tanque 1 000 L. ~39 000 L/año posibles; el tanque guarda el día a día.',
    dual: 'Azul (AyA/ASADA): lavar alimento, enjuague final, lavamanos de personas. Verde (lluvia filtrada): piso, canastas sucias, pila exterior, riego. Tuberías separadas, sin cruce (RTCA 5.3).',
    treat: 'La lluvia solo lleva filtro 50 µm + carbón: limpia para lavar piso, no es potable. No se propone beberla ni usarla en alimento sin potabilizar y permiso de Salud.',
    residual: 'Pila y piso → ralos D1/D2 → canastilla → trampa de grasas 50–100 L → descarga autorizada. Nunca a la quebrada.',
    legal: 'Decreto 38924-S · RTCA 67.01.33:06 §5.3 · Decreto 33601.',
    potable: 'Red potable',
    rain: 'Red de lluvia',
    tank: 'Tanque 1 000 L',
    stepBlue: 'Para comer y manos: solo la red azul (potable).',
    stepGreen: 'Para limpiar el local: red verde (lluvia del tanque).',
    stepOut: 'Lo que se ensucia sale por ralos → trampa → descarga legal.',
    blueTitle: '1 · Azul',
    greenTitle: '2 · Verde',
    outTitle: '3 · Salida',
  },
  'pt-BR': {
    title: 'Água: duas redes + esgoto',
    lead: 'Leia o croqui em três cores: azul = beber/alimento (rede). Verde = chuva para limpar. Marrom = água suja que sai pela caixa. Nunca se misturam.',
    capture: 'Telhado → calha → primeiros 40 L jogados fora (sujos) → tanque 1 000 L. ~39 000 L/ano possíveis; o tanque guarda o dia a dia.',
    dual: 'Azul (AyA/ASADA): lavar alimento, enxágue final, lavatórios de pessoas. Verde (chuva filtrada): piso, cestos sujos, pia exterior, irrigação. Tubos separados, sem cruzamento (RTCA 5.3).',
    treat: 'A chuva só tem filtro 50 µm + carvão: serve para limpar piso, não é potável. Não se propõe beber nem usar em alimento sem potabilizar e autorização da Saúde.',
    residual: 'Pia e piso → ralos D1/D2 → cesto → caixa de gordura 50–100 L → descarga autorizada. Nunca na quebrada.',
    legal: 'Decreto 38924-S · RTCA 5.3 · Decreto 33601.',
    potable: 'Rede potável',
    rain: 'Rede de chuva',
    tank: 'Tanque 1 000 L',
    stepBlue: 'Para alimento e mãos: só a rede azul (potável).',
    stepGreen: 'Para limpar o galpão: rede verde (chuva do tanque).',
    stepOut: 'O que suja sai pelos ralos → caixa → descarga legal.',
    blueTitle: '1 · Azul',
    greenTitle: '2 · Verde',
    outTitle: '3 · Saída',
  },
  en: {
    title: 'Water: two networks + drain',
    lead: 'Read the drawing in three colors: blue = drink/food (grid). Green = rain for cleaning. Brown = dirty water out to the trap. Never mix them.',
    capture: 'Roof → gutter → first 40 L dumped (dirty) → 1,000 L tank. ~39,000 L/year possible; the tank holds day-to-day use.',
    dual: 'Blue (AyA/ASADA): wash food, final rinse, handwash. Green (filtered rain): floors, dirty crates, outdoor sink, irrigation. Separate pipes, no cross-connection (RTCA 5.3).',
    treat: 'Rain only gets 50 µm + carbon: fine for floors, not potable. Not proposed for drinking or food without full treatment and Health approval.',
    residual: 'Sink and floor → drains D1/D2 → basket → 50–100 L grease trap → authorized discharge. Never to the creek.',
    legal: 'Decree 38924-S · RTCA 5.3 · Decree 33601.',
    potable: 'Potable line',
    rain: 'Rain line',
    tank: '1,000 L tank',
    stepBlue: 'For food and hands: blue network only (potable).',
    stepGreen: 'For cleaning the shed: green network (tank rain).',
    stepOut: 'Dirty water leaves via drains → trap → legal discharge.',
    blueTitle: '1 · Blue',
    greenTitle: '2 · Green',
    outTitle: '3 · Out',
  },
};

export const coopReview: LocaleCopy<{
  title: string;
  lead: string;
  keepTitle: string;
  dropTitle: string;
  keep: string[];
  drop: string[];
}> = {
  es: {
    title: 'Propuesta que mandó la cooperativa',
    lead: 'Acierto en el ingreso (lavamanos y gabachas). El resto mezcla húmedo con seco y pone una cocina industrial donde debería ir el envase o la deshidratadora.',
    keepTitle: 'Qué sí sirve',
    dropTitle: 'Qué no cumple',
    keep: [
      'Lavamanos de personal en la puerta de frente (RTCA 5.4.3).',
      'Pared de gabachas, cofias y guantes en el ingreso: barrera de personas.',
      'Pila interior en la estación sucia, junto a la puerta de acopio.',
      'Pila exterior para canastas y botas: bien, con desagüe a trampa, no al piso suelto.',
    ],
    drop: [
      'El fogón de 4 quemadores está en la franja “Seco”: vapor y grasa sobre el envase. Va en cocción, con extractor, no en la zona limpia.',
      'No hay deshidratadora. El equipo del proyecto es eléctrico, adentro, con toma y extractor de humedad al exterior — no una caja solar en el patio.',
      '“Producto húmedo” vacío y “Seco” con cocina: el flujo sucio → húmedo → seco queda dibujado, pero el equipo lo contradice.',
      'Cinco lámparas; el código pide seis con cubierta. No hay pendiente ni ralos ni trampa de grasas.',
      'Líneas punteadas no bastan: el piso de envase va 1 cm más alto y el agua no puede correr hacia el empaque.',
    ],
  },
  'pt-BR': {
    title: 'Proposta que a cooperativa enviou',
    lead: 'Acertam o ingresso (lavatório e aventais). O resto mistura úmido com seco e põe fogão industrial onde deveria ir o envase ou a desidratadora.',
    keepTitle: 'O que serve',
    dropTitle: 'O que não cumpre',
    keep: [
      'Lavatório de pessoal na porta da frente (RTCA 5.4.3).',
      'Parede de aventais, toucas e luvas no ingresso.',
      'Pia interior na estação suja, junto à porta do acopio.',
      'Pia exterior para cestos e botas: sim, com dreno à caixa de gordura.',
    ],
    drop: [
      'O fogão de 4 bocas está na faixa “Seco”: vapor e gordura sobre o envase. Fica na cocção, com exaustor, não na zona limpa.',
      'Não há desidratadora. O equipamento do projeto é elétrico, dentro, com tomada e exaustor de umidade — não uma caixa solar no pátio.',
      '“Produto úmido” vazio e “Seco” com fogão: o fluxo está escrito, o equipamento o contradiz.',
      'Cinco lâmpadas; o código pede seis com cobertura. Sem caimento, ralos nem caixa de gordura.',
      'Linhas pontilhadas não bastam: o piso de envase fica 1 cm mais alto.',
    ],
  },
  en: {
    title: 'Drawing the cooperative sent',
    lead: 'They got entry right (handwash and aprons). The rest mixes wet with dry and puts an industrial stove where packing or the dehydrator should sit.',
    keepTitle: 'What to keep',
    dropTitle: 'What does not comply',
    keep: [
      'Staff handwash at the front door (RTCA 5.4.3).',
      'Apron, hairnet and glove wall at entry.',
      'Indoor sink in the dirty station, by the collection-center door.',
      'Outdoor sink for crates and boots: yes, draining to the grease trap.',
    ],
    drop: [
      'The four-burner stove sits in the “Dry” strip: steam and grease over packing. It belongs in cooking, with an extractor, not in the clean zone.',
      'No dehydrator. The project machine is electric, indoors, with a receptacle and a moisture vent — not a solar box in the yard.',
      'Empty “wet product” band and a stove in “dry”: the labels say one flow, the equipment says another.',
      'Five lamps; the code wants six with covers. No slope, drains or grease trap.',
      'Dashed lines are not enough: packing floor sits 1 cm higher.',
    ],
  },
};

export const materialesCopy: LocaleCopy<{
  title: string;
  floors: { title: string; items: string[] };
  walls: { title: string; items: string[] };
  split: { title: string; items: string[] };
}> = {
  es: {
    title: 'Materiales y divisiones',
    floors: {
      title: 'Pisos',
      items: [
        'Lavado, recepción, corte y transformación: concreto pulido + epóxico antideslizante, media caña, pendiente 1,5–2 % a D1 y D2.',
        'Envase y almacén: el mismo epóxico, 1 cm más alto.',
        'Ingreso: mismo piso + tapete lavable.',
      ],
    },
    walls: {
      title: 'Paredes y cielo',
      items: [
        'Muros existentes: recubrimiento lavable hasta 1,80 m (epóxico o cerámica). Sin madera en proceso.',
        'Cielo liso, lavable. Seis LED IP65 con cubierta.',
        'Ventana con malla. Puertas con burlete.',
      ],
    },
    split: {
      title: 'Qué se divide y qué no',
      items: [
        'No hay paredes de block entre cada zona: el galerón es un solo cuarto de 22 m².',
        'Recepción y lavado: solo una línea naranja en el piso.',
        'Transformación vs envase/almacén: pantalla o mueble de 1,20 m + franja amarilla de 10 cm.',
        'Ingreso: el lavamanos y el tapete cortan el paso. No hace falta un muro.',
      ],
    },
  },
  'pt-BR': {
    title: 'Materiais e divisões',
    floors: {
      title: 'Pisos',
      items: [
        'Lavagem, recepção, corte e transformação: concreto polido + epóxi antiderrapante, meia-cana, caimento 1,5–2% para D1 e D2.',
        'Envase e armazém: o mesmo epóxi, 1 cm mais alto.',
        'Ingresso: mesmo piso + tapete lavável.',
      ],
    },
    walls: {
      title: 'Paredes e forro',
      items: [
        'Muros existentes: revestimento lavável até 1,80 m (epóxi ou cerâmica). Sem madeira no processo.',
        'Forro liso, lavável. Seis LED IP65 com cobertura.',
        'Janela com tela. Portas com vedação.',
      ],
    },
    split: {
      title: 'O que se divide e o que não',
      items: [
        'Não há paredes de bloco entre cada zona: o galpão é um só quarto de 22 m².',
        'Recepção e lavagem: só uma faixa laranja no piso.',
        'Transformação vs envase/armazém: tela ou móvel de 1,20 m + faixa amarela de 10 cm.',
        'Ingresso: o lavatório e o tapete cortam o passo. Não precisa muro.',
      ],
    },
  },
  en: {
    title: 'Materials and partitions',
    floors: {
      title: 'Floors',
      items: [
        'Wash, receiving, cutting and transformation: polished concrete + anti-slip epoxy, coved skirting, 1.5–2% slope to D1 and D2.',
        'Packing and storage: the same epoxy, 1 cm higher.',
        'Entry: same floor + washable mat.',
      ],
    },
    walls: {
      title: 'Walls and ceiling',
      items: [
        'Existing walls: washable finish to 1.80 m (epoxy or tile). No wood in process.',
        'Smooth washable ceiling. Six covered IP65 LEDs.',
        'Window with mesh. Doors with sweeps.',
      ],
    },
    split: {
      title: 'What is divided and what is not',
      items: [
        'No masonry walls between each zone: the shed is one 22 m² room.',
        'Receiving and wash: orange floor tape only.',
        'Transformation vs packing/storage: 1.20 m screen or cabinet + 10 cm yellow band.',
        'Entry: handwash and mat cut the path. No wall needed.',
      ],
    },
  },
};

