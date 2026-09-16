export function plantaPath(locale: string, slug = '') {
  return slug ? `/${locale}/planta/${slug}` : `/${locale}/planta`;
}

export const plantBase = '/planta';

export const site = {
  company: "Rural Commerce",
  project: "Impulso MiPyMEs: digitaliza Los Santos",
  projectShort: "Impulsa CR",
  name: "Planta Copey",
  title: "Mini-biorrefinería Copey",
  location: "Copey de Dota, cantón de Dota, San José, Costa Rica",
  neighbor: "Centro de acopio (a la par)",
  area: "22 m²",
  width: "4.0 m",
  depth: "5.5 m",
  region: "Los Santos, Costa Rica",
  disclaimer:
    "Esta guía traduce el croquis de la cooperativa a una planta agroindustrial mínima, alineada con la legislación costarricense vigente. No sustituye planos visados por el CFIA, la inspección del Área Rectora de Salud ni el criterio de un profesional responsable.",
};

export type NavItem = {
  href: string;
  label: string;
  hint?: string;
  urgent?: boolean;
};

export function plantaNavItems(locale: string): NavItem[] {
  return [
    { href: plantaPath(locale), label: "Inicio" },
    { href: plantaPath(locale, "obra"), label: "Obra ahora", hint: "Antes de vaciar piso", urgent: true },
    { href: plantaPath(locale, "croquis"), label: "Croquis" },
    { href: plantaPath(locale, "legal"), label: "Legal" },
    { href: plantaPath(locale, "higiene"), label: "Higiene" },
    { href: plantaPath(locale, "infraestructura"), label: "Agua y energía" },
    { href: plantaPath(locale, "equipos"), label: "Equipos" },
    { href: plantaPath(locale, "monitoreo"), label: "Medición" },
    { href: plantaPath(locale, "ruta"), label: "Ruta" },
  ];
}

export type Status = "urgente" | "antes-de-operar" | "en-obra" | "despues";

export type ChecklistItem = {
  id: string;
  title: string;
  detail: string;
  status: Status;
  norma?: string;
};

