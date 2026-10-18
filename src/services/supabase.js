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
export const getOptimizedImageUrl = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return '/logo.webp';
  
  // Si por error viene con /render/image/public/, restaurar a /object/public/ directo
  if (url.includes('/storage/v1/render/image/public/')) {
    return url
      .replace('/storage/v1/render/image/public/', '/storage/v1/object/public/')
      .split('?')[0];
  }
  return url;
};
