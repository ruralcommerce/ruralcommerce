import type { ProjectLocaleKey } from '@/lib/project-locale';

export const PLANTA_NAV_PAGES = ['inicio', 'obra', 'croquis', 'legal', 'bpm', 'servicios', 'equipos'] as const;
export type PlantaNavPage = (typeof PLANTA_NAV_PAGES)[number];

export type PlantaZoneId = 'sucia' | 'humeda' | 'limpia';

type LocaleCopy<T> = Record<ProjectLocaleKey, T>;

export const plantaMeta = {
  widthM: 4,
  depthM: 5.5,
  areaM2: 22,
  cooperative: 'Cooperativa de Copey de Dota',
  place: 'Copey de Dota, San José, Costa Rica',
  neighbor: 'Centro de acopio',
};

export function plantaPath(locale: string, page: PlantaNavPage | 'convite' | '') {
  const base = `/${locale}/impulsacr`;
  if (page === 'convite') return `${base}/convite`;
  if (page === '' || page === 'inicio') return `${base}/planta`;
  return `${base}/planta/${page}`;
}

const navLabels: LocaleCopy<Record<PlantaNavPage, string>> = {
  es: {
    inicio: 'Inicio',
    obra: 'Obra ahora',
    croquis: 'Croquis',
    legal: 'Legal',
    bpm: 'BPM',
    servicios: 'Agua y energía',
    equipos: 'Equipos',
  },
  'pt-BR': {
    inicio: 'Início',
    obra: 'Obra agora',
    croquis: 'Croqui',
    legal: 'Legal',
    bpm: 'BPF',
    servicios: 'Água e energia',
    equipos: 'Equipamentos',
  },
  en: {
    inicio: 'Home',
    obra: 'Build now',
    croquis: 'Sketch',
    legal: 'Legal',
    bpm: 'GMP',
    servicios: 'Water & energy',
    equipos: 'Equipment',
  },
};

export function getPlantaNavLabel(locale: string, page: PlantaNavPage) {
  const key = locale === 'pt-BR' || locale === 'en' ? locale : 'es';
  return navLabels[key][page];
}

export type ChecklistItemCopy = {
  id: string;
  urgent?: boolean;
  title: string;
  body: string;
  legal: string;
};