export const obraAhora: ChecklistItem[] = [
  {
    id: "obra-piso",
    title: "Piso con pendiente y sin charcos",
    detail:
      "Piso impermeable, lavable y antideslizante. Pendiente de 1,5 % a 2 % hacia los desagües. Uniones piso-pared en media caña (cóncavas). Sin grietas ni dilataciones irregulares. En área de proceso no usar madera.",
    status: "urgente",
    norma: "RTCA 67.01.33:06, 5.2.1 y 5.2.2",
  },
  {
    id: "obra-drenajes",
    title: "Dos desagües de piso con trampa antiroedor",
    detail:
      "Uno en la zona húmeda (lavado, pared de atrás) y otro en elaboración/cocción. Rejilla que impida el paso de roedores. Salida hacia trampa de grasas fuera de la planta, nunca directo a quebrada ni a tanque séptico sin pretratamiento.",
    status: "urgente",
    norma: "RTCA 67.01.33:06, 5.3.2 y 5.4.1 · Decreto 33601-MINAE-S",
  },
  {
    id: "obra-lavamanos",
    title: "Segundo lavamanos en la puerta de frente",
    detail:
      "El lavatorio de la pared de atrás sirve para lavar materia prima y utensilios. El RTCA exige, además, un lavamanos de personal en la entrada de quienes procesan, no accionado con la mano (pedal, rodilla o sensor), con agua potable, jabón desinfectante, toalla de papel y rótulo.",
    status: "urgente",
    norma: "RTCA 67.01.33:06, 5.4.3",
  },
  {
    id: "obra-puntos-agua",
    title: "Puntos de agua y tanque ahora, no después",
    detail:
      "Dejar: 1) lavamanos de ingreso, 2) pila de proceso de acero inoxidable (ideal dos senos) en la pared de atrás, 3) toma de manguera exterior para patio y deshidratadora, 4) tubería al tanque de reserva (500–1 000 L) con medidor. Agua de limpieza también debe ser potable. Evitar conexiones cruzadas con agua no potable.",
    status: "urgente",
    norma: "RTCA 67.01.33:06, 5.3.1 · Decreto 38924-S",
  },
  {
    id: "obra-luz",
    title: "No bastan dos bombillos",
    detail:
      "El croquis marca 2 lámparas. Para elaboración se piden mínimo 220 lux y 540 lux en la mesa de inspección/envasado. Instalar 6 luminarias LED 4 000 K con cubiertas antifragmento, empotradas o en canaleta sanitaria. Cables en tubería, nunca colgando sobre el alimento.",
    status: "urgente",
    norma: "RTCA 67.01.33:06, 5.2.6 · Código Eléctrico de Costa Rica",
  },
  {
    id: "obra-electrico",
    title: "Tubería eléctrica, tablero y reserva solar",
    detail:
      "Dejar conduit al techo para paneles, tablero con espacio para medidor de consumo, protección diferencial en zona húmeda, tomas dedicadas para triturador y cocina, y extractor. Toda instalación debe cumplir el Código Eléctrico (RTCR 458-2011) y, para solar, planos visados CFIA.",
    status: "urgente",
    norma: "Decreto 36979-MEIC · Ley 10086 · CFIA",
  },
  {
    id: "obra-paredes",
    title: "Paredes claras, lavables, hasta 1,5 m como mínimo",
    detail:
      "Interior liso, no absorbente, color claro. Por humedad de lavado y cocción, recubrimiento lavable (cerámica, paneles sanitarios o pintura epóxica) mínimo 1,5 m. Uniones cóncavas. Sin madera en producción.",
    status: "en-obra",
    norma: "RTCA 67.01.33:06, 5.2.3",
  },
  {
    id: "obra-puertas",
    title: "Puertas y ventana a prueba de plagas",
    detail:
      "Puertas lisas, no absorbentes, que abran hacia afuera y ajusten al marco, con burlete o cortina. Ventana fácil de limpiar, quicio con declive (no se usa como repisa), malla contra insectos desmontable. Las dos puertas ayudan al flujo sucio/limpio si se usan bien.",
    status: "en-obra",
    norma: "RTCA 67.01.33:06, 5.2.5",
  },
  {
    id: "obra-techo",
    title: "Cielo liso y extracción de vapor",
    detail:
      "Techo o cielo falso liso, fácil de limpiar, que no acumule polvo ni gotee condensación sobre el alimento. En cocción dejar ducto para extractor hacia el exterior, con malla. El aire no debe ir de zona sucia a zona limpia.",
    status: "en-obra",
    norma: "RTCA 67.01.33:06, 5.2.4 y 5.2.7",
  },
  {
    id: "obra-espacio",
    title: "50 cm libres entre equipo y pared",
    detail:
      "El local es de 22 m². Reservar pasillos de al menos 50 cm alrededor de cada máquina para limpiar. La deshidratadora solar no cabe adentro: va en patio o costado, con piso firme y techo translúcido o exposición al sol.",
    status: "en-obra",
    norma: "RTCA 67.01.33:06, 5.2.1.f",
  },
];

