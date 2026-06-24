-- ============================================================
-- SISTEMA DE CHAT — GUÍA A LA CARTA
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Tabla de salas de chat (una por reserva)
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disponibilidad_id BIGINT,       -- FK a disponibilidad_guias.id
  empresa_id BIGINT,              -- FK a empresas.id
  empresa_nombre TEXT,
  guia_id BIGINT,                 -- id del guía en postulaciones_guias/estudiantes
  tipo_guia TEXT DEFAULT 'guia',  -- 'guia' | 'estudiante'
  guia_nombre TEXT,
  nombre_servicio TEXT,
  fecha_servicio DATE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de mensajes
CREATE TABLE IF NOT EXISTS chat_mensajes (
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

-- 3. Habilitar Realtime en ambas tablas
ALTER TABLE chat_mensajes REPLICA IDENTITY FULL;
ALTER TABLE chats REPLICA IDENTITY FULL;

-- 4. Indexes para performance
CREATE INDEX IF NOT EXISTS idx_chat_mensajes_chat_id ON chat_mensajes(chat_id);
CREATE INDEX IF NOT EXISTS idx_chats_empresa_id ON chats(empresa_id);
CREATE INDEX IF NOT EXISTS idx_chats_guia_id ON chats(guia_id);
CREATE INDEX IF NOT EXISTS idx_chats_disponibilidad_id ON chats(disponibilidad_id);

-- 5. Deshabilitar RLS para uso con anon key (como el resto de tablas del proyecto)
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_mensajes DISABLE ROW LEVEL SECURITY;