const checklistByLocale: LocaleCopy<ChecklistItemCopy[]> = {
  es: [
    {
      id: 'piso-pendiente',
      urgent: true,
      title: 'Piso con pendiente, no plano',
      body: 'El galerón de 22 m² no puede quedar a nivel. Dejar pendiente de 1 a 2 % hacia los desagües (1–2 cm por metro) para que el agua de lavado no encharque ni corra hacia la zona limpia.',
      legal: 'RTCA 67.01.33:06 §5.3.2 y §5.4.1 — drenaje adecuado en pisos de proceso.',
    },
    {
      id: 'dos-desagues',
      urgent: true,
      title: 'Dos desagües de piso con rejilla antipestes',
      body: 'Uno en zona húmeda/sucia (lavado y cocción) y otro cerca del lavamanos de servicio. Rejilla que impida el paso de roedores. Sifón o trampa hidráulica. No dejar el desagüe de empaque en la zona más limpia si se puede evitar.',
      legal: 'RTCA 67.01.33:06 §5.4.1 — desagüe y eliminación de desechos sin contaminar el alimento.',
    },
    {
      id: 'lavamanos-frente',
      urgent: true,
      title: 'Segundo lavamanos en la puerta de frente',
      body: 'El croquis solo pone un lavatorio en la pared de atrás. Hace falta otro en el ingreso de personas: se entra, se lavan las manos, y recién entonces se pasa a proceso. Grifo que no se opere con la mano sucia (palanca de codo, pedal o sensor) y toallas de papel.',
      legal: 'RTCA 67.01.33:06 — instalaciones sanitarias y lavado de manos al ingresar a proceso.',
    },
    {
      id: 'seis-luces',
      urgent: true,
      title: 'Seis luminarias estancas, no dos bombillos',
      body: 'Dos bombillos no alcanzan ni se limpian bien. Colocar 6 luminarias con cubierta (IP65 o similar), de fácil lavado, repartidas en dos hileras de tres. Evitar vidrio expuesto sobre el alimento.',
      legal: 'RTCA 67.01.33:06 — iluminación suficiente, protegida y de fácil limpieza.',
    },
    {
      id: 'conduit-solar',
      urgent: true,
      title: 'Tubería al techo para paneles solares',
      body: 'Dejar conduit desde el tablero hasta la cubrición ahora, antes de cerrar cielos. Reserva para medidor de generación y para la conexión ICE. No romper el techo después.',
      legal: 'ICE / Reglamento de generación distribuida — acometida y medición según el profesional eléctrico responsable.',
    },
    {
      id: 'lavamanos-atras',
      title: 'Lavamanos de la pared de atrás',
      body: 'Mantener el lavatorio del croquis en la zona húmeda, con agua potable, jabón y desagüe a pretratamiento (no al piso).',
      legal: 'Ley General de Salud N.º 5395 y RTCA 67.01.33:06.',
    },
    {
      id: 'trampas',
      title: 'Trampa de grasas y de sólidos',
      body: 'Cocción, lavado de utensilios y piso generan grasa y pulpa. Instalar trampa de grasas y canastilla de sólidos antes de la descarga. Facilita el Permiso Sanitario y el Reglamento de Vertido.',
      legal: 'Decreto 33601-S-MINAE — Reglamento de Vertido y Reuso de Aguas Residuales.',
    },
    {
      id: 'tablero-ice',
      title: 'Tablero eléctrico accesible y separado del agua',
      body: 'Tablero en zona seca, con tierra física, breakers para proceso, iluminación, toma de bombas y reserva solar. Acometida ICE según carga real, no “dos bombillos”.',
      legal: 'Código Eléctrico de Costa Rica y requisitos ICE para servicio y generación distribuida.',
    },
    {
      id: 'agua-potable',
      title: 'Agua potable sin conexión cruzada',
      body: 'Punto de agua para proceso y lavamanos. Si hay agua no potable (riego, incendio, solar térmico), tubería identificada y sin retroflujo hacia el potable.',
      legal: 'RTCA 67.01.33:06 §5.3 — abastecimiento de agua y prevención de retroflujo.',
    },
    {
      id: 'muros-piso-techo',
      title: 'Superficies lisas, lavables y sin grietas',
      body: 'Piso continuo (concreto pulido + recubrimiento sanitizable). Muros hasta al menos 1,80 m lavables. Cielo que no desprenda partículas. Ángulos sanitarios donde el presupuesto lo permita.',
      legal: 'RTCA 67.01.33:06 — diseño y construcción del establecimiento.',
    },
    {
      id: 'ventana-malla',
      title: 'Ventana con malla antitrips / antiinsectos',
      body: 'La ventana del costado debe abrir para ventilación, con malla fija. No dejar hueco directo al acopio.',
      legal: 'RTCA 67.01.33:06 — control de plagas en aberturas.',
    },
    {
      id: 'puertas',
      title: 'Puertas con barrido y cierre',
      body: 'Puerta de frente (personas) y puerta de atrás (servicio/materia prima). Burlete inferior, cierre que no quede abierta, y sentido de flujo sucio → limpio.',
      legal: 'RTCA 67.01.33:06 — protección contra plagas e ingreso controlado.',
    },
    {
      id: 'zonas',
      title: 'Marcar zona sucia, húmeda y limpia en el piso',
      body: 'Cinta o pintura de piso basta en 22 m². Recepción del acopio no puede mezclarse con envasado.',
      legal: 'BPM / ficha de inspección de alimentos procesados del Ministerio de Salud.',
    },
    {
      id: 'quimicos',
      title: 'Nicho de químicos y utensilios de limpieza',
      body: 'Detergente, cloro y escobas fuera de la línea de alimento, preferible junto al lavamanos de servicio, con identificadores.',
      legal: 'RTCA 67.01.33:06 — almacenamiento de sustancias de limpieza.',
    },
    {
      id: 'residuos',
      title: 'Basureros con tapa y ruta de salida por zona sucia',
      body: 'Residuo orgánico y no orgánico salen por la puerta de servicio, nunca cruzando el envasado.',
      legal: 'RTCA 67.01.33:06 — manejo de desechos.',
    },
  ],
  'pt-BR': [
    {
      id: 'piso-pendiente',
      urgent: true,
      title: 'Piso com caimento, não plano',
      body: 'O galpão de 22 m² não pode ficar nivelado. Deixar caimento de 1 a 2% rumo aos ralos (1–2 cm por metro) para a água de lavagem não empoçar nem correr para a zona limpa.',
      legal: 'RTCA 67.01.33:06 §5.3.2 e §5.4.1 — drenagem adequada nos pisos de processo.',
    },
    {
      id: 'dos-desagues',
      urgent: true,
      title: 'Dois ralos de piso com grelha antipragas',
      body: 'Um na zona úmida/suja (lavagem e cocção) e outro perto do lavatório de serviço. Grelha que impeça roedores. Sifão. Evitar ralo na zona mais limpa de envase.',
      legal: 'RTCA 67.01.33:06 §5.4.1 — esgoto e resíduos sem contaminar o alimento.',
    },
    {
      id: 'lavamanos-frente',
      urgent: true,
      title: 'Segundo lavatório na porta da frente',
      body: 'O croqui só coloca uma pia na parede de trás. É preciso outra na entrada de pessoas: entra, lava as mãos e só então segue ao processo. Torneira sem contato da mão suja e papel toalha.',
      legal: 'RTCA 67.01.33:06 — instalações sanitárias e lavagem de mãos.',
    },
    {
      id: 'seis-luces',
      urgent: true,
      title: 'Seis luminárias estanques, não duas lâmpadas',
      body: 'Duas lâmpadas não bastam nem se limpam bem. Colocar 6 luminárias com cobertura (IP65 ou similar), em duas filas de três. Evitar vidro exposto sobre o alimento.',
      legal: 'RTCA 67.01.33:06 — iluminação suficiente, protegida e lavável.',
    },
    {
      id: 'conduit-solar',
      urgent: true,
      title: 'Eletroduto até o telhado para painéis solares',
      body: 'Deixar conduit do quadro até a cobertura agora, antes de fechar o forro. Reserva para medidor de geração e ligação ICE. Não romper o telhado depois.',
      legal: 'ICE / regulamentação de geração distribuída — profissional elétrico responsável.',
    },
    {
      id: 'lavamanos-atras',
      title: 'Lavatório da parede de trás',
      body: 'Manter a pia do croqui na zona úmida, com água potável, sabão e dreno para pré-tratamento.',
      legal: 'Lei Geral de Saúde n.º 5395 e RTCA 67.01.33:06.',
    },
    {
      id: 'trampas',
      title: 'Caixa de gordura e de sólidos',
      body: 'Cocção e lavagem geram gordura e polpa. Instalar caixa de gordura e cesto de sólidos antes da descarga.',
      legal: 'Decreto 33601-S-MINAE — vertido e reúso de águas residuais.',
    },
    {
      id: 'tablero-ice',
      title: 'Quadro elétrico acessível e longe da água',
      body: 'Quadro em zona seca, com aterramento, disjuntores para processo, luz, bombas e reserva solar.',
      legal: 'Código Elétrico da Costa Rica e requisitos ICE.',
    },
    {
      id: 'agua-potable',
      title: 'Água potável sem ligação cruzada',
      body: 'Ponto de água para processo e lavatórios. Água não potável, se houver, identificada e sem refluxo.',
      legal: 'RTCA 67.01.33:06 §5.3 — abastecimento e prevenção de refluxo.',
    },
    {
      id: 'muros-piso-techo',
      title: 'Superfícies lisas, laváveis e sem frestas',
      body: 'Piso contínuo sanitizável. Paredes laváveis até pelo menos 1,80 m. Forro que não solte partículas.',
      legal: 'RTCA 67.01.33:06 — desenho e construção do estabelecimento.',
    },
    {
      id: 'ventana-malla',
      title: 'Janela com tela contra insetos',
      body: 'A janela lateral deve ventilar com tela fixa. Sem vão direto para o centro de acopio.',
      legal: 'RTCA 67.01.33:06 — controle de pragas nas aberturas.',
    },
    {
      id: 'puertas',
      title: 'Portas com vedação inferior e fecho',
      body: 'Porta da frente (pessoas) e de trás (serviço/matéria-prima). Fluxo sujo → limpo.',
      legal: 'RTCA 67.01.33:06 — proteção contra pragas.',
    },
    {
      id: 'zonas',
      title: 'Marcar zona suja, úmida e limpa no piso',
      body: 'Fita ou pintura no piso já serve em 22 m². Recepção do acopio não se mistura com envase.',
      legal: 'BPF / ficha de inspeção de alimentos processados do Ministério da Saúde.',
    },
    {
      id: 'quimicos',
      title: 'Nicho de químicos e limpeza',
      body: 'Detergente e cloro fora da linha de alimento, junto ao lavatório de serviço.',
      legal: 'RTCA 67.01.33:06 — armazenamento de produtos de limpeza.',
    },
    {
      id: 'residuos',
      title: 'Lixeiras com tampa e saída pela zona suja',
      body: 'Resíduo sai pela porta de serviço, nunca cruzando o envase.',
      legal: 'RTCA 67.01.33:06 — manejo de resíduos.',
    },
  ],
  en: [
    {
      id: 'piso-pendiente',
      urgent: true,
      title: 'Sloped floor, not flat',
      body: 'The 22 m² shed cannot stay level. Leave a 1–2% slope toward the drains so wash water does not pond or run into the clean zone.',
      legal: 'RTCA 67.01.33:06 §5.3.2 and §5.4.1 — adequate floor drainage in process areas.',
    },
    {
      id: 'dos-desagues',
      urgent: true,
      title: 'Two floor drains with pest screens',
      body: 'One in the wet/dirty zone (wash and cook) and one near the service sink. Rodent-proof grate and trap. Avoid a drain in the clean packing zone if possible.',
      legal: 'RTCA 67.01.33:06 §5.4.1 — wastewater must not contaminate food.',
    },
    {
      id: 'lavamanos-frente',
      urgent: true,
      title: 'Second handwash at the front door',
      body: 'The sketch only shows a sink on the back wall. People need another at the staff entrance: enter, wash hands, then process. Hands-free tap and paper towels.',
      legal: 'RTCA 67.01.33:06 — sanitary facilities and handwashing on entry.',
    },
    {
      id: 'seis-luces',
      urgent: true,
      title: 'Six covered fixtures, not two bulbs',
      body: 'Two bulbs are not enough and are hard to clean. Fit 6 covered luminaires (IP65 or similar) in two rows of three. No exposed glass over food.',
      legal: 'RTCA 67.01.33:06 — sufficient, protected, cleanable lighting.',
    },
    {
      id: 'conduit-solar',
      urgent: true,
      title: 'Conduit to the roof for solar panels',
      body: 'Run conduit from the panel to the roof now, before ceilings close. Leave space for a generation meter and the ICE connection.',
      legal: 'ICE / distributed generation rules — licensed electrical professional.',
    },
    {
      id: 'lavamanos-atras',
      title: 'Back-wall handwash',
      body: 'Keep the sketch sink in the wet zone, with potable water, soap and drain to pretreatment.',
      legal: 'General Health Law No. 5395 and RTCA 67.01.33:06.',
    },
    {
      id: 'trampas',
      title: 'Grease and solids traps',
      body: 'Cooking and washing produce fat and pulp. Install a grease trap and solids basket before discharge.',
      legal: 'Decree 33601-S-MINAE — wastewater discharge and reuse.',
    },
    {
      id: 'tablero-ice',
      title: 'Electrical panel away from water',
      body: 'Dry-zone panel, grounded, with breakers for process, lighting, pumps and solar reserve.',
      legal: 'Costa Rica Electrical Code and ICE service rules.',
    },
    {
      id: 'agua-potable',
      title: 'Potable water with no cross-connection',
      body: 'Process and handwash on potable water. Any non-potable line must be marked and backflow-protected.',
      legal: 'RTCA 67.01.33:06 §5.3 — water supply and backflow prevention.',
    },
    {
      id: 'muros-piso-techo',
      title: 'Smooth, washable, crack-free surfaces',
      body: 'Continuous sanitizable floor. Washable walls to at least 1.80 m. Ceiling that does not shed particles.',
      legal: 'RTCA 67.01.33:06 — establishment design and construction.',
    },
    {
      id: 'ventana-malla',
      title: 'Window with insect screen',
      body: 'The side window can ventilate only with a fixed screen. No open gap toward the collection center.',
      legal: 'RTCA 67.01.33:06 — pest control at openings.',
    },
    {
      id: 'puertas',
      title: 'Doors with sweeps and closers',
      body: 'Front door for people, back door for service/raw material. Dirty → clean flow.',
      legal: 'RTCA 67.01.33:06 — pest protection.',
    },
    {
      id: 'zonas',
      title: 'Mark dirty, wet and clean zones on the floor',
      body: 'Tape or floor paint is enough in 22 m². Receiving from the collection center must not mix with packing.',
      legal: 'GMP / Ministry of Health processed-food inspection sheet.',
    },
    {
      id: 'quimicos',
      title: 'Chemicals and cleaning niche',
      body: 'Detergent and chlorine off the food line, next to the service sink.',
      legal: 'RTCA 67.01.33:06 — cleaning chemical storage.',
    },
    {
      id: 'residuos',
      title: 'Lidded bins exiting through the dirty zone',
      body: 'Waste leaves by the service door, never across packing.',
      legal: 'RTCA 67.01.33:06 — waste handling.',
    },
  ],
};