export const legalItems: {
  id: string;
  ente: string;
  tramite: string;
  paraQue: string;
  donde: string;
  nota: string;
  momento: string;
}[] = [
  {
    id: "uso-suelo",
    ente: "Municipalidad de Dota",
    tramite: "Uso de suelo",
    paraQue: "Confirmar que una planta agroindustrial cabe en esa finca, junto al centro de acopio.",
    donde: "Dirección de Planificación Urbana, Santa María de Dota. Tel. 2541-2717.",
    nota: "Es el primer papel. Sin uso de suelo no conviene seguir con patente ni con Salud.",
    momento: "Ya, aunque la obra haya arrancado",
  },
  {
    id: "permiso-obra",
    ente: "Municipalidad de Dota",
    tramite: "Permiso de construcción",
    paraQue: "Legalizar los 22 m². En Dota el uso de suelo es requisito previo. Obra menor: croquis firmado por profesional responsable. Obra mayor: planos CFIA + Ministerio de Salud y SETENA si aplica.",
    donde: "Departamento de Construcción, Municipalidad de Dota.",
    nota: "Aunque el módulo sea chico, es una planta de alimentos: conviene tratarlo con profesional responsable y no como un galerón informal.",
    momento: "En paralelo a la obra",
  },
  {
    id: "psf",
    ente: "Ministerio de Salud",
    tramite: "Permiso Sanitario de Funcionamiento (PSF)",
    paraQue: "Operar la planta. Sin PSF no se puede fabricar ni registrar producto.",
    donde: "Área Rectora de Salud Los Santos, costado norte del Parque de San Marcos de Tarrazú. Tel. 2546-6171. Correo: ars.lossantos@misalud.go.cr. Cubre Copey de Dota.",
    nota: "Decreto 43432-S. Cumplir condiciones previas del art. 8 según grupo de riesgo (una planta de alimentos procesados suele caer en riesgo A o B). Microempresa MEIC paga tarifa reducida.",
    momento: "Cuando la planta ya esté adecuada, antes de producir para venta",
  },
  {
    id: "bpm",
    ente: "Ministerio de Salud / COMIECO",
    tramite: "Buenas Prácticas de Manufactura",
    paraQue: "Es la norma de cómo se construye y opera la planta, no un trámite aparte.",
    donde: "Se verifica en la inspección del PSF.",
    nota: "RTCA 67.01.33:06, puesto en vigencia en Costa Rica por el Decreto 33724-COMEX-MEIC-S. Incluye pisos, agua, luz, plagas, personal y flujo.",
    momento: "Diseño y operación permanente",
  },
  {
    id: "registro",
    ente: "Ministerio de Salud",
    tramite: "Registro sanitario de cada producto",
    paraQue: "Vender alimentos procesados en Costa Rica.",
    donde: "Plataforma registrelo.go.cr, con firma digital. Requiere PSF de fabricación vigente y etiqueta según Decreto 37280-S.",
    nota: "Vigencia 5 años. Hay registro simplificado para algunos alimentos de bajo riesgo (Decreto 43291-S).",
    momento: "Después del PSF, antes de comercializar",
  },
  {
    id: "patente",
    ente: "Municipalidad de Dota",
    tramite: "Patente / licencia municipal",
    paraQue: "Ejercer actividad lucrativa en el cantón.",
    donde: "Municipalidad de Dota.",
    nota: "Ley de impuestos municipales de Dota. Suele pedir PSF, estar al día con tributos, y documentos de la cooperativa.",
    momento: "Con el PSF en mano",
  },
  {
    id: "cfia",
    ente: "CFIA",
    tramite: "Planos eléctricos y, si aplica, hidrosanitarios visados",
    paraQue: "Conexión ICE, paneles solares y seguridad de la instalación.",
    donde: "Colegio Federado de Ingenieros y Arquitectos, a través de un profesional inscrito.",
    nota: "El Código Eléctrico de Costa Rica (RTCR 458-2011) exige documentación CFIA para la conexión. El solar no se conecta “por la libre”.",
    momento: "Antes de energizar equipos y paneles",
  },
  {
    id: "ice-solar",
    ente: "ICE",
    tramite: "Generación distribuida (autoconsumo)",
    paraQue: "Instalar paneles e interconectarlos a la red.",
    donde: "Oficina ICE / formularios GD01, GD02, GD03. Ley 10086 y Decreto 43879-MINAE.",
    nota: "Inversor certificado UL 1741 (verificación ICE-LEE), paneles IEC 61215, declaración jurada de ingeniero CFIA, personería de la cooperativa, sin deudas con ICE.",
    momento: "Cuando haya diseño eléctrico y NISE del medidor",
  },
  {
    id: "agua",
    ente: "ASADA local o AyA",
    tramite: "Servicio de agua potable y análisis de calidad",
    paraQue: "Demostrar agua potable suficiente, con reserva si hay cortes.",
    donde: "ASADA de Copey o el operador que abastezca el centro de acopio.",
    nota: "El agua de proceso y de limpieza debe cumplir el Reglamento para la Calidad del Agua Potable (Decreto 38924-S). Llevar registros.",
    momento: "Antes de la inspección de Salud",
  },
  {
    id: "residuales",
    ente: "Ministerio de Salud / MINAE",
    tramite: "Tratamiento de aguas residuales",
    paraQue: "No verter agua de lavado y cocción cruda.",
    donde: "Diseño por profesional; operación a cargo de la cooperativa.",
    nota: "Decreto 33601-MINAE-S: todo generador trata sus residuales. Planta de alimentos = residual especial (grasas, DBO). Trampa de grasas + tanque séptico o sistema existente del acopio, si tiene capacidad y autorización.",
    momento: "En obra civil, no se improvisa después",
  },
  {
    id: "residuos",
    ente: "Municipalidad / MINAE",
    tramite: "Plan de residuos sólidos",
    paraQue: "Cáscaras, empaques y desechos de proceso.",
    donde: "Programa escrito de la planta; recolección municipal o compostaje controlado.",
    nota: "Ley 8839. Basureros con tapa, fuera del proceso. Los subproductos de la biorrefinería (compost, harinas de residuo) también deben tener un destino sanitario.",
    momento: "Antes de operar",
  },
  {
    id: "bomberos",
    ente: "Benemérito Cuerpo de Bomberos / CNE",
    tramite: "Visto bueno de seguridad humana, si lo pide Salud o la Municipalidad",
    paraQue: "Extintor, rutas y, si hay GLP para cocinar, informe técnico de gas.",
    donde: "Según clasificación de riesgo del PSF.",
    nota: "Cocinar con GLP activa requisitos extra del Decreto 43432-S (informe técnico). Una cocina eléctrica evita ese trámite, pero pide más potencia ICE.",
    momento: "Antes del PSF",
  },
  {
    id: "trabajo",
    ente: "CCSS, INS, MTSS",
    tramite: "Aseguramiento de personas que trabajen en la planta",
    paraQue: "Póliza de riesgos del trabajo e inscripción patronal si hay personal.",
    donde: "INS y CCSS. El EBAIS de Copey de Dota no sustituye este trámite.",
    nota: "Aunque sea cooperativa y turnos cortos, si hay trabajadoras o trabajadores hay que asegurarlo.",
    momento: "Antes de contratar o asignar personal permanente",
  },
  {
    id: "meic",
    ente: "MEIC",
    tramite: "Condición de microempresa / PYME",
    paraQue: "Bajar tarifas de PSF y de registro de alimentos.",
    donde: "Registro PYME del MEIC.",
    nota: "Útil y barato. No reemplaza Salud ni municipalidad.",
    momento: "En cuanto exista personería al día",
  },
];

