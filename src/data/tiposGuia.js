// ============================================================
// Catálogo oficial de tipos de guía de turismo
// Usado en: PostulacionGuias (formulario) y Admin (visualización)
// ============================================================

export const SECTORES_GUIA = [
  {
    id: 'geografico',
    nombre: 'Ámbito Geográfico y de Sitio',
    descripcion: 'Definidos por el territorio o lugar específico donde están facultados y especializados para operar.',
    tipos: [
      { nombre: 'Guía Local / de Sitio', alcance: 'Se limita a un espacio geográfico específico como una ciudad, barrio histórico, museo, monumento, zona arqueológica o parque nacional.' },
      { nombre: 'Guía Regional', alcance: 'Tiene competencias para guiar a través de toda una región o provincia político-administrativa.' },
      { nombre: 'Guía Nacional', alcance: 'Está habilitado para ejercer en todo el territorio de un país, uniendo múltiples regiones y circuitos internos.' },
      { nombre: 'Guía Binacional / Multilocal', alcance: 'Especializado en circuitos transfronterizos o rutas integradas entre dos o más países (ej. Rutas Patagónicas compartidas o el Camino del Inca).' },
    ],
  },
  {
    id: 'logistica',
    nombre: 'Gestión Logística y Operación de Grupos',
    descripcion: 'Profesionales enfocados en el control del itinerario, el transporte y el bienestar general del viajero durante el viaje.',
    tipos: [
      { nombre: 'Guía Acompañante (Tour Escort / Líder de Tour)', alcance: 'Acompaña al grupo desde el origen hasta el destino final. Gestiona reservas, transporte, hoteles, coordina los horarios y soluciona imprevistos logísticos.' },
      { nombre: 'Guía de Traslado (Transferista)', alcance: 'Se encarga del flujo de pasajeros en terminales. Recibe a los turistas en aeropuertos o puertos y los asiste en el trayecto hacia sus respectivos hoteles.' },
      { nombre: 'Guía de Cruceros', alcance: 'Coordina la logística interna, los transportes terrestres y las excursiones rápidas de los cruceristas durante las horas de recalada en los puertos.' },
      { nombre: 'Guía de Receptivo', alcance: 'Representa a la agencia local en el destino. Visita los hoteles de los clientes para ofrecer excursiones opcionales y resolver dudas de su estadía.' },
    ],
  },
  {
    id: 'tematico',
    nombre: 'Turismo Temático y de Intereses Especiales',
    descripcion: 'Orientados a nichos específicos de mercado que demandan un altísimo conocimiento científico, histórico o cultural.',
    tipos: [
      { nombre: 'Guía Patrimonial / Histórico', alcance: 'Centrado exclusivamente en la transmisión de la historia, arquitectura, antropología y legado cultural de las comunidades.' },
      { nombre: 'Guía de Naturaleza / Ecoturismo', alcance: 'Especialista en interpretar ecosistemas, áreas silvestres protegidas y promover la educación ambiental sin alterar el entorno.' },
      { nombre: 'Guía Ornitológico (Birdwatching)', alcance: 'Altamente calificado en la identificación visual y auditiva de aves, rutas de migración y hábitos de la avifauna.' },
      { nombre: 'Guía Astronómico (Astroturismo)', alcance: 'Encargado del guiado nocturno, reconocimiento de constelaciones y operación de telescopios en zonas de cielos limpios.' },
      { nombre: 'Guía Enológico y Gastronómico', alcance: 'Conduce visitas por viñedos, bodegas de vino (rutas del vino) y centros culinarios, explicando maridajes y procesos de producción.' },
    ],
  },
  {
    id: 'aventura-terrestre',
    nombre: 'Turismo Aventura Terrestre (Incluye Montaña)',
    descripcion: 'Especialidades reguladas estrictamente debido al riesgo inherente de la actividad física y el entorno natural agreste.',
    tipos: [
      { nombre: 'Guía de Senderismo / Trekking', alcance: 'Lidera caminatas por senderos o huellas rurales y de media montaña hasta los 4.500 msnm, sin uso de cuerdas técnicas ni progresión invernal compleja.' },
      { nombre: 'Guía de Montaña', alcance: 'Opera en media montaña durante todo el año. Capacitado para pendientes nevadas de hasta 30° y zonas llanas de glaciares.' },
      { nombre: 'Guía de Alta Montaña (UIAGM)', alcance: 'El máximo nivel técnico internacional. Habilitado para expediciones sin límite de altitud, escalada en hielo, grietas complejas y paredes mixtas en cualquier cordillera.' },
      { nombre: 'Guía de Escalada en Roca', alcance: 'Instructor técnico enfocado exclusivamente en paredes verticales de piedra, utilizando anclajes móviles o fijos en rutas deportivas y tradicionales.' },
      { nombre: 'Guía de Esquí de Montaña (Randonnée)', alcance: 'Especializado en progresar y descender con clientes en terrenos invernales fuera de pista y laderas empinadas de nieve profunda.' },
      { nombre: 'Guía de Cicloturismo / Mountain Bike', alcance: 'Lidera rutas de larga distancia en bicicleta de ruta, grava o montaña, con dominio de mecánica de emergencia y navegación satelital.' },
      { nombre: 'Guía de Cabalgatas', alcance: 'Encargado de rutas ecuestres en zonas rurales o de cordillera, responsable del manejo seguro de los animales y el grupo.' },
    ],
  },
  {
    id: 'aventura-acuatico-aereo',
    nombre: 'Turismo Aventura Acuático y Aéreo',
    descripcion: 'Especialidades que dependen del dominio técnico de embarcaciones, corrientes de agua o dinámicas de viento.',
    tipos: [
      { nombre: 'Guía de Rafting', alcance: 'Dirige descensos en ríos de aguas blancas en balsas inflables, clasificándose según el grado de dificultad del río (Clases I a V).' },
      { nombre: 'Guía de Kayak de Mar o Travesía', alcance: 'Conduce expediciones autónomas en océanos, fiordos o grandes lagos, gestionando corrientes, mareas y vientos.' },
      { nombre: 'Guía de Buceo (Divemaster o Instructor)', alcance: 'Lidera inmersiones subacuáticas recreativas, velando por la planificación de descompresión y la seguridad del aire de los buzos.' },
      { nombre: 'Guía de Canotaje / Kayak de Río', alcance: 'Especialista en la navegación de ríos navegables o de aguas bravas en kayaks individuales o canoas.' },
      { nombre: 'Guía de Parapente Tándem / Biplaza', alcance: 'Piloto certificado que realiza vuelos recreativos llevando a un pasajero a bordo, gestionando la meteorología y corrientes térmicas.' },
    ],
  },
];

/** Devuelve el nombre del sector al que pertenece un tipo de guía (o null si es "Otro"). */
export const getSectorDeTipo = (nombreTipo) =>
  SECTORES_GUIA.find((s) => s.tipos.some((t) => t.nombre === nombreTipo))?.nombre || null;
