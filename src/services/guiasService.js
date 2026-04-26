import { supabase } from './supabaseClient';
import { guiasData as localData } from '../data/guiasData';

// FLAG PARA MIGRACIÓN: Cambiar a 'true' cuando Supabase tenga las tablas listas
const USE_SUPABASE = false;

export const getGuias = async () => {
  if (USE_SUPABASE) {
    const { data, error } = await supabase.from('guias').select('*');
    if (error) {
      console.error('Error fetching guias:', error);
      return [];
    }
    return data;
  }
  
  // Retorna datos locales simulando promesa
  return Promise.resolve(localData);
};

export const createGuia = async (guiaData) => {
  if (USE_SUPABASE) {
    const { data, error } = await supabase.from('guias').insert([guiaData]);
    if (error) throw error;
    return data;
  }
  
  console.log('Modo Ficticio: Creando guía', guiaData);
  return Promise.resolve(guiaData);
};