export type Zone = {
  id: string;
  name: string;
  role: string;
  where: string;
  do: string;
  dont: string;
  color: string;
};

export const zones: Zone[] = [
  {
    id: "recepcion",
    name: "Recepción sucia",
    role: "Materia prima entra por la puerta de atrás, desde el centro de acopio.",
    where: "Esquina trasera derecha, junto a la puerta posterior.",
    do: "Canastas plásticas, mesa de acero, no tocar el piso. Flujo de atrás hacia el frente.",
    dont: "No mezclar producto terminado ni empaque limpio aquí.",
    color: "#c45c26",
  },
  {
    id: "lavado",
    name: "Zona húmeda / lavado",
    role: "Lavar fruta, raíz, hoja o grano y utensilios.",
    where: "Pared de atrás, donde ya dibujaron el lavatorio.",
    do: "Pila de acero, agua potable, desagüe al piso, pendiente hacia el drenaje.",
    dont: "Ese lavatorio no sustituye el lavamanos de personal.",
    color: "#009179",
  },
  {
    id: "triturado",
    name: "Trituración",
    role: "Moler o picar materia seca o lavada.",
    where: "Centro-izquierda, con 50 cm libres a la pared.",
    do: "Toma dedicada, equipo de superficie lisa, fácil de desarmar.",
    dont: "No instalar sobre madera ni contra la pared pegado.",
    color: "#6b4f32",
  },
  {
    id: "coccion",
    name: "Cocción",
    role: "Cocinar pastas, extractos o conservas.",
    where: "Centro-derecha, bajo el extractor.",
    do: "Extractor al exterior, piso con desagüe, protección contra vapor.",
    dont: "No cocinar con leña dentro de la planta. GLP exige trámite extra.",
    color: "#9f2d2d",
  },
  {
    id: "envase",
    name: "Envasado e inspección",
    role: "Zona más limpia y seca. 540 lux.",
    where: "Franja delantera, junto a la ventana (luz natural + LED).",
    do: "Mesa de acero, selladora, balanza, medidor de humedad del lote.",
    dont: "No abrir empaques cerca del lavado.",
    color: "#071f5e",
  },
  {
    id: "ingreso",
    name: "Ingreso de personas",
    role: "Barrera higiénica mínima.",
    where: "Puerta de frente: lavamanos de pedal, tapete, gorra y delantal.",
    do: "Rótulo de lavado de manos, basurero de papel, cofia.",
    dont: "No entrar con botas del acopio llenas de lodo.",
    color: "#c4a35a",
  },
];

