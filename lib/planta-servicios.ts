import type { ProjectLocaleKey } from '@/lib/project-locale';

type LocaleCopy<T> = Record<ProjectLocaleKey, T>;

/** Roof 22 m². Phase 1 budget ~US$1,000: one 625 W + small inverter, no battery. Dehydrator on ICE. */
export const solarSpec = {
  panels: 3,
  panelsPhase1: 1,
  watts: 625,
  kWp: 1.88,
  kWpPhase1: 0.63,
  panelM2: 2.6,
  roofM2: 22,
  usedM2: 7.8,
  sunHours: 4.2,
  derate: 0.75,
  kwhDay: 5.9,
  kwhDayPhase1: 2.0,
  inverterKw: 3,
  inverterKwBridge: 1.5,
  batteryKwh: 0,
  iceServiceA: 60,
  budgetUsd: 1000,
};

export const solarLoads = [
  { id: 'dehydrator', w: 1200, hDay: 5, kwh: 6.0, pay: 'target' as const },
  { id: 'mill', w: 1100, hDay: 1, kwh: 1.1, pay: 'target' as const },
  { id: 'lights', w: 108, hDay: 6, kwh: 0.6, pay: 'bridge' as const },
  { id: 'sealer', w: 300, hDay: 2, kwh: 0.6, pay: 'bridge' as const },
  { id: 'pumps', w: 250, hDay: 1, kwh: 0.3, pay: 'bridge' as const },
];

