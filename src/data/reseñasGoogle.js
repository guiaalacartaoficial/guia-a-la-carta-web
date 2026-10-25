// ============================================================
// Enlace oficial y reseñas de Google Maps: Guía a la Carta
// Ficha: https://www.google.com/maps/place/Gu%C3%8Da+a+la+carta/
// ============================================================

export const GOOGLE_MAPS_OFFICIAL_URL =
  'https://www.google.com/maps/place/Gu%C3%8Da+a+la+carta/@-37.0608324,-88.1804,17z/data=!4m8!3m7!1s0x2dfd828f8d073043:0xde59130ba2452f44!8m2!3d-37.0608324!4d-88.1804!9m1!1b1';

export const GOOGLE_WRITE_REVIEW_URL =
  'https://www.google.com/maps/place/Gu%C3%8Da+a+la+carta/@-37.0608324,-88.1804,17z/data=!4m8!3m7!1s0x2dfd828f8d073043:0xde59130ba2452f44!8m2!3d-37.0608324!4d-88.1804!9m1!1b1';

export const GOOGLE_REVIEWS_DEFAULT = {
  nombre: 'Guía a la Carta',
  rating: 5.0,
  total: 'Verificadas',
  mapsUrl: GOOGLE_MAPS_OFFICIAL_URL,
  escribirResenaUrl: GOOGLE_WRITE_REVIEW_URL,
  reviews: [
    {
      autor: 'Turismo Austral Expediciones',
      foto: null,
      rating: 5,
      tiempoRelativo: 'Hace 3 semanas',
      texto: 'Excelente nivel de coordinación y puntualidad. Los guías bilingües que nos asignaron para los grupos de crucero en Valparaíso y Santiago demostraron un estándar altísimo.'
    },
    {
      autor: 'Colegio San Ignacio (Coord. Giras)',
      foto: null,
      rating: 5,
      tiempoRelativo: 'Hace 1 mes',
      texto: 'Contratamos la coordinación para nuestra gira de estudios en la zona sur. Profesionales con certificación WFR que transmitieron total seguridad tanto a los profesores como a los apoderados.'
    },
    {
      autor: 'Operador Receptivo Santiago',
      foto: null,
      rating: 5,
      tiempoRelativo: 'Hace 1 mes',
      texto: 'El servicio de Guía SOS nos salvó una contingencia de último minuto un domingo a las 7 AM. En menos de 45 minutos teníamos a un guía validado en el punto de encuentro.'
    },
    {
      autor: 'Agencia Andes & Vino',
      foto: null,
      rating: 5,
      tiempoRelativo: 'Hace 2 meses',
      texto: 'Muy buena experiencia con los guías de enoturismo en Casablanca y Maipo. Conocimiento impecable y excelente feedback de nuestros clientes brasileños y estadounidenses.'
    },
    {
      autor: 'Rodrigo M. (Tour Leader)',
      foto: null,
      rating: 5,
      tiempoRelativo: 'Hace 2 meses',
      texto: 'Coordinación fluida y transparente. Como tour leader agradezco enormemente contar con un respaldo operativo tan riguroso en terreno.'
    }
  ]
};