export function getPlantaChecklist(locale: string) {
  const key = locale === 'pt-BR' || locale === 'en' ? locale : 'es';
  return checklistByLocale[key];
}

export const zonaCopy: LocaleCopy<Record<PlantaZoneId, { title: string; body: string }>> = {
  es: {
    sucia: {
      title: 'Zona sucia · recepción',
      body: 'Lado del centro de acopio: cajas, materia prima y residuos. Entra por la puerta de atrás. No se envasa aquí.',
    },
    humeda: {
      title: 'Zona húmeda · lavar y cocinar',
      body: 'Lavamanos de atrás, triturado, cocción y desagües. Piso con pendiente. Equipo que salpica agua queda en esta franja.',
    },
    limpia: {
      title: 'Zona limpia · envasar',
      body: 'Franja hacia la puerta de frente: deshidratado listo, envasado y producto terminado. Se entra con manos lavadas.',
    },
  },
  'pt-BR': {
    sucia: {
      title: 'Zona suja · recepção',
      body: 'Lado do centro de acopio: caixas, matéria-prima e resíduos. Entra pela porta de trás. Sem envase aqui.',
    },
    humeda: {
      title: 'Zona úmida · lavar e cozinhar',
      body: 'Lavatório de trás, trituração, cocção e ralos. Piso com caimento. Equipamento que respinga fica nesta faixa.',
    },
    limpia: {
      title: 'Zona limpa · envase',
      body: 'Faixa rumo à porta da frente: desidratação pronta, envase e produto acabado. Entra-se com as mãos lavadas.',
    },
  },
  en: {
    sucia: {
      title: 'Dirty zone · receiving',
      body: 'Collection-center side: crates, raw material and waste. Enters by the back door. No packing here.',
    },
    humeda: {
      title: 'Wet zone · wash and cook',
      body: 'Back sink, crush, cook and drains. Sloped floor. Equipment that splashes stays in this strip.',
    },
    limpia: {
      title: 'Clean zone · packing',
      body: 'Strip toward the front door: finished dehydrating, packing and finished goods. Enter with washed hands.',
    },
  },
};

