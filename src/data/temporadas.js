// ============================================================
// Configuración de Campañas y Marketing por Temporada
// Permite priorizar servicios y destacar promociones estacionales en Home
// ============================================================

export const TEMPORADAS = [
  {
    id: 'primavera-verano',
    nombre: 'Temporada Primavera - Verano & Giras de Estudio',
    eslogan: 'Planifica y asegura la operación de tu temporada alta',
    tagline: 'Prioridad de la Temporada',
    activo: true, // Campaña actualmente activa
    banner: {
      titulo: 'Temporada de Giras de Estudio & Alta Demanda Receptiva',
      subtitulo: 'Selección, preparación y asignación de coordinadores turísticos para agencias y operadores. Acompañamiento en terreno, cumplimiento de itinerario y respaldo ante contingencias.',
      badge: 'Temporada Escolar & Receptiva 2026',
      ctaTexto: 'Cotizar Coordinación de Giras',
      ctaLink: '/contacto?servicio=giras-estudio'
    },
    serviciosPrioritarios: [
      {
        id: 'giras-estudio',
        titulo: 'COORDINACIÓN DE GIRAS DE ESTUDIO',
        destacado: 'Alta Demanda',
        badge: 'Nuevo Servicio B2B',
        icono: 'GraduationCap',
        desc: 'Equipos preparados para acompañar grupos estudiantiles, supervisar el itinerario y mantener comunicación fluida con proveedores, profesores y adultos responsables.',
        beneficios: ['Perfiles evaluados con WFR / Primeros Auxilios', 'Enlace directo con proveedores y profesores', 'Respaldo operativo y gestión de reemplazos']
      },
      {
        id: 'provision-guias',
        titulo: 'PROVISIÓN DE GUÍAS RECEPTIVOS & BILINGÜES',
        destacado: 'Cruceros & Receptivo',
        badge: 'Temporada Alta',
        icono: 'UserStar',
        desc: 'Guías locales, regionales y bilingües (Inglés, Portugués, Francés) para la temporada de cruceros y turismo internacional.',
        beneficios: ['Acreditación SERNATUR', 'Inglés / Portugués fluido', 'Resolución en terreno']
      },
      {
        id: 'guia-sos',
        titulo: 'GUÍA SOS (REEMPLAZOS DE CONTINGENCIA)',
        destacado: 'Respuesta Rápida',
        badge: 'Operación 24/7',
        icono: 'Zap',
        desc: 'Cubrimos cancelaciones de última hora o aumentos imprevistos en tu flota de pasajeros para evitar suspender servicios.',
        beneficios: ['Activación ágil', 'Profesionales evaluados', 'Continuidad operativa']
      }
    ]
  },
  {
    id: 'otono-invierno',
    nombre: 'Temporada Invierno & Centros Invernales',
    eslogan: 'Especialistas en cordillera, nieve y alta exigencia climática',
    tagline: 'Temporada de Nieve',
    activo: false,
    banner: {
      titulo: 'Operación Segura en Montaña y Centros de Ski',
      subtitulo: 'Guías de montaña, traslados con cadenas y soporte para la temporada invernal en Farellones, Valle Nevado, Portillo y Chillán.',
      badge: 'Temporada de Nieve',
      ctaTexto: 'Coordinar Operación Invernal',
      ctaLink: '/contacto?servicio=nieve'
    },
    serviciosPrioritarios: [
      {
        id: 'montana-nieve',
        titulo: 'GUÍAS DE NIEVE & CENTROS DE SKI',
        destacado: 'Cordillera',
        badge: 'Temporada Nieve',
        icono: 'Mountain',
        desc: 'Profesionales capacitados en traslados invernales, condiciones de hielo y guiado en centros de ski.',
        beneficios: ['Manejo de cadenas y clima adverso', 'Primeros auxilios en áreas remotas', 'Protocolos de montaña']
      }
    ]
  }
];

export const getTemporadaActiva = () => {
  return TEMPORADAS.find(t => t.activo) || TEMPORADAS[0];
};
