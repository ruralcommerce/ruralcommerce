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
  inverter: string;
  ice: string;
  fit: string;
  disclaimer: string;
  loadsTitle: string;
  roof: string;
  motor: string;
}> = {
  es: {
    title: 'Energía solar del galerón',
    lead: 'Un panel de 625 W rinde ~2 kWh/día: solo luces. La deshidratadora pide 1,2 kW. Tres paneles de 625 W (1,88 kWp) cubren el día de sol; la red ICE cubre nublado. El fogón es gas, no carga el techo.',
    idea: '3 × 625 W en este techo. Inversor híbrido 3 kW. ~5,9 kWh/día en Dota.',
    inverter: 'Inversor 3 kW en el tablero (C7).',
    ice: 'Medidor bidireccional ICE.',
    fit: '3 módulos ≈ 8 m² sobre 22 m² de techo. No tapan ventana ni extractor.',
    disclaimer: '',
    loadsTitle: 'Cargas eléctricas de un día de proceso',
    roof: 'Techo 4,0 × 5,5 m',
    motor: 'Inversor 3 kW',
  },
  'pt-BR': {
    title: 'Energia solar do galpão',
    lead: 'Um painel de 625 W rende ~2 kWh/dia: só luzes. A desidratadora pede 1,2 kW. Três de 625 W (1,88 kWp) cobrem o dia de sol; a rede ICE cobre nublado. O fogão é gás.',
    idea: '3 × 625 W neste telhado. Inversor híbrido 3 kW. ~5,9 kWh/dia em Dota.',
    inverter: 'Inversor 3 kW no quadro (C7).',
    ice: 'Medidor bidirecional ICE.',
    fit: '3 módulos ≈ 8 m² sobre 22 m² de telhado.',
    disclaimer: '',
    loadsTitle: 'Cargas elétricas de um dia de processo',
    roof: 'Telhado 4,0 × 5,5 m',
    motor: 'Inversor 3 kW',
  },
  en: {
    title: 'Solar power for the shed',
    lead: 'One 625 W module yields ~2 kWh/day: lights only. The dehydrator draws 1.2 kW. Three 625 W modules (1.88 kWp) cover daylight; ICE covers clouds. The stove is gas.',
    idea: '3 × 625 W on this roof. 3 kW hybrid inverter. ~5.9 kWh/day in Dota.',
    inverter: '3 kW inverter at the panel (C7).',
    ice: 'ICE bidirectional meter.',
    fit: '3 modules ≈ 8 m² on a 22 m² roof.',
    disclaimer: '',
    loadsTitle: 'Electrical loads on a process day',
    roof: 'Roof 4.0 × 5.5 m',
    motor: '3 kW inverter',
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
}> = {
  es: {
    title: 'Lluvia, dual y residuales',
    lead: 'El techo de 22 m², con 2 200 mm/año en Dota, puede juntar unos 39 m³ al año. Un tanque de 1 000 L basta a esta escala. El agua de proceso y de manos sigue siendo potable de red.',
    capture: 'Canaleta + malla + desviador de primeras aguas (40 L) + tanque 1 000 L a la sombra, elevado 40 cm, tapa sanitaria y desagüe de fondo.',
    dual: 'Dos redes, nunca cruzadas (RTCA 5.3): azul = potable AyA/ASADA (alimento, enjuague final, lavamanos). Verde = lluvia filtrada (piso, canastas sucias, pila exterior, trampa, riego).',
    treat: 'Lluvia: filtro de sedimento 50 µm + carbón. No es potable. Para usarla en alimento haría falta potabilización, análisis (Decreto 38924-S) y visto de Salud. Aquí no se propone eso.',
    residual: 'Pila y piso → D1/D2 → canastilla → trampa de grasas 50–100 L → descarga autorizada (Decreto 33601). Nunca a la quebrada.',
    legal: 'Decreto 38924-S calidad de agua potable · RTCA 67.01.33:06 §5.3 retroflujo · Decreto 33601 vertido y reúso.',
    potable: 'Red potable',
    rain: 'Red de lluvia',
    tank: 'Tanque 1 000 L',
  },
  'pt-BR': {
    title: 'Chuva, rede dupla e efluentes',
    lead: 'O telhado de 22 m², com 2 200 mm/ano em Dota, junta uns 39 m³/ano. Um tanque de 1 000 L basta. Água de processo e de mãos continua potável da rede.',
    capture: 'Calha + tela + desvio das primeiras águas (40 L) + tanque 1 000 L à sombra, 40 cm do piso, tampa e dreno de fundo.',
    dual: 'Duas redes, nunca cruzadas (RTCA 5.3): azul = potável AyA/ASADA (alimento, enxágue final, lavatórios). Verde = chuva filtrada (piso, cestos sujos, pia exterior, caixa de gordura, irrigação).',
    treat: 'Chuva: filtro 50 µm + carvão. Não é potável. Usar em alimento exigiria potabilização, laudos (Decreto 38924-S) e Saúde. Aqui não se propõe isso.',
    residual: 'Pia e piso → D1/D2 → cesto → caixa de gordura 50–100 L → descarga autorizada (Decreto 33601). Nunca na quebrada.',
    legal: 'Decreto 38924-S água potável · RTCA 5.3 retrofluxo · Decreto 33601 efluentes.',
    potable: 'Rede potável',
    rain: 'Rede de chuva',
    tank: 'Tanque 1 000 L',
  },
  en: {
    title: 'Rain, dual plumbing and wastewater',
    lead: 'The 22 m² roof, at 2,200 mm/year in Dota, can catch about 39 m³/year. A 1,000 L tank is enough. Process and hand water stay grid-potable.',
    capture: 'Gutter + screen + first-flush 40 L + 1,000 L tank in the shade, 40 cm off the floor, sanitary lid and bottom drain.',
    dual: 'Two networks, never crossed (RTCA 5.3): blue = AyA/ASADA potable (food, final rinse, handwash). Green = filtered rain (floors, dirty crates, outdoor sink, trap, irrigation).',
    treat: 'Rain: 50 µm sediment + carbon. Not potable. Food use would need full treatment, lab tests (Decree 38924-S) and Health sign-off. Not proposed here.',
    residual: 'Sink and floor → D1/D2 → basket → 50–100 L grease trap → authorized discharge (Decree 33601). Never to the creek.',
    legal: 'Decree 38924-S potable water · RTCA 5.3 backflow · Decree 33601 discharge and reuse.',
    potable: 'Potable line',
    rain: 'Rain line',
    tank: '1,000 L tank',
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