export const plantaPages: LocaleCopy<{
  homeEyebrow: string;
  homeTitle: string;
  homeLead: string;
  homeUrgentTitle: string;
  homeUrgentBody: string;
  homeDisclaimer: string;
  leave: string;
  guest: string;
  obraTitle: string;
  obraLead: string;
  obraProgress: string;
  croquisTitle: string;
  croquisLead: string;
  croquisLegend: string;
  legalTitle: string;
  legalLead: string;
  bpmTitle: string;
  bpmLead: string;
  serviciosTitle: string;
  serviciosLead: string;
  equiposTitle: string;
  equiposLead: string;
  conviteEyebrow: string;
  conviteTitle: string;
  conviteLead: string;
  conviteName: string;
  conviteCode: string;
  conviteCta: string;
  conviteBusy: string;
  conviteError: string;
  conviteHint: string;
}> = {
  es: {
    homeEyebrow: 'Impulsa CR · planta compartida',
    homeTitle: 'Mini-biorrefinería de 22 m², pensada para cumplir la ley costarricense',
    homeLead:
      'Galerón 4,0 × 5,5 m a la par del centro de acopio en Copey de Dota. Guía de adecuación para la cooperativa: obra, zonificación sucio/limpio, trámites y equipos básicos (deshidratadora solar, triturar, cocinar, envasar).',
    homeUrgentTitle: 'Hoy, mientras construyen',
    homeUrgentBody:
      'El piso no puede quedar plano. Hay que dejar pendiente, dos desagües, un segundo lavamanos en la puerta de frente, tubería al techo para paneles y seis luces con cubierta — no los dos bombillos del croquis.',
    homeDisclaimer:
      'Esta guía orienta la obra y los trámites. No sustituye al profesional responsable del CFIA ni a la inspección del Área Rectora de Salud Los Santos.',
    leave: 'Salir de la planta',
    guest: 'Acceso por convite',
    obraTitle: 'Lista de obra',
    obraLead:
      'Lo que hay que dejar en el galerón ahora. Marca cada ítem; el avance se guarda en este navegador.',
    obraProgress: 'Avance',
    croquisTitle: 'Croquis de 22 m²',
    croquisLead:
      'El dibujo de la cooperativa (puerta de frente, ventana al costado, puerta de atrás y lavatorio) más la zonificación sucio / húmedo / limpio y lo que falta en obra.',
    croquisLegend: 'Toca una zona para ver el uso. En amarillo: lo que hay que agregar hoy.',
    legalTitle: 'Trámites en Dota y Salud',
    legalLead:
      'Uso de suelo y patente en la Municipalidad de Dota; Permiso Sanitario de Funcionamiento en el Área Rectora de Salud Los Santos; planos con profesional del CFIA.',
    bpmTitle: 'Buenas prácticas de manufactura',
    bpmLead:
      'Flujo de personas y producto, higiene, registros mínimos y lo que suele pedir la ficha de inspección de alimentos procesados.',
    serviciosTitle: 'Agua, electricidad y residuales',
    serviciosLead:
      'Acometidas, paneles solares, medición de consumo y pretratamiento antes de verter.',
    equiposTitle: 'Equipos y medidores',
    equiposLead:
      'Paquete básico del proyecto: deshidratadora solar, triturar, cocinar, envasar, humedad y consumo.',
    conviteEyebrow: 'Planta compartida',
    conviteTitle: 'Entrá con el código de convite',
    conviteLead:
      'La mini-biorrefinería de Copey no se abre con el login de beneficiarios ni con la intranet. Solo con un código que envía el equipo de Rural Commerce.',
    conviteName: 'Tu nombre',
    conviteCode: 'Código de convite',
    conviteCta: 'Abrir la guía',
    conviteBusy: 'Validando…',
    conviteError: 'Código inválido o inactivo. Pedí uno nuevo al equipo.',
    conviteHint: 'El código llega por WhatsApp o correo. Ejemplo de demostración para la cooperativa: COPEY-22M2.',
  },
  'pt-BR': {
    homeEyebrow: 'Impulsa CR · planta compartilhada',
    homeTitle: 'Mini-biorrefinaria de 22 m², pensada para cumprir a lei da Costa Rica',
    homeLead:
      'Galpão 4,0 × 5,5 m ao lado do centro de acopio em Copey de Dota. Guia de adequação: obra, zonificação sujo/limpo, trâmites e equipamentos básicos.',
    homeUrgentTitle: 'Hoje, enquanto constroem',
    homeUrgentBody:
      'O piso não pode ficar plano. Deixar caimento, dois ralos, um segundo lavatório na porta da frente, eletroduto ao telhado para painéis e seis luzes com cobertura — não as duas lâmpadas do croqui.',
    homeDisclaimer:
      'Este guia orienta a obra e os trâmites. Não substitui o profissional responsável do CFIA nem a inspeção da Área Reitora de Saúde Los Santos.',
    leave: 'Sair da planta',
    guest: 'Acesso por convite',
    obraTitle: 'Lista de obra',
    obraLead: 'O que precisa ficar no galpão agora. Marque cada item; o avanço fica neste navegador.',
    obraProgress: 'Progresso',
    croquisTitle: 'Croqui de 22 m²',
    croquisLead:
      'O desenho da cooperativa (porta da frente, janela lateral, porta de trás e pia) mais a zonificação sujo / úmido / limpo.',
    croquisLegend: 'Toque uma zona para ver o uso. Em amarelo: o que falta na obra de hoje.',
    legalTitle: 'Trâmites em Dota e Saúde',
    legalLead:
      'Uso do solo e patente na Municipalidade de Dota; Permiso Sanitario de Funcionamiento na Área Reitora de Saúde Los Santos; plantas com profissional do CFIA.',
    bpmTitle: 'Boas práticas de fabricação',
    bpmLead: 'Fluxo de pessoas e produto, higiene, registros mínimos e a ficha de inspeção de alimentos processados.',
    serviciosTitle: 'Água, eletricidade e efluentes',
    serviciosLead: 'Ligações, painéis solares, medição de consumo e pré-tratamento antes do descarte.',
    equiposTitle: 'Equipamentos e medidores',
    equiposLead: 'Pacote básico: desidratadora solar, triturar, cozinhar, envasar, umidade e consumo.',
    conviteEyebrow: 'Planta compartilhada',
    conviteTitle: 'Entre com o código de convite',
    conviteLead:
      'A mini-biorrefinaria de Copey não abre com o login de beneficiários nem com a intranet. Só com um código enviado pela equipe Rural Commerce.',
    conviteName: 'Seu nome',
    conviteCode: 'Código de convite',
    conviteCta: 'Abrir o guia',
    conviteBusy: 'Validando…',
    conviteError: 'Código inválido ou inativo. Peça um novo à equipe.',
    conviteHint: 'O código chega por WhatsApp ou e-mail. Demonstração para a cooperativa: COPEY-22M2.',
  },
  en: {
    homeEyebrow: 'Impulsa CR · shared plant',
    homeTitle: 'A 22 m² mini-biorefinery designed to meet Costa Rican law',
    homeLead:
      '4.0 × 5.5 m shed beside the collection center in Copey de Dota. Fit-out guide: works, dirty/clean zoning, permits and basic equipment.',
    homeUrgentTitle: 'Today, while they are building',
    homeUrgentBody:
      'The floor cannot stay flat. Leave slope, two drains, a second handwash at the front door, roof conduit for solar, and six covered lights — not the two bulbs on the sketch.',
    homeDisclaimer:
      'This guide supports construction and permits. It does not replace the CFIA professional of record or the Los Santos Health Area inspection.',
    leave: 'Leave the plant',
    guest: 'Invite access',
    obraTitle: 'Works list',
    obraLead: 'What must go into the shed now. Check each item; progress stays in this browser.',
    obraProgress: 'Progress',
    croquisTitle: '22 m² sketch',
    croquisLead:
      'The cooperative drawing (front door, side window, back door and sink) plus dirty / wet / clean zoning.',
    croquisLegend: 'Tap a zone to see its use. Yellow: what must be added today.',
    legalTitle: 'Dota and Health permits',
    legalLead:
      'Land use and business license at the Municipality of Dota; operating sanitary permit at the Los Santos Health Area; drawings with a CFIA professional.',
    bpmTitle: 'Good manufacturing practices',
    bpmLead: 'People and product flow, hygiene, minimum records and the processed-food inspection sheet.',
    serviciosTitle: 'Water, power and wastewater',
    serviciosLead: 'Service connections, solar panels, metering and pretreatment before discharge.',
    equiposTitle: 'Equipment and meters',
    equiposLead: 'Basic package: solar dehydrator, crush, cook, pack, humidity and consumption meters.',
    conviteEyebrow: 'Shared plant',
    conviteTitle: 'Enter with an invite code',
    conviteLead:
      'The Copey mini-biorefinery does not open with beneficiary login or the intranet. Only with a code sent by the Rural Commerce team.',
    conviteName: 'Your name',
    conviteCode: 'Invite code',
    conviteCta: 'Open the guide',
    conviteBusy: 'Checking…',
    conviteError: 'Invalid or inactive code. Ask the team for a new one.',
    conviteHint: 'The code arrives by WhatsApp or email. Cooperative demo: COPEY-22M2.',
  },
};

