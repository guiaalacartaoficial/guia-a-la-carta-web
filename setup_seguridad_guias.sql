-- ============================================================
-- MEJORA SEGURIDAD: Columna de contraseña en postulaciones
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Agregar columna de contraseña a postulaciones_guias
ALTER TABLE postulaciones_guias 
  ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Agregar columna de contraseña a postulaciones_estudiantes
ALTER TABLE postulaciones_estudiantes 
  ADD COLUMN IF NOT EXISTS password TEXT;
