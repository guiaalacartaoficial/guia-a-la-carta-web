-- ============================================================
-- MEJORAS V2: Nuevas columnas en disponibilidad_guias
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Nombre del tour/destino (lo escribe la empresa al bloquear)
ALTER TABLE disponibilidad_guias
  ADD COLUMN IF NOT EXISTS nombre_servicio TEXT;

-- 2. Nota interna del admin por servicio
ALTER TABLE disponibilidad_guias
  ADD COLUMN IF NOT EXISTS nota_interna_admin TEXT;

-- 3. Flag para notificación al admin cuando llega un bloqueo nuevo
ALTER TABLE disponibilidad_guias
  ADD COLUMN IF NOT EXISTS admin_notificado BOOLEAN DEFAULT false;

-- 4. Actualizar registros bloqueados existentes como ya notificados
--    (para no generar falsos positivos en el badge)
UPDATE disponibilidad_guias
  SET admin_notificado = true
  WHERE estado_bloqueo = 'bloqueado';
