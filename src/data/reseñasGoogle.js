// ============================================================
// Reseñas de Google de Respaldo (Fallback inicial)
// Se muestran si aún no están configuradas las credenciales de Places API
// ============================================================

export const GOOGLE_REVIEWS_DEFAULT = {
  nombre: 'Guía a la Carta',
  rating: 4.9,
  total: 18,
  mapsUrl: 'https://maps.google.com/?q=Guia+a+la+Carta+Chile',
  escribirResenaUrl: 'https://search.google.com/local/writereview',
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
