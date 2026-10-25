// ============================================================
// Función serverless (Vercel): reseñas de Google vía Places API (New)
// Variables de entorno (NO usar prefijo VITE_, deben quedar ocultas):
//   GOOGLE_PLACES_API_KEY  -> API key con "Places API (New)" habilitada
//   GOOGLE_PLACE_ID        -> Place ID de la ficha de Google Business
// Respuesta cacheada 24 h en el CDN de Vercel para minimizar consumo de cuota.
// ============================================================

const FIELD_MASK = 'displayName,rating,userRatingCount,googleMapsUri,reviews';

export default async function handler(req, res) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  const send = (status, body, cache = true) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      cache ? 'public, s-maxage=86400, stale-while-revalidate=604800' : 'no-store'
    );
    res.end(JSON.stringify(body));
  };

  if (!apiKey || !placeId) {
    return send(503, { error: 'Reseñas de Google no configuradas (faltan GOOGLE_PLACES_API_KEY / GOOGLE_PLACE_ID).' }, false);
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=es&regionCode=CL`;
    const r = await fetch(url, {
      headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELD_MASK },
    });
    const data = await r.json();

    if (!r.ok) {
      return send(502, { error: data?.error?.message || 'Error consultando Google Places' }, false);
    }

    const reviews = (data.reviews || []).map((rv) => ({
      autor: rv.authorAttribution?.displayName || 'Usuario de Google',
      foto: rv.authorAttribution?.photoUri || null,
      perfil: rv.authorAttribution?.uri || null,
      rating: rv.rating || 0,
      texto: rv.text?.text || rv.originalText?.text || '',
      tiempoRelativo: rv.relativePublishTimeDescription || '',
      fecha: rv.publishTime || null,
      link: rv.googleMapsUri || null,
    }));

    return send(200, {
      nombre: data.displayName?.text || 'Guía a la Carta',
      rating: data.rating || null,
      total: data.userRatingCount || 0,
      mapsUrl: data.googleMapsUri || null,
      escribirResenaUrl: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`,
      reviews,
      actualizado: new Date().toISOString(),
    });
  } catch (err) {
    return send(500, { error: err.message || 'Error inesperado' }, false);
  }
}
