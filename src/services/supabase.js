import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Optimiza en tiempo real las imágenes almacenadas en el Storage de Supabase
 * sustituyendo '/object/public/' por '/render/image/public/' y aplicando parámetros de redimensión.
 */
export const getOptimizedImageUrl = (url, width = 300, height = 300, quality = 75) => {
  if (!url) return '/placeholder-user.png';
  if (typeof url !== 'string') return url;
  
  // Detectar si es una URL del Storage de Supabase
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    return url
      .replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
      + `?width=${width}&height=${height}&resize=cover&quality=${quality}`;
  }
  return url;
};
