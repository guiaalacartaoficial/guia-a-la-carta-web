-- 1. Agregar columna estado_servicio a disponibilidad_guias si no existe
ALTER TABLE disponibilidad_guias
  ADD COLUMN IF NOT EXISTS estado_servicio text DEFAULT 'pendiente';

-- 2. Crear tabla de evaluaciones de servicios si no existe
CREATE TABLE IF NOT EXISTS evaluaciones_servicios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  disponibilidad_id uuid REFERENCES disponibilidad_guias(id) ON DELETE CASCADE,
  empresa_id uuid REFERENCES empresas(id) ON DELETE SET NULL,
  guia_id uuid,
  tipo_guia text,
  estrellas int CHECK (estrellas >= 1 AND estrellas <= 5),
  comentario text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Habilitar RLS en la nueva tabla
ALTER TABLE evaluaciones_servicios ENABLE ROW LEVEL SECURITY;

-- 4. Crear política RLS para permitir todas las operaciones
-- (Para desarrollo interno y portal B2B simplificado)
DROP POLICY IF EXISTS "allow_all" ON evaluaciones_servicios;
CREATE POLICY "allow_all" ON evaluaciones_servicios FOR ALL USING (true) WITH CHECK (true);
