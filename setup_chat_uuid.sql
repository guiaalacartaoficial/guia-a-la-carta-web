-- ============================================================
-- ACTUALIZACIÓN DE TIPOS DE COLUMNAS A UUID — GUÍA A LA CARTA
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Eliminar la tabla antigua para recrearla con los tipos correctos (UUID)
DROP TABLE IF EXISTS chat_mensajes;
DROP TABLE IF EXISTS chats;

-- 2. Crear tabla chats con columnas UUID
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disponibilidad_id UUID,          -- Cambiado a UUID para coincidir con disponibilidad_guias.id
  empresa_id UUID,                 -- Cambiado a UUID para coincidir con empresas.id
  empresa_nombre TEXT,
  guia_id UUID,                    -- Cambiado a UUID para coincidir con postulaciones_guias/estudiantes.id
  tipo_guia TEXT DEFAULT 'guia',   -- 'guia' | 'estudiante'
  guia_nombre TEXT,
  nombre_servicio TEXT,
  fecha_servicio DATE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear tabla chat_mensajes
CREATE TABLE chat_mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  autor_tipo TEXT NOT NULL,       -- 'empresa' | 'guia' | 'admin'
  autor_nombre TEXT NOT NULL,
  contenido TEXT NOT NULL,
  leido_empresa BOOLEAN DEFAULT FALSE,
  leido_guia BOOLEAN DEFAULT FALSE,
  leido_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar Realtime en ambas tablas
ALTER TABLE chat_mensajes REPLICA IDENTITY FULL;
ALTER TABLE chats REPLICA IDENTITY FULL;

-- 5. Indexes para performance
CREATE INDEX idx_chat_mensajes_chat_id ON chat_mensajes(chat_id);
CREATE INDEX idx_chats_empresa_id ON chats(empresa_id);
CREATE INDEX idx_chats_guia_id ON chats(guia_id);
CREATE INDEX idx_chats_disponibilidad_id ON chats(disponibilidad_id);

-- 6. Deshabilitar RLS
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_mensajes DISABLE ROW LEVEL SECURITY;

-- 7. Asegurar permisos totales
GRANT ALL ON TABLE chats TO anon;
GRANT ALL ON TABLE chat_mensajes TO anon;
GRANT ALL ON TABLE chats TO authenticated;
GRANT ALL ON TABLE chat_mensajes TO authenticated;
