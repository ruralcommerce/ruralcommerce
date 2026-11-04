import type { MnsFichaDef } from './types';

/** Contenido pedagógico del Mapa de Negocio (4 fichas / 4 dinámicas). */
export const MNS_COURSE = {
  name: 'Modelos de Negocios Sostenibles Internacionales',
  shortName: 'MNS Internacional',
  edition: 'Edición reducida · 4 horas',
  market: 'Mercado de referencia: Estados Unidos · enfoque B2B',
  mapNote:
    'Las cuatro fichas forman un mismo Mapa de Negocio. Trabaja siempre el mismo producto y la misma oportunidad.',
};

export const MNS_FICHAS: MnsFichaDef[] = [
  {
    id: 'ficha1',
    number: 1,
    title: 'Mi propuesta internacional',
    subtitle: 'Dinámica 1 · Una propuesta que otro pueda entender',
    day: 1,
    durationMin: 25,
    consigna:
      'Trabaja con un producto de tu negocio y una empresa que podría comprarlo. No tienes que demostrar que ya exportas. Escribe qué ofreces, para quién y qué puedes respaldar. Si no lo sabes todavía, márcalo como pendiente.',
    proposito:
      'Formular una propuesta B2B clara: producto, comprador, beneficio y evidencia (o pendiente).',
    tipRevision:
      'En pareja: explica 2 minutos; tu compañero dice qué entendió y qué afirmación necesita evidencia. Luego corrige sin borrar el recorrido.',
    steps: [
      {
        id: 'f1-contexto',
        title: 'Producto y comprador',
        intro: 'Identifica qué está confirmado, qué es hipótesis y qué queda pendiente.',
        fields: [
          {
            id: 'producto',
            label: 'Producto, presentación y país de origen',
            kind: 'tagged-text',
            required: true,
            placeholder: 'Ej.: mermelada de mora en frasco de 250 g, Costa Rica',
            help: {
              paraQue:
                'Anclar el Mapa de Negocio a un producto concreto. Las cuatro fichas deben hablar del mismo producto.',
              como: 'Nombra el producto, cómo se presenta (envase, formato) y de dónde sale. Marca si está confirmado, es hipótesis o queda pendiente.',
              ejemplo:
                'Rosa: mermeladas de mora en frasco de vidrio, elaboradas en Costa Rica. Todavía no confirma capacidad exportable adicional.',
            },
          },
          {
            id: 'comprador',
            label: 'Tipo de comprador',
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
              paraQue: 'Una propuesta B2B se dirige a una empresa, no a un consumidor final genérico.',
              como: 'Elige el tipo de empresa. Luego podrás precisar el uso previsto.',
              ejemplo: 'Distribuidora specialty en EE. UU. para reventa a tiendas.',
            },
          },
          {
            id: 'usoComprador',
            label: 'Uso previsto del comprador',
            kind: 'tagged-text',
            required: true,
            placeholder: 'Ej.: reventa a tiendas specialty · pedido aún no confirmado',
            help: {
              paraQue: 'Aclarar para qué usaría tu producto y si ya hay pedido.',
              como: 'Describe el uso y marca confirmado / hipótesis / pendiente.',
              ejemplo:
                'Una distribuidora desea evaluar las mermeladas. Solicita ficha técnica, cantidad, plazo, precio, pago y documentos. Todavía no ha confirmado un pedido.',
            },
          },
          {
            id: 'beneficio',
            label: 'Beneficio que se propone',
            kind: 'tagged-text',
            required: true,
            help: {
              paraQue: 'El comprador necesita entender qué gana o resuelve con tu oferta.',
              como: 'Escribe un beneficio concreto y verificable. Evita promesas sin base.',
              ejemplo:
                'Ofrecer un producto con origen identificable y presentación lista para evaluación comercial, sin afirmar aún volúmenes exportables.',
            },
          },
          {
            id: 'diferenciacion',
            label: 'Diferenciación y evidencia disponible',
            kind: 'tagged-text',
            help: {
              paraQue: 'Separar lo que te distingue de lo que puedes demostrar hoy.',
              como: 'Indica la diferenciación y qué registro la respalda. Si no hay evidencia, marca pendiente.',
              ejemplo: 'Diferenciación: origen y proceso artesanal. Evidencia: ficha técnica (pendiente de elaborar).',
              alerta: 'Pregúntate: ¿qué registro o hecho te permite afirmarlo?',
            },
          },
          {
            id: 'suministroOk',
            label: 'Información de suministro que puedo confirmar',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Antes de cotizar, conviene saber qué ya puedes confirmar (presentación, volumen, frecuencia, lugar).',
              como: 'Lista solo lo que está disponible hoy. No inventes capacidad.',
              ejemplo: 'Presentación: frasco 250 g. Volumen: 300 frascos del escenario local (no equivale a capacidad exportable adicional).',
            },
          },
          {
            id: 'suministroPendiente',
            label: 'Información que necesito consultar',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Los pendientes son un resultado válido de aprendizaje, no un fracaso.',
              como: 'Escribe qué falta y a quién o qué fuente consultarías.',
              ejemplo: 'Confirmar presentación exportable, volumen, frecuencia y lugar de entrega antes de una cotización.',
            },
          },
          {
            id: 'canal',
            label: 'Canal elegido y siguiente contacto',
            kind: 'textarea',
            rows: 2,
            required: true,
            help: {
              paraQue: 'Cerrar con una acción concreta, no con una intención vaga.',
              como: 'Indica el canal (correo, feria, intermediario…) y el siguiente contacto o consulta.',
              ejemplo: 'Canal: contacto B2B por correo. Siguiente paso: compartir lo disponible e identificar lo pendiente.',
            },
          },
        ],
      },
      {
        id: 'f1-presentacion',
        title: 'Presentación breve',
        intro: 'Redacta con el modelo de la ficha. No necesitas una pieza gráfica ni una publicación comercial.',
        fields: [
          {
            id: 'presentacion',
            label: 'Mi presentación breve',
            kind: 'presentation',
            required: true,
            help: {
              paraQue: 'Practicar una explicación que otra persona pueda entender en pocos minutos.',
              como: 'Completa: Somos… Ofrecemos… para… Nos diferenciamos por… Podemos presentar como evidencia… Necesitamos confirmar…',
              ejemplo:
                'Somos un obrador en Costa Rica. Ofrecemos mermelada de mora en frasco para una distribuidora en EE. UU. Nos diferenciamos por origen y proceso. Evidencia: pendientes de ficha técnica. Necesitamos confirmar volumen y plazo.',
            },
          },
        ],
      },
      {
        id: 'f1-revision',
        title: 'Después de la revisión',
        intro: 'Conserva la primera versión y añade la corrección. No borres el recorrido de aprendizaje.',
        fields: [
          {
            id: 'entendioCompanero',
            label: '¿Qué entendió mi compañero?',
            kind: 'textarea',
            rows: 3,
            help: {
              paraQue: 'Comprobar si la propuesta se entiende sin que tú la “completes” al hablar.',
              como: 'Anota lo que tu compañero repitió con sus palabras.',
              ejemplo: 'Entendió el producto y el tipo de comprador, pero no quedó claro el volumen disponible.',
            },
          },
          {
            id: 'afirmacionRespaldo',
            label: '¿Qué afirmación necesita respaldo?',
            kind: 'textarea',
            rows: 3,
            help: {
              paraQue: 'Evitar convertir una intención en resultado.',
              como: 'Señala una frase que suene a promesa sin evidencia.',
              ejemplo: '“Podemos exportar 300 frascos adicionales” — falta confirmar capacidad real.',
            },
          },
          {
            id: 'revisionRespuestas',
            label: 'Mis respuestas después de la revisión',
            kind: 'textarea',
            rows: 3,
            help: {
              paraQue: 'Dejar una versión revisada identificada, no reescribir borrando todo.',
              como: 'Añade la corrección o la frase ajustada.',
              ejemplo: 'Corrección: presentamos lo disponible (300 frascos del escenario local) e identificamos pendiente de capacidad exportable.',
            },
          },
          {
            id: 'siguienteContacto',
            label: 'Mi siguiente contacto',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Salir del bloque con una acción verificable.',
              como: 'Nombre o rol + canal + qué pedirás o compartirás.',
              ejemplo: 'Escribir a la distribuidora con ficha técnica pendiente y plazos tentativos.',
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
    subtitle: 'Dinámica 2 · La regla, el caso y la evidencia',
    day: 1,
    durationMin: 30,
    consigna:
      'Selecciona un requisito. Primero identifica quién lo exige. Después comprueba si se aplica a tu producto y operación. Solo entonces revisa cómo demostrarías el cumplimiento. Si una respuesta no está sustentada, conserva el pendiente.',
    proposito:
      'Desarrollar una verificación separando aplicabilidad y cumplimiento. Una fila completa basta; no se exige resolver todas las autorizaciones.',
    tipRevision:
      'La pareja comprueba si se entiende la fuente y la separación de estados. No determina requisitos que no conoce.',
    steps: [
      {
        id: 'f2-contexto',
        title: 'Contexto del producto y la operación',
        intro: 'Si faltan datos, puedes practicar con el caso de café ficticio (Apoyo A) sin atribuirlo a tu negocio real.',
        fields: [
          {
            id: 'productoProceso',
            label: 'Producto, presentación, composición o proceso',
            kind: 'textarea',
            rows: 3,
            required: true,
            help: {
              paraQue: 'Los requisitos dependen de qué es el producto y cómo se elabora o declara.',
              como: 'Describe ingredientes relevantes, proceso y presentación. Mantén el mismo producto de la Ficha 1.',
              ejemplo: 'Café tostado en grano, sin otros ingredientes, sin declaración orgánica. Costa Rica → posible venta B2B en EE. UU.',
            },
          },
          {
            id: 'paises',
            label: 'País de producción y expedición',
            kind: 'textarea',
            rows: 2,
            required: true,
            help: {
              paraQue: 'Origen y punto de salida cambian obligaciones y operadores.',
              como: 'Indica país(es) de producción y desde dónde saldría el envío.',
              ejemplo: 'Producción y expedición: Costa Rica.',
            },
          },
          {
            id: 'destinoUso',
            label: 'Destino y uso previsto',
            kind: 'textarea',
            rows: 2,
            required: true,
            help: {
              paraQue: 'El destino (EE. UU.) y el uso (reventa comercial) definen el marco de requisitos.',
              como: 'Escribe país de destino y si es reventa, foodservice, etc.',
              ejemplo: 'Estados Unidos, reventa por distribuidora. Aún no hay envío programado.',
            },
          },
          {
            id: 'operadores',
            label: 'Operadores identificados y roles',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Saber quién hace qué ayuda a asignar responsables de cumplimiento.',
              como: 'Lista productores, exportadores, importadores, presentantes, etc., aunque sean hipótesis.',
              ejemplo: 'Productor/tostador en CR; distribuidora en EE. UU.; presentante de Prior Notice (pendiente de designar).',
            },
          },
        ],
      },
      {
        id: 'f2-requisito',
        title: 'Requisito prioritario',
        intro: 'Empieza por un requisito. Si faltan datos, consérvalos como pendientes.',
        fields: [
          {
            id: 'requisitoTipo',
            label: 'Requisito y tipo (legal, comercial o diferencial)',
            kind: 'textarea',
            rows: 3,
            required: true,
            help: {
              paraQue: 'No todo lo que pide el comprador es una obligación legal universal.',
              como: 'Nombra el requisito y clasifícalo: legal / comercial / diferencial.',
              ejemplo:
                'Prior Notice (legal, FDA). NOP orgánico (legal específico si se declara orgánico). Ficha técnica (condición comercial del comprador).',
            },
          },
          {
            id: 'fuenteFecha',
            label: 'Fuente específica y fecha de consulta o comunicación',
            kind: 'textarea',
            rows: 2,
            required: true,
            help: {
              paraQue: 'Una afirmación sin fuente y fecha no sirve para verificar.',
              como: 'Registra el documento o comunicación y la fecha de consulta.',
              ejemplo: 'FDA Guidance Prior Notice · consulta documental 27/10/2026.',
            },
          },
          {
            id: 'requisitoClase',
            label: 'Tipo de requisito',
            kind: 'chips',
            required: true,
            options: [
              { value: 'legal', label: 'Legal' },
              { value: 'comercial', label: 'Comercial' },
              { value: 'diferencial', label: 'Diferencial' },
            ],
            help: {
              paraQue: 'No todo lo que pide el comprador es una obligación legal universal.',
              como: 'Elige una clasificación. Puedes afinar el nombre del requisito en el paso anterior.',
              ejemplo: 'Prior Notice = legal · Ficha técnica pedida por comprador = comercial · Sello voluntario = diferencial.',
            },
          },
          {
            id: 'aplica',
            label: '¿Aplica a este producto y operación?',
            kind: 'choice',
            options: [
              { value: 'si', label: 'Sí' },
              { value: 'no', label: 'No' },
              { value: 'pendiente', label: 'Pendiente' },
            ],
            required: true,
            help: {
              paraQue: 'Separar “existe la norma” de “aplica a mi caso”.',
              como: 'Elige sí/no/pendiente y escribe el motivo en el campo siguiente.',
              ejemplo: 'NOP: No aplica mientras el café se comercialice como convencional sin declaración orgánica.',
              alerta: 'No confundas falta de información con “no aplica”.',
            },
          },
          {
            id: 'aplicaMotivo',
            label: 'Motivo de aplicabilidad',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Dejar explícito el razonamiento para la revisión en pareja.',
              como: 'Explica por qué aplica, no aplica o queda pendiente.',
              ejemplo: 'Prior Notice aplica al futuro envío comercial de alimentos; no al momento de solo presentar una propuesta.',
            },
          },
          {
            id: 'cumple',
            label: '¿Se cumple?',
            kind: 'choice',
            options: [
              { value: 'cumple', label: 'Cumple' },
              { value: 'no_cumple', label: 'No cumple' },
              { value: 'pendiente', label: 'Pendiente de verificación' },
              { value: 'no_aplica', label: 'No aplica' },
            ],
            required: true,
            help: {
              paraQue: 'Encontrar una norma aplicable no autoriza marcar “cumple” sin evidencia ni momento de ejecución.',
              como: 'Evalúa evidencia disponible y cuándo corresponde ejecutar la obligación.',
              ejemplo: 'Prior Notice: pendiente — aún no hay envío programado; preparar presentación para el envío efectivo.',
              alerta: 'La ausencia del aviso durante la propuesta no demuestra incumplimiento.',
            },
          },
          {
            id: 'evidenciaMomento',
            label: 'Evidencia y momento de ejecución',
            kind: 'textarea',
            rows: 3,
            required: true,
            help: {
              paraQue: 'Saber con qué se demuestra y cuándo hay que hacerlo.',
              como: 'Describe evidencia disponible o pendiente y el momento (antes del envío, en la llegada, etc.).',
              ejemplo: 'Evidencia: no hay Prior Notice confirmado. Momento: dentro de plazos FDA antes de la llegada del envío real.',
            },
          },
          {
            id: 'proximoPaso',
            label: 'Próximo paso y responsable',
            kind: 'textarea',
            rows: 2,
            required: true,
            help: {
              paraQue: 'Cerrar con una consulta o acción asignada.',
              como: 'Quién hace qué y qué consultará.',
              ejemplo: 'Coordinar presentante, datos y plazos · responsable: exportador / asesor regulatorio.',
            },
          },
        ],
      },
      {
        id: 'f2-revision',
        title: 'Revisión',
        intro: 'No confundas falta de información con “no aplica” ni con un incumplimiento demostrado.',
        fields: [
          {
            id: 'fuenteCorresponde',
            label: '¿La fuente corresponde al caso?',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Validar que no se usó una guía de otro producto o mercado.',
              como: 'Responde con sí/no/parcial y por qué.',
              ejemplo: 'Sí para Prior Notice de alimentos importados a EE. UU.; el caso es café tostado comercial.',
            },
          },
          {
            id: 'datoFalta',
            label: '¿Qué dato o evidencia falta?',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Registrar pendientes evita inventar cumplimiento.',
              como: 'Lista lo que falta verificar.',
              ejemplo: 'Ficha técnica solicitada por el comprador aún no elaborada.',
            },
          },
          {
            id: 'correccion',
            label: 'Corrección de mi primera respuesta',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Añadir corrección identificada, no borrar el aprendizaje.',
              como: 'Escribe qué cambiaste tras la revisión.',
              ejemplo: 'Corregí: NOP no aplica en convencional; eso no elimina otros requisitos de importación.',
            },
          },
          {
            id: 'consultare',
            label: 'Fuente o persona que consultaré',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Dejar un camino concreto de verificación oficial.',
              como: 'Nombre de fuente oficial o persona/rol.',
              ejemplo: 'FDA Guidance Prior Notice; USDA–AMS si cambia la declaración orgánica.',
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
    subtitle: 'Dinámica 3 · El precio necesita condiciones',
    day: 2,
    durationMin: 23,
    consigna:
      'Define la cantidad, la moneda y qué costos asumiría el vendedor. Registra lo que puedes calcular y lo que necesitas cotizar. Si faltan datos esenciales, practica con Rosa y conserva los pendientes de tu negocio.',
    proposito:
      'Organizar costos compatibles y distinguir costo, precio y momento de pago. Lo desconocido no se registra como cero.',
    tipRevision:
      'Puedes revisar el caso ficticio si no deseas compartir importes confidenciales. Las 12 u. m. del caso no son 12 USD.',
    steps: [
      {
        id: 'f3-escenario',
        title: 'Escenario de cálculo',
        intro: 'Marca si usas registros del negocio, una propuesta identificada o la práctica ficticia de Rosa.',
        fields: [
          {
            id: 'rutaPrecio',
            label: 'Ruta de trabajo',
            kind: 'choice',
            options: [
              { value: 'negocio', label: 'Registros del negocio' },
              { value: 'propuesta', label: 'Propuesta identificada' },
              { value: 'rosa', label: 'Práctica ficticia de Rosa' },
            ],
            required: true,
            help: {
              paraQue: 'Separar tu negocio real del ejercicio didáctico.',
              como: 'Elige una ruta. Si practicas con Rosa, no atribuyas sus cifras a tu empresa.',
              ejemplo: 'Rosa: 300 frascos · costos 1.800 + 800 · precio local 10 · adicional internacional 600 · diferencia deseada 400.',
            },
          },
          {
            id: 'productoCantidad',
            label: 'Producto y cantidad',
            kind: 'textarea',
            rows: 2,
            required: true,
            help: {
              paraQue: 'El precio unitario depende de la cantidad del escenario.',
              como: 'Mismo producto del mapa + unidades del cálculo.',
              ejemplo: 'Mermelada · 300 frascos del escenario.',
            },
          },
          {
            id: 'condicionEntrega',
            label: 'Condición de entrega y lugar',
            kind: 'incoterm',
            required: true,
            help: {
              paraQue: 'FCA, DAP u otra condición cambia quién asume costos y riesgos.',
              como: 'Elige Incoterm o condición, indica lugar y marca si está acordado o es propuesta.',
              ejemplo: 'Escenario propuesto tipo FCA o DAP según demostración del curso (acordar con el comprador).',
            },
          },
          {
            id: 'monedaCalculo',
            label: 'Moneda de cálculo',
            kind: 'chips',
            options: [
              { value: 'um', label: 'u. m. (caso)' },
              { value: 'crc', label: 'CRC' },
              { value: 'usd', label: 'USD' },
              { value: 'otra', label: 'Otra' },
            ],
            help: {
              paraQue: 'Mantener visibles las unidades monetarias sin inventar tipos de cambio.',
              como: 'Elige la moneda en la que sumas costos. Si usas u. m. del caso, déjalo explícito.',
              ejemplo: 'u. m. (unidades monetarias del caso ficticio) — no son USD.',
            },
          },
          {
            id: 'monedaVenta',
            label: 'Moneda de venta',
            kind: 'chips',
            options: [
              { value: 'um', label: 'u. m. (caso)' },
              { value: 'crc', label: 'CRC' },
              { value: 'usd', label: 'USD' },
              { value: 'otra', label: 'Otra' },
            ],
            help: {
              paraQue: 'Puede diferir de la moneda de costo; entonces la conversión debe documentarse.',
              como: 'Moneda en la que cotizarías al comprador.',
              ejemplo: 'Misma u. m. del ejercicio; si hay conversión real, registrar tasa, fuente y fecha.',
            },
          },
          {
            id: 'tasa',
            label: 'Tasa, orientación, fuente y fecha',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Sin tasa documentada no hay conversión fiable.',
              como: 'Si existe conversión real: tasa, de→a, fuente y fecha. Si no, escribe pendiente.',
              ejemplo: 'Pendiente: no se conoce moneda real ni tipo de cambio a USD en el caso de Rosa.',
              alerta: 'No inventes un tipo de cambio ficticio.',
            },
          },
          {
            id: 'conversionCostos',
            label: 'Costos de conversión o cobro y dónde se incluyen',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Evitar duplicar comisiones u omitirlas.',
              como: 'Indica comisiones bancarias o de cobro y en qué línea van.',
              ejemplo: 'Pendiente de cotizar; no registrar como cero.',
            },
          },
          {
            id: 'vigencia',
            label: 'Vigencia propuesta de la cotización',
            kind: 'text',
            help: {
              paraQue: 'Un precio sin vigencia puede quedar obsoleto por costos o tipo de cambio.',
              como: 'Propón días o una fecha. Si no sabes, pendiente.',
              ejemplo: '15 días desde la cotización (propuesta).',
            },
          },
        ],
      },
      {
        id: 'f3-costos',
        title: 'Tabla de costos',
        intro: 'Organiza conceptos, importes, fuentes, quién asume y cuándo se paga.',
        fields: [
          {
            id: 'tablaCostos',
            label: 'Conceptos de costo',
            kind: 'cost-table',
            columns: [
              { id: 'importe', label: 'Importe y moneda' },
              { id: 'fuente', label: 'Fuente, fecha y estado' },
              { id: 'asume', label: 'Quién lo asume' },
              { id: 'cuando', label: 'Cuándo se paga' },
            ],
            rowLabels: [
              { id: 'produccion', label: 'Producción y costos asignados' },
              { id: 'embalaje', label: 'Adecuación y embalaje adicional' },
              { id: 'cumplimiento', label: 'Cumplimiento y certificaciones' },
              { id: 'transporte', label: 'Transporte y manipulación' },
              { id: 'otros', label: 'Otros conceptos pertinentes' },
            ],
            help: {
              paraQue: 'Ver la estructura antes de “adivinar” un precio.',
              como: 'Completa lo conocido. Lo desconocido queda pendiente — nunca como cero inventado.',
              ejemplo: 'Rosa: variables 1.800 + fijos 800 = 2.600. Adicional internacional didáctico 600 → costo escenario 3.200.',
              alerta: 'Las 400 de remuneración ya están en costos fijos; no las sumes otra vez.',
            },
          },
        ],
      },
      {
        id: 'f3-calculo',
        title: 'Cálculo y revisión',
        intro: 'Calcula lo posible y registra la cotización que falta.',
        fields: [
          {
            id: 'costosConvertidos',
            label: 'Costos convertidos a una misma moneda',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Sumar solo cuando las monedas son comparables.',
              como: 'Total en una moneda o indica pendiente de conversión.',
              ejemplo: '2.600 + 600 = 3.200 u. m. (escenario internacional ficticio).',
            },
          },
          {
            id: 'operacionResultado',
            label: 'Operación y resultado (práctica Rosa)',
            kind: 'rosa-calc',
            required: true,
            help: {
              paraQue: 'Mostrar el cálculo, no solo el número final.',
              como: 'Toca cada paso para revelar la operación. Si usas tu negocio, anota después tus propios pendientes.',
              ejemplo:
                'Ingreso necesario para conservar 400: 3.200 + 400 = 3.600. Precio/frasco: 3.600 ÷ 300 = 12 u. m. Si mantiene 10: 300×10 − 3.200 = −200.',
            },
          },
          {
            id: 'faltaCotizar',
            label: 'Costo, tasa o cotización que falta',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'El precio calculado no prueba aceptación del comprador.',
              como: 'Lista E (adicionales desconocidos) u otras cotizaciones.',
              ejemplo: 'Con adicional E desconocido: precio = (2.600 + E + 400) ÷ 300. E no es cero por estar pendiente.',
            },
          },
          {
            id: 'pagoPrevio',
            label: 'Pago anterior al cobro que debo prever',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Un resultado positivo no financia automáticamente los pagos previos.',
              como: 'Indica anticipos, insumos o fletes que pagas antes de cobrar.',
              ejemplo: 'Costos de producción y adecuación se pagan antes del cobro del comprador.',
            },
          },
          {
            id: 'correccionPrecio',
            label: 'Corrección después de revisar',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Conservar el aprendizaje del error común.',
              como: 'Anota la corrección identificada.',
              ejemplo: 'No sumar otra vez la remuneración de 400 ya incluida en fijos.',
            },
          },
          {
            id: 'responsableConsulta',
            label: 'Responsable de la siguiente consulta',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Salir con una verificación concreta.',
              como: 'Quién cotiza qué.',
              ejemplo: 'Cotizar embalaje exportable y condición de entrega con el comprador.',
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
    subtitle: 'Dinámica 4 · Seguir el producto desde el comprador',
    day: 2,
    durationMin: 24,
    consigna:
      'Dibuja el recorrido de tu producto y muestra cómo se conectan sus registros. Después comprobaremos si otra persona puede volver desde una entrega hasta la producción y sus materiales. Un código propuesto debe quedar marcado como propuesta.',
    proposito:
      'Relacionar registros hacia adelante y hacia atrás y formular una mejora logística basada en datos pendientes.',
    tipRevision:
      'El compañero parte del producto entregado y sigue las referencias. Señala un vínculo incompleto. Si no hay registros, ensaya con los códigos de Rosa.',
    steps: [
      {
        id: 'f4-recorrido',
        title: 'Recorrido y conexiones',
        intro: 'La ruta relaciona documentos, no solo nombres de etapas.',
        fields: [
          {
            id: 'productoOportunidad',
            label: 'Producto y oportunidad',
            kind: 'textarea',
            rows: 2,
            required: true,
            help: {
              paraQue: 'Integrar las cuatro fichas sobre el mismo producto y oportunidad.',
              como: 'Repite el producto y el comprador/oportunidad del mapa.',
              ejemplo: 'Mermelada · comprador ficticio C-01 / oportunidad B2B.',
            },
          },
          {
            id: 'rutaTrazabilidad',
            label: 'Ruta de trabajo',
            kind: 'choice',
            options: [
              { value: 'negocio', label: 'Registros del negocio' },
              { value: 'propuesta', label: 'Propuesta identificada' },
              { value: 'rosa', label: 'Práctica ficticia de Rosa' },
            ],
            required: true,
            help: {
              paraQue: 'Si el negocio no posee registros, se ensaya con Rosa sin presentarlo como trazabilidad implementada.',
              como: 'Elige la ruta y marca códigos propuestos como “propuesta”.',
              ejemplo: 'Rosa: P-01/F-02 → RF-01 → L-05 → EX-03 → C-01 · control L-05 → QC-05.',
            },
          },
          {
            id: 'recorridoTexto',
            label: 'Arma el recorrido de registros',
            kind: 'trace-builder',
            required: true,
            help: {
              paraQue: 'Ver la cadena hacia adelante con vínculos documentados.',
              como: 'Toca los registros y ordénalos. Un código propuesto debe quedar marcado como propuesta en tus notas.',
              ejemplo: 'Hacia adelante: P-01/F-02 → RF-01 → L-05 → EX-03 → C-01.',
            },
          },
          {
            id: 'vinculos',
            label: 'Notas de vínculos o pendientes',
            kind: 'tagged-text',
            help: {
              paraQue: 'Dejar explícito registro ↔ registro conectado ↔ responsable.',
              como: 'Añade un vínculo incompleto o un responsable pendiente.',
              ejemplo: 'L-05 conecta con RF-01 (origen) y EX-03 (destino); QC-05 es el control asociado.',
            },
          },
          {
            id: 'control',
            label: 'Un control: qué compruebo y dónde queda registrado',
            kind: 'textarea',
            rows: 3,
            required: true,
            help: {
              paraQue: 'Un punto de control con registro evita “controles” que no existen en papel.',
              como: 'Qué se comprueba, con qué registro y quién interviene.',
              ejemplo: 'Control de L-05 en QC-05; no inventar el resultado técnico de QC-05.',
            },
          },
          {
            id: 'pruebaComprador',
            label: 'Prueba desde el comprador: vínculo faltante o por corregir',
            kind: 'textarea',
            rows: 3,
            help: {
              paraQue: 'Comprobar el recorrido inverso desde una incidencia.',
              como: 'Simula: el comprador reporta un problema en un lote. ¿Qué consultas?',
              ejemplo:
                'Incidencia en L-05 vía EX-03: C-01 → EX-03 → L-05 → RF-01 → P-01/F-02; y QC-05. Revisar si RF-01 aparece en otros lotes.',
              alerta: 'No atribuir causas sin investigar ni inventar destinos adicionales.',
            },
          },
        ],
      },
      {
        id: 'f4-mejora',
        title: 'Mejora logística por comprobar',
        intro: 'Que el comprador contrate el transporte no borra sus emisiones del recorrido analizado.',
        fields: [
          {
            id: 'mejora',
            label: 'Qué quiero mejorar',
            kind: 'textarea',
            rows: 2,
            required: true,
            help: {
              paraQue: 'Proponer una mejora basada en datos, no en intuición suelta.',
              como: 'Describe la mejora logística candidata.',
              ejemplo: 'Comparar consolidación de envíos vs frecuencia actual (pendiente de datos).',
            },
          },
          {
            id: 'calidad',
            label: 'Qué condición de calidad debo mantener',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'La mejora no puede romper calidad ni inocuidad.',
              como: 'Escribe la condición que no se negocia.',
              ejemplo: 'Mantener cadena de frío / integridad del lote / trazabilidad del registro.',
            },
          },
          {
            id: 'datosComparar',
            label: 'Qué datos necesito para comparar costo y emisiones',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Separar ahorro económico de reducción de emisiones.',
              como: 'Lista datos faltantes; no calcules factores no disponibles.',
              ejemplo: 'Distancia, modo de transporte, peso, factores de emisión oficiales — pendientes.',
            },
          },
          {
            id: 'consultaLogistica',
            label: 'A quién consultaré',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Dejar una consulta logística prioritaria.',
              como: 'Persona, empresa o fuente.',
              ejemplo: 'Operador logístico / comprador sobre Incoterm y datos de trayecto.',
            },
          },
        ],
      },
      {
        id: 'f4-accion',
        title: 'Acción prioritaria final',
        intro: 'Completar al cierre. Una ficha completa no sustituye la validación técnica de una operación real.',
        fields: [
          {
            id: 'accionMotivo',
            label: 'Acción y motivo',
            kind: 'textarea',
            rows: 3,
            required: true,
            help: {
              paraQue: 'Integrar el mapa en un siguiente paso realista.',
              como: 'Una acción prioritaria con motivo claro.',
              ejemplo: 'Elaborar ficha técnica y verificar Prior Notice con asesor — porque son pendientes de las fichas 1 y 2.',
            },
          },
          {
            id: 'responsableFinal',
            label: 'Responsable',
            kind: 'text',
            required: true,
            help: {
              paraQue: 'Sin responsable, la acción no avanza.',
              como: 'Nombre o rol.',
              ejemplo: 'Titular del negocio / encargado de calidad.',
            },
          },
          {
            id: 'interlocutor',
            label: 'Fuente o interlocutor',
            kind: 'text',
            help: {
              paraQue: 'Saber con quién o qué fuente se valida.',
              como: 'Persona, institución o documento.',
              ejemplo: 'FDA guidance / comprador / laboratorio.',
            },
          },
          {
            id: 'fechaPropuesta',
            label: 'Fecha propuesta',
            kind: 'text',
            help: {
              paraQue: 'Dar horizonte temporal sin prometer lo imposible.',
              como: 'Fecha o plazo. Si es hipótesis, indícalo.',
              ejemplo: 'Antes del próximo encuentro / en 15 días.',
            },
          },
          {
            id: 'evidenciaEsperada',
            label: 'Evidencia esperada',
            kind: 'textarea',
            rows: 2,
            help: {
              paraQue: 'Definir qué demostrará que la acción se cumplió.',
              como: 'Documento, correo, registro, cotización…',
              ejemplo: 'Ficha técnica redactada + lista de requisitos con fuente y fecha.',
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
