-- ============================================================
-- TIPOS DE GUÍA: nuevas columnas en postulaciones_guias
-- Ejecutar en Supabase > SQL Editor ANTES de publicar el nuevo formulario
-- ============================================================

-- 1. Tipos seleccionados desde el catálogo oficial (selección múltiple)
ALTER TABLE postulaciones_guias
  ADD COLUMN IF NOT EXISTS tipos_guia TEXT[] DEFAULT '{}';

-- 2. Especialidades libres ingresadas en la opción "Otro" (puede haber varias)
ALTER TABLE postulaciones_guias
  ADD COLUMN IF NOT EXISTS tipos_guia_otros TEXT[] DEFAULT '{}';

-- 3. Índice para filtrar guías por tipo en el panel Admin / portal B2B
CREATE INDEX IF NOT EXISTS idx_postulaciones_guias_tipos
  ON postulaciones_guias USING GIN (tipos_guia);

-- 4. Refrescar el caché de esquema de la API (PostgREST)
NOTIFY pgrst, 'reload schema';