export const equipos = [
  {
    id: "deshidratadora",
    name: "Deshidratadora solar",
    where: "Exterior, costado o patio. No dentro de los 22 m².",
    spec: "Bandejas de acero o plástico grado alimenticio, malla anti-insecto, techo que deje pasar sol o cubiertas UV, piso firme y desagüe de condensados. Medidor de humedad del producto, no solo del aire.",
  },
  {
    id: "triturador",
    name: "Triturador / molino",
    where: "Zona de trituración, interior.",
    spec: "Superficies de contacto en acero inoxidable. Motor con toma dedicada y protección. Fácil de desarmar para lavar. 50 cm a la pared.",
  },
  {
    id: "cocina",
    name: "Cocción básica",
    where: "Zona de cocción, interior, con extractor.",
    spec: "Olla o marmita de acero. Preferible eléctrica de inducción o resistencia si el servicio ICE lo aguanta; GLP solo con informe técnico. Termómetro de proceso.",
  },
  {
    id: "mesas",
    name: "Mesas y pila de acero",
    where: "Lavado, elaboración y envasado.",
    spec: "Acero inoxidable. Pila de dos senos si el presupuesto alcanza (lavar / enjuagar). Ninguna superficie de madera en contacto con alimento.",
  },
  {
    id: "envasado",
    name: "Envasado",
    where: "Zona limpia delantera.",
    spec: "Selladora de bolsas, balanza gramera calibrable, fecha/lote. Envases nuevos, no reuso de botellas sin proceso validado.",
  },
  {
    id: "solar",
    name: "Paneles solares y medidores",
    where: "Techo, tablero junto a la puerta de frente (zona seca).",
    spec: "Arreglo pequeño (2–3 kWp de arranque) para luces, extractor, selladora y bombas. El triturador y la cocina pueden seguir en la red. Medidor bidireccional lo define el ICE.",
  },
];

export const meters = [
  {
    id: "agua",
    name: "Medidor de agua",
    para: "Llevar litros por lote y por mes. Salud y la cooperativa necesitan ver consumo.",
    donde: "Entrada del tanque de reserva, después de la acometida.",
    meta: "Anotar m³ al abrir y al cerrar cada jornada.",
  },
  {
    id: "energia",
    name: "Medidor de electricidad",
    para: "Separar el consumo de la miniplanta del centro de acopio.",
    donde: "Tablero de la planta, además del medidor ICE.",
    meta: "kWh diarios. Con solar, también kWh generados.",
  },
  {
    id: "humedad-producto",
    name: "Medidor de humedad del producto",
    para: "La deshidratadora no sirve si el lote queda húmedo y se enmohece.",
    donde: "Mesa de envasado, cada lote.",
    meta: "Para secos estables, apuntar a actividad de agua baja (en práctica, humedad según ficha del producto; muchos deshidratados de fruta quedan en 10–20 % y se validan con vida útil).",
  },
  {
    id: "humedad-aire",
    name: "Higrómetro de sala",
    para: "Evitar condensación y mohos en techo y empaque.",
    donde: "Zona de envasado.",
    meta: "Vigilar picos al cocinar. El extractor debe bajar vapor.",
  },
  {
    id: "lux",
    name: "Verificación de lux (una sola vez y al cambiar lámparas)",
    para: "Demostrar 220 lux en elaboración y 540 lux en inspección.",
    donde: "Mesa de trabajo, a la altura de la tarea.",
    meta: "Se puede pedir prestado un luxómetro o contratar la medición.",
  },
  {
    id: "temp",
    name: "Termómetro de proceso y de agua",
    para: "Cocción segura y agua caliente de limpieza.",
    donde: "Olla y punto de agua.",
    meta: "Registrar temperatura de cocción por lote.",
  },
];