export function getPlantaPageCopy(locale: string) {
  const key = locale === 'pt-BR' || locale === 'en' ? locale : 'es';
  return plantaPages[key];
}

export const legalCards: LocaleCopy<
  Array<{ office: string; what: string; how: string; refs: string }>
> = {
  es: [
    {
      office: 'Municipalidad de Dota',
      what: 'Uso de suelo, permiso de construcción (si aplica a la obra nueva) y patente municipal para operar.',
      how: 'Confirmar que el galerón junto al centro de acopio admite industria alimentaria de bajo escala. El permiso de construcción se pide por APC-M con profesional del CFIA.',
      refs: 'Reglamento municipal de Dota · APC-M (CFIA) · patente comercial.',
    },
    {
      office: 'Área Rectora de Salud Los Santos · Ministerio de Salud',
      what: 'Permiso Sanitario de Funcionamiento (PSF) antes de operar.',
      how: 'Clasificar la actividad (grupo de riesgo A/B/C del Decreto 43432-S). Llevar planos, declaración jurada, pago y condiciones previas del art. 8. La inspección usa la ficha BPM de alimentos procesados.',
      refs: 'Ley General de Salud N.º 5395 · Decreto 43432-S · ficha BPM alimentos.',
    },
    {
      office: 'CFIA · profesional responsable',
      what: 'Planos, sello profesional y responsabilidad de ingeniería/arquitectura.',
      how: 'Aunque el galerón es de 22 m², obra nueva o cambio de uso entra por APC. Incluir desagües, pendiente, tablero, conduit solar y sistema de residuales en el plano — no “se resuelve después”.',
      refs: 'Ley Orgánica del CFIA · Decreto 36550 (revisión de planos) · APC.',
    },
    {
      office: 'ICE y ASADA / AyA',
      what: 'Servicio eléctrico, generación solar y agua potable.',
      how: 'Solicitar carga real (proceso + iluminación + bombas + solar). Medidor de consumo y, si hay paneles, medidor de generación. Agua de red potable o potabilización con registro de cloro.',
      refs: 'ICE servicio y generación distribuida · disponibilidad de agua AyA/ASADA.',
    },
    {
      office: 'Residuales y ambiente',
      what: 'No verter grasa ni sólidos de proceso sin pretratamiento.',
      how: 'Trampa de grasas, canastilla y, si no hay alcantarillado, tanque o sistema según el profesional. SETENA solo si el profesional indica que el D1 aplica; 22 m² no exime automáticamente.',
      refs: 'Decreto 33601-S-MINAE · SETENA según caso.',
    },
  ],
  'pt-BR': [
    {
      office: 'Municipalidad de Dota',
      what: 'Uso do solo, alvará de construção (se a obra nova exigir) e patente municipal.',
      how: 'Confirmar que o galpão junto ao centro de acopio admite indústria alimentar de pequeno porte. O alvará entra por APC-M com profissional do CFIA.',
      refs: 'Regulamento municipal de Dota · APC-M (CFIA) · patente comercial.',
    },
    {
      office: 'Área Reitora de Saúde Los Santos · Ministério da Saúde',
      what: 'Permiso Sanitario de Funcionamiento (PSF) antes de operar.',
      how: 'Classificar a atividade (risco A/B/C do Decreto 43432-S). Levar plantas, declaração jurada, pagamento e condições prévias do art. 8.',
      refs: 'Lei Geral de Saúde n.º 5395 · Decreto 43432-S · ficha BPF alimentos.',
    },
    {
      office: 'CFIA · profissional responsável',
      what: 'Plantas, selo profissional e responsabilidade de engenharia/arquitetura.',
      how: 'Obra nova ou mudança de uso entra no APC. Incluir ralos, caimento, quadro, eletroduto solar e efluentes no desenho.',
      refs: 'Lei Orgânica do CFIA · Decreto 36550 · APC.',
    },
    {
      office: 'ICE e ASADA / AyA',
      what: 'Energia, geração solar e água potável.',
      how: 'Pedir carga real. Medidor de consumo e, se houver painéis, medidor de geração. Água potável com registro de cloro se for tratada no sítio.',
      refs: 'ICE serviço e geração distribuída · disponibilidade de água.',
    },
    {
      office: 'Efluentes e ambiente',
      what: 'Não despejar gordura nem sólidos de processo sem pré-tratamento.',
      how: 'Caixa de gordura e cesto. SETENA só se o profissional indicar D1; 22 m² não isenta automaticamente.',
      refs: 'Decreto 33601-S-MINAE · SETENA conforme o caso.',
    },
  ],
  en: [
    {
      office: 'Municipality of Dota',
      what: 'Land use, building permit (if the new works require it) and municipal business license.',
      how: 'Confirm the shed beside the collection center may host small-scale food industry. Building permits go through APC-M with a CFIA professional.',
      refs: 'Dota municipal rules · APC-M (CFIA) · business license.',
    },
    {
      office: 'Los Santos Health Area · Ministry of Health',
      what: 'Operating sanitary permit (PSF) before starting operations.',
      how: 'Classify the activity (risk group A/B/C under Decree 43432-S). Submit drawings, sworn statement, fee and Article 8 preconditions.',
      refs: 'General Health Law No. 5395 · Decree 43432-S · processed-food GMP sheet.',
    },
    {
      office: 'CFIA · professional of record',
      what: 'Drawings, professional seal and engineering/architecture liability.',
      how: 'New works or change of use go through APC. Put drains, slope, panel, solar conduit and wastewater on the drawing now.',
      refs: 'CFIA Organic Law · Decree 36550 · APC.',
    },
    {
      office: 'ICE and ASADA / AyA',
      what: 'Electrical service, solar generation and potable water.',
      how: 'Request real load. Consumption meter and, if there are panels, a generation meter. Potable water with chlorine records if treated on site.',
      refs: 'ICE service and distributed generation · water availability.',
    },
    {
      office: 'Wastewater and environment',
      what: 'Do not discharge process fat or solids without pretreatment.',
      how: 'Grease trap and solids basket. SETENA only if the professional says a D1 applies; 22 m² is not an automatic waiver.',
      refs: 'Decree 33601-S-MINAE · SETENA case by case.',
    },
  ],
};