export const payLabels: LocaleCopy<Record<'bridge' | 'target' | 'ice', string>> = {
  es: {
    bridge: 'Puente (1 panel)',
    target: 'Meta limpia (3 paneles)',
    ice: 'Solo respaldo ICE',
  },
  'pt-BR': {
    bridge: 'Ponte (1 painel)',
    target: 'Meta limpa (3 painéis)',
    ice: 'Só backup ICE',
  },
  en: {
    bridge: 'Bridge (1 panel)',
    target: 'Clean target (3 panels)',
    ice: 'ICE backup only',
  },
};

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
  payCol: string;
  roof: string;
  motor: string;
  convertLabel: string;
  storeLabel: string;
  phaseNow: string;
  phaseLater: string;
  cleanGoal: string;
  compete: string;
}> = {
  es: {
    title: 'Energía solar · producción limpia',
    lead: 'La meta del proyecto no es “usar ICE para siempre”: es proceso de día con sol (deshidratadora incluida). US$ 1 000 alcanza solo para arrancar el techo; el sistema limpio completo es la prioridad de fondeo, no un lujo.',
    idea: 'Meta limpia: 3 × 625 W (~5,9 kWh/día) para correr el lote en horario solar. Fase puente: 1 panel + conversor chico mientras se cierra el gap.',
    cleanGoal: 'Producción limpia = deshidratar y moler con kWh solares de día. La red ICE queda como respaldo (nublado/noche), no como motor principal del proceso.',
    compete: 'Eficiencia y competitividad: cada kWh de sol baja la factura ICE, estabiliza el costo del lote y sostiene el relato de producto limpio frente a compradores y fondos. Recortar el solar “para ahorrar” sale caro en imagen y en operación.',
    budgetOne: 'Con US$ 1 000 hoy: 1 panel 550–625 W + conversor ~1–1,5 kW + rieles/cable. Eso es puente, no la meta. Falta ~2 paneles más + subir el inversor hacia 3 kW. Cotizar ese gap (~US$ 1,5–2,5 k) como ítem de donación/ Impulsa, no como “opcional”.',
    path: 'Arquitectura final: paneles → inversor en C7 → equipos de proceso en horario solar. Puente: el mismo cableado y tablero; solo faltan módulos e inversor más grande. No improvisar otra lógica eléctrica después.',
    storage: 'Sin batería en el presupuesto puente (carísima). El respaldo limpio de corto plazo es la ICE; el de largo plazo puede ser batería si un fondo lo paga. Nunca presentar la ICE como el plan energético del proyecto.',
    inverter: 'Puente: conversor ~1–1,5 kW. Meta: híbrido ~3 kW en el mismo hueco del tablero C7.',
    ice: 'ICE 60 A: respaldo y arranque legal. No sustituye el techo solar en el discurso ni en el costo del lote.',
    fit: 'Techo 22 m²: 1 módulo ahora + 2 marcados (meta). No comprar baterías antes de completar los 3 paneles.',
    disclaimer: 'Precios CR de referencia: panel 550–625 W ≈ ₡160–195 mil. El tope US$ 1 000 es solo el puente; el paquete limpio completo se presupuesta aparte para donantes.',
    loadsTitle: 'Cargas · meta limpia vs puente',
    payCol: 'Fuente',
    roof: 'Techo 4,0 × 5,5 m',
    motor: 'Inversor meta 3 kW',
    convertLabel: 'Conversor',
    storeLabel: 'Sin batería',
    phaseNow: 'Puente · US$1k',
    phaseLater: 'Meta limpia',
  },
  'pt-BR': {
    title: 'Energia solar · produção limpa',
    lead: 'A meta do projeto não é “usar ICE para sempre”: é processo de dia com sol (desidratadora incluída). US$ 1 000 só serve para arrancar o telhado; o sistema limpo completo é prioridade de financiamento, não luxo.',
    idea: 'Meta limpa: 3 × 625 W (~5,9 kWh/dia) para rodar o lote no horário solar. Fase ponte: 1 painel + conversor pequeno enquanto se fecha o gap.',
    cleanGoal: 'Produção limpa = desidratar e moer com kWh solares de dia. A rede ICE fica como backup (nublado/noite), não como motor principal do processo.',
    compete: 'Eficiência e competitividade: cada kWh de sol baixa a conta ICE, estabiliza o custo do lote e sustenta o discurso de produto limpo perante compradores e fundos. Cortar o solar “para economizar” sai caro em imagem e em operação.',
    budgetOne: 'Com US$ 1 000 hoje: 1 painel 550–625 W + conversor ~1–1,5 kW + trilhos/cabo. Isso é ponte, não a meta. Faltam ~2 painéis + subir o inversor rumo a 3 kW. Cotizar esse gap (~US$ 1,5–2,5 k) como item de doação/Impulsa, não como “opcional”.',
    path: 'Arquitetura final: painéis → inversor no C7 → equipamentos de processo no horário solar. Ponte: a mesma fiação e quadro; só faltam módulos e inversor maior. Não improvisar outra lógica elétrica depois.',
    storage: 'Sem bateria no orçamento ponte (caríssima). O backup limpo de curto prazo é a ICE; o de longo prazo pode ser bateria se um fundo pagar. Nunca apresentar a ICE como o plano energético do projeto.',
    inverter: 'Ponte: conversor ~1–1,5 kW. Meta: híbrido ~3 kW no mesmo vão do quadro C7.',
    ice: 'ICE 60 A: backup e arranque legal. Não substitui o telhado solar no discurso nem no custo do lote.',
    fit: 'Telhado 22 m²: 1 módulo agora + 2 marcados (meta). Não comprar baterias antes de completar os 3 painéis.',
    disclaimer: 'Preços CR de referência: painel 550–625 W ≈ ₡160–195 mil. O teto US$ 1 000 é só a ponte; o pacote limpo completo se orça à parte para doadores.',
    loadsTitle: 'Cargas · meta limpa vs ponte',
    payCol: 'Fonte',
    roof: 'Telhado 4,0 × 5,5 m',
    motor: 'Inversor meta 3 kW',
    convertLabel: 'Conversor',
    storeLabel: 'Sem bateria',
    phaseNow: 'Ponte · US$1k',
    phaseLater: 'Meta limpa',
  },
  en: {
    title: 'Solar · clean production',
    lead: 'The project goal is not “ICE forever”: it is daytime process on solar (dehydrator included). US$1,000 only starts the roof; the full clean system is a funding priority, not a luxury.',
    idea: 'Clean target: 3 × 625 W (~5.9 kWh/day) to run the batch in solar hours. Bridge: 1 panel + small converter while the gap is closed.',
    cleanGoal: 'Clean production = dry and mill on daytime solar kWh. ICE is backup (clouds/night), not the main process driver.',
    compete: 'Efficiency and competitiveness: each solar kWh cuts the ICE bill, stabilizes batch cost, and backs the clean-product story for buyers and funds. Cutting solar “to save money” costs more in image and operations.',
    budgetOne: 'With US$1,000 today: one 550–625 W panel + ~1–1.5 kW converter + rails/cable. That is a bridge, not the goal. Still need ~2 panels + upsize toward 3 kW. Quote that gap (~US$1.5–2.5k) as a donation/Impulsa line item, not “optional”.',
    path: 'Final architecture: panels → inverter at C7 → process loads in solar hours. Bridge: same wiring and panel; only modules and a larger inverter are missing. Do not invent a second electrical logic later.',
    storage: 'No battery in the bridge budget (too expensive). Short-term clean backup is ICE; long-term battery only if a fund pays. Never present ICE as the project’s energy plan.',
    inverter: 'Bridge: ~1–1.5 kW converter. Target: ~3 kW hybrid in the same C7 slot.',
    ice: 'ICE 60 A: backup and legal start. It does not replace the solar roof in the story or in batch cost.',
    fit: '22 m² roof: 1 module now + 2 marked (target). Do not buy batteries before completing 3 panels.',
    disclaimer: 'CR reference panel prices: 550–625 W ≈ ₡160–195k. The US$1,000 cap is only the bridge; the full clean package is budgeted separately for donors.',
    loadsTitle: 'Loads · clean target vs bridge',
    payCol: 'Source',
    roof: 'Roof 4.0 × 5.5 m',
    motor: 'Target inverter 3 kW',
    convertLabel: 'Converter',
    storeLabel: 'No battery',
    phaseNow: 'Bridge · US$1k',
    phaseLater: 'Clean target',
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