export const processSteps = [
  { n: "01", title: "Recibir", text: "Desde el centro de acopio, por la puerta de atrás. Canastas, no piso." },
  { n: "02", title: "Lavar", text: "Pila de atrás, agua potable, desagüe al piso." },
  { n: "03", title: "Deshidratar", text: "Sale al sol, en la deshidratadora exterior." },
  { n: "04", title: "Triturar", text: "Molino interior, lote seco o según receta." },
  { n: "05", title: "Cocinar", text: "Solo si el producto lo pide. Extractor encendido." },
  { n: "06", title: "Envasar", text: "Frente, zona seca. Lote, fecha, humedad." },
  { n: "07", title: "Guardar", text: "Producto terminado en estante o en el acopio, separado de la materia prima." },
];

export const higieneProgramas = [
  {
    title: "Agua potable",
    body: "Solo agua potable en proceso y limpieza. Reserva en tanque. Si hay duda, análisis de laboratorio (coliformes). No hay conexión cruzada con mangueras de riego o de lavado de patio.",
  },
  {
    title: "Limpieza y desinfección",
    body: "Programa escrito: qué se lava, con qué, cada cuánto. Pisos y paredes todos los días de proceso. Equipo después de cada lote. Químicos rotulados y guardados fuera del alimento.",
  },
  {
    title: "Plagas",
    body: "Mallas, burletes, no comida en el piso, basura tapada. Mapa de estaciones de cebo solo en exterior. Programa escrito (identificación, productos, hojas de seguridad).",
  },
  {
    title: "Personal",
    body: "Manos al entrar, cofia, delantal limpio, uñas cortas, no joyas, no enfermos en la línea. Sanitarios: no están en los 22 m²; se usan los del centro de acopio si no abren al proceso y se mantienen con jabón, papel y toalla.",
  },
  {
    title: "Flujo sucio / limpio",
    body: "Atrás entra materia prima. Frente sale producto. Nadie cruza una canasta sucia por la mesa de envasado. El aire del extractor no sopla sucio hacia el empaque.",
  },
  {
    title: "Trazabilidad",
    body: "Cada lote: fecha, materia prima, humedad, quien procesó, cantidad envasada. Es lo mínimo para Salud y para la cooperativa.",
  },
];

export const ruta = [
  {
    fase: "Esta semana",
    items: [
      "Congelar en obra: desagües, pendiente, puntos de agua, conduit eléctrico y de solar, extractor.",
      "Hablar con el maestro de obras con la lista de esta guía.",
      "Pedir uso de suelo en la Municipalidad de Dota.",
      "Confirmar de dónde sale el agua (ASADA/AyA) y a dónde va el desagüe del acopio.",
    ],
  },
  {
    fase: "Durante la construcción",
    items: [
      "Acabados sanitarios: piso, media caña, paredes lavables, mallas, puertas lisas.",
      "Contratar ingeniero eléctrico CFIA para tablero, cargas y paneles.",
      "Diseñar trampa de grasas y tanque o empalme al sistema existente.",
      "Definir si la cocina es eléctrica o GLP (cambia trámites y potencia).",
    ],
  },
  {
    fase: "Adecuación y equipos",
    items: [
      "Instalar pila, lavamanos de pedal, 6 LED con cubiertas, extractor, tanque y medidores.",
      "Colocar deshidratadora solar afuera, con malla y piso firme.",
      "Redactar BPM básicas: limpieza, plagas, personal, agua, lotes.",
      "Inscribir PYME en MEIC si aplica.",
    ],
  },
  {
    fase: "Permisos para vender",
    items: [
      "PSF en Área Rectora de Salud Los Santos.",
      "Patente municipal en Dota.",
      "Registro de cada producto en registrelo.go.cr.",
      "Si hay paneles: expediente ICE de generación distribuida.",
    ],
  },
];

export const contactos = [
  {
    name: "Área Rectora de Salud Los Santos",
    detail: "San Marcos de Tarrazú, costado norte del parque. 2546-6171 · ars.lossantos@misalud.go.cr",
  },
  {
    name: "Municipalidad de Dota",
    detail: "Uso de suelo y construcción. Planificación Urbana 2541-2717.",
  },
  {
    name: "EBAIS Copey de Dota",
    detail: "2103-0880. Atención de salud de las personas, no sustituye el PSF.",
  },
  {
    name: "ICE generación distribuida",
    detail: "Formularios GD01/GD02/GD03 · Laboratorio ICE-LEE 2000-4129.",
  },
];