export const bpmCards: LocaleCopy<Array<{ title: string; body: string }>> = {
  es: [
    {
      title: 'Flujo de personas',
      body: 'Entran por la puerta de frente → lavamanos → zona limpia o húmeda. No cruzar de sucio a envasado con el mismo delantal ni las mismas botas sin lavar.',
    },
    {
      title: 'Flujo de producto',
      body: 'Acopio → recepción sucia → lavado/triturado/cocción (húmedo) → deshidratado → envasado (limpio) → salida. Nunca el camino inverso en la misma bandeja.',
    },
    {
      title: 'Higiene de manos y ropa',
      body: 'Jabón, uñas cortas, redecilla, delantal lavable. Un lavamanos no alcanza: el de atrás es de proceso; el de frente es de ingreso.',
    },
    {
      title: 'Registros mínimos',
      body: 'Limpieza diaria, temperatura/tiempo de cocción, humedad del producto, cloro del agua (si se dosifica), recepción de materia prima y limpieza de trampas.',
    },
    {
      title: 'Plagas',
      body: 'Mallas, burletes, no alimento en el piso, no agua estancada. El desagüe sin rejilla es la vía más rápida de roedores desde el acopio.',
    },
    {
      title: 'Inspección',
      body: 'La ficha BPM de alimentos y bebidas procesados del Ministerio de Salud suele pedir 81 puntos o más. Piso, agua, manos, residuales e iluminación pesan más que “tener el equipo comprado”.',
    },
  ],
  'pt-BR': [
    {
      title: 'Fluxo de pessoas',
      body: 'Entram pela porta da frente → lavatório → zona limpa ou úmida. Não cruzar do sujo ao envase com o mesmo avental nem as mesmas botas sem lavar.',
    },
    {
      title: 'Fluxo de produto',
      body: 'Acopio → recepção suja → lavagem/trituração/cocção → desidratação → envase → saída. Nunca o caminho inverso na mesma bandeja.',
    },
    {
      title: 'Higiene de mãos e roupa',
      body: 'Sabão, unhas curtas, touca, avental lavável. A pia de trás é de processo; a da frente é de ingresso.',
    },
    {
      title: 'Registros mínimos',
      body: 'Limpeza diária, temperatura/tempo de cocção, umidade do produto, cloro da água, recepção de matéria-prima e limpeza das caixas.',
    },
    {
      title: 'Pragas',
      body: 'Telas, vedação, alimento fora do piso, sem água parada. Ralo sem grelha é a via mais rápida de roedores desde o acopio.',
    },
    {
      title: 'Inspeção',
      body: 'A ficha BPF de alimentos processados costuma pedir 81 pontos ou mais. Piso, água, mãos, efluentes e luz pesam mais do que “ter o equipamento comprado”.',
    },
  ],
  en: [
    {
      title: 'People flow',
      body: 'Enter at the front door → handwash → clean or wet zone. Do not go from dirty to packing in the same apron or unwashed boots.',
    },
    {
      title: 'Product flow',
      body: 'Collection center → dirty receiving → wash/crush/cook → dehydrate → pack → exit. Never the reverse path on the same tray.',
    },
    {
      title: 'Hand and clothing hygiene',
      body: 'Soap, short nails, hairnet, washable apron. The back sink is for process; the front sink is for entry.',
    },
    {
      title: 'Minimum records',
      body: 'Daily cleaning, cook time/temperature, product moisture, water chlorine if dosed, incoming lots and trap cleaning.',
    },
    {
      title: 'Pests',
      body: 'Screens, door sweeps, no food on the floor, no standing water. An unscreened drain is the fastest rodent path from the collection center.',
    },
    {
      title: 'Inspection',
      body: 'The processed-food GMP sheet often expects 81 points or more. Floor, water, hands, wastewater and lighting weigh more than “equipment already purchased”.',
    },
  ],
};

export const servicioCards: LocaleCopy<Array<{ title: string; body: string }>> = {
  es: [
    {
      title: 'Agua',
      body: 'Punto potable para proceso y lavamanos. Medidor de consumo (chorro o hidrómetro) para el seguimiento del proyecto. Si la fuente es ASADA, pedir constancia de potabilidad.',
    },
    {
      title: 'Electricidad',
      body: 'Tablero con circuitos separados: luces, tomas de proceso, bomba y reserva solar. Tierra física. No alimentar la planta desde un alargue del acopio.',
    },
    {
      title: 'Paneles solares',
      body: 'Estructura de techo verificada por el profesional. Conduit ya dejado en obra. Inversor y medidor de generación aparte del medidor de consumo ICE.',
    },
    {
      title: 'Aguas residuales',
      body: 'Piso → desagües con rejilla → trampa de sólidos → trampa de grasas → descarga autorizada. Nunca al terreno junto al acopio sin tratamiento.',
    },
    {
      title: 'Medidores del proyecto',
      body: 'Agua, electricidad, humedad del producto y, si hay cámara, temperatura. Sirven para el acompañamiento de Impulsa CR, no sustituyen al medidor fiscal ICE.',
    },
  ],
  'pt-BR': [
    {
      title: 'Água',
      body: 'Ponto potável para processo e lavatórios. Medidor de consumo para o acompanhamento do projeto. Se a fonte for ASADA, pedir comprovação de potabilidade.',
    },
    {
      title: 'Eletricidade',
      body: 'Quadro com circuitos separados: luzes, tomadas de processo, bomba e reserva solar. Aterramento. Não alimentar a planta com extensão do acopio.',
    },
    {
      title: 'Painéis solares',
      body: 'Estrutura do telhado verificada pelo profissional. Eletroduto já na obra. Inversor e medidor de geração separados do medidor ICE.',
    },
    {
      title: 'Águas residuais',
      body: 'Piso → ralos com grelha → cesto de sólidos → caixa de gordura → descarga autorizada. Nunca no terreno ao lado do acopio sem tratamento.',
    },
    {
      title: 'Medidores do projeto',
      body: 'Água, eletricidade, umidade do produto e, se houver câmara, temperatura. Servem ao acompanhamento Impulsa CR; não substituem o medidor fiscal ICE.',
    },
  ],
  en: [
    {
      title: 'Water',
      body: 'Potable point for process and sinks. A consumption meter for project follow-up. If the source is an ASADA, request a potability note.',
    },
    {
      title: 'Electricity',
      body: 'Panel with separate circuits: lights, process outlets, pump and solar reserve. Grounding. Do not feed the plant from an extension cord in the collection center.',
    },
    {
      title: 'Solar panels',
      body: 'Roof structure checked by the professional. Conduit already in the works. Inverter and generation meter separate from the ICE billing meter.',
    },
    {
      title: 'Wastewater',
      body: 'Floor → screened drains → solids basket → grease trap → authorized discharge. Never onto the ground beside the collection center untreated.',
    },
    {
      title: 'Project meters',
      body: 'Water, electricity, product humidity and, if there is a chamber, temperature. They support Impulsa CR coaching; they do not replace the ICE fiscal meter.',
    },
  ],
};

export const equipoCards: LocaleCopy<Array<{ title: string; body: string }>> = {
  es: [
    {
      title: 'Deshidratadora solar',
      body: 'Equipo del proyecto. Ubicación: zona limpia o bajo techo con acceso desde húmedo ya lavado. No cargar producto sucio directo del acopio.',
    },
    {
      title: 'Triturar',
      body: 'Molino o cutter básico sobre mesa lavable en zona húmeda, con desagüe a los pies. Protección eléctrica (GFCI/diferencial).',
    },
    {
      title: 'Cocinar',
      body: 'Olla, paila o marmita pequeña. Campana o ventana con malla para vapor. Grasa a la trampa, no al piso.',
    },
    {
      title: 'Envasar',
      body: 'Mesa solo de empacado en zona limpia. Bolsas, selladora y rótulo. No compartir tabla con el triturado.',
    },
    {
      title: 'Humedad y proceso',
      body: 'Higrómetro para el producto deshidratado y, si hay cuarto, sensor de ambiente. Anotar lote y humedad de salida.',
    },
    {
      title: 'Consumo agua / electricidad',
      body: 'Medidores de seguimiento (no fiscales) para el programa: kWh de proceso y litros de lavado. Lectura semanal basta en esta escala.',
    },
  ],
  'pt-BR': [
    {
      title: 'Desidratadora solar',
      body: 'Equipamento do projeto. Zona limpa ou coberta, com acesso desde o úmido já lavado. Não carregar produto sujo direto do acopio.',
    },
    {
      title: 'Triturar',
      body: 'Moinho ou cutter básico sobre mesa lavável na zona úmida, com ralo aos pés. Proteção elétrica residual.',
    },
    {
      title: 'Cozinhar',
      body: 'Panela ou tacho pequeno. Janela com tela para vapor. Gordura para a caixa, não para o piso.',
    },
    {
      title: 'Envasar',
      body: 'Mesa só de envase na zona limpa. Sacos, seladora e rótulo. Não compartilhar tábua com a trituração.',
    },
    {
      title: 'Umidade e processo',
      body: 'Higrômetro para o produto desidratado e, se houver câmara, sensor de ambiente. Anotar lote e umidade de saída.',
    },
    {
      title: 'Consumo água / eletricidade',
      body: 'Medidores de acompanhamento (não fiscais): kWh de processo e litros de lavagem. Leitura semanal basta nesta escala.',
    },
  ],
  en: [
    {
      title: 'Solar dehydrator',
      body: 'Project equipment. Clean zone or under roof, loaded from already-washed wet product. Do not load dirty product straight from the collection center.',
    },
    {
      title: 'Crushing',
      body: 'Basic mill or cutter on a washable wet-zone table, with a drain at the feet. Residual-current protection.',
    },
    {
      title: 'Cooking',
      body: 'Small kettle or pot. Screened window for steam. Fat to the trap, not the floor.',
    },
    {
      title: 'Packing',
      body: 'Packing-only table in the clean zone. Bags, sealer and label. Do not share a board with crushing.',
    },
    {
      title: 'Humidity and process',
      body: 'Hygrometer for the dried product and, if there is a chamber, an ambient sensor. Record lot and outgoing moisture.',
    },
    {
      title: 'Water / electricity use',
      body: 'Follow-up meters (not fiscal): process kWh and wash litres. Weekly readings are enough at this scale.',
    },
  ],
};

export const accessDoorsCopy: LocaleCopy<{
  eyebrow: string;
  title: string;
  lead: string;
  beneficiariosTitle: string;
  beneficiariosBody: string;
  beneficiariosCta: string;
  intranetTitle: string;
  intranetBody: string;
  intranetCta: string;
  plantaTitle: string;
  plantaBody: string;
  plantaCta: string;
}> = {
  es: {
    eyebrow: 'Tres accesos',
    title: 'Beneficiarios, intranet y planta compartida',
    lead: 'La guía de Copey no entra en Mi perfil ni en la intranet. Se abre solo con convite.',
    beneficiariosTitle: 'Beneficiarios',
    beneficiariosBody: 'Mi perfil de las MIPYMEs de Los Santos: inscripción, convenio, diagnóstico y compras.',
    beneficiariosCta: 'Ir a Mi perfil',
    intranetTitle: 'Intranet',
    intranetBody: 'Equipo Rural Commerce: inscripciones, comunicaciones y emisión de códigos de la planta.',
    intranetCta: 'Entrar a la intranet',
    plantaTitle: 'Planta compartida',
    plantaBody: 'Mini-biorrefinería de Copey de Dota. Solo con código de convite (COPEY-22M2 de demostración).',
    plantaCta: 'Entrar con convite',
  },
  'pt-BR': {
    eyebrow: 'Três acessos',
    title: 'Beneficiários, intranet e planta compartilhada',
    lead: 'O guia de Copey não entra em Meu perfil nem na intranet. Abre só com convite.',
    beneficiariosTitle: 'Beneficiários',
    beneficiariosBody: 'Meu perfil das MIPYMEs de Los Santos: inscrição, convênio, diagnóstico e compras.',
    beneficiariosCta: 'Ir a Meu perfil',
    intranetTitle: 'Intranet',
    intranetBody: 'Equipe Rural Commerce: inscrições, comunicações e emissão de códigos da planta.',
    intranetCta: 'Entrar na intranet',
    plantaTitle: 'Planta compartilhada',
    plantaBody: 'Mini-biorrefinaria de Copey de Dota. Só com código de convite (COPEY-22M2 de demonstração).',
    plantaCta: 'Entrar com convite',
  },
  en: {
    eyebrow: 'Three doors',
    title: 'Beneficiaries, intranet and shared plant',
    lead: 'The Copey guide does not open from My profile or the intranet. Invite code only.',
    beneficiariosTitle: 'Beneficiaries',
    beneficiariosBody: 'My profile for Los Santos MSMEs: application, agreement, diagnosis and purchases.',
    beneficiariosCta: 'Go to My profile',
    intranetTitle: 'Intranet',
    intranetBody: 'Rural Commerce team: applications, communications and plant invite codes.',
    intranetCta: 'Enter intranet',
    plantaTitle: 'Shared plant',
    plantaBody: 'Copey de Dota mini-biorefinery. Invite code only (demo: COPEY-22M2).',
    plantaCta: 'Enter with invite',
  },
};
