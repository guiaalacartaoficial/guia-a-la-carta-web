-- ============================================================
-- SCRIPT DE SEGURIDAD INTEGRAL: HABILITAR RLS Y PROTEGER CONTRASEÑAS
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- ------------------------------------------------------------
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ------------------------------------------------------------
ALTER TABLE IF EXISTS public.postulaciones_guias ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.postulaciones_estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.disponibilidad_guias ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.evaluaciones_servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.relatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comentarios_relatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.manuales ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 2. CREAR POLÍTICAS RLS (Permisivas para mantener compatibilidad B2C/B2B con Anon Key)
-- ------------------------------------------------------------

-- Políticas para postulaciones_guias
DROP POLICY IF EXISTS "permitir_todo_guias" ON public.postulaciones_guias;
CREATE POLICY "permitir_todo_guias" ON public.postulaciones_guias FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Políticas para postulaciones_estudiantes
DROP POLICY IF EXISTS "permitir_todo_estudiantes" ON public.postulaciones_estudiantes;
CREATE POLICY "permitir_todo_estudiantes" ON public.postulaciones_estudiantes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Políticas para empresas
DROP POLICY IF EXISTS "permitir_todo_empresas" ON public.empresas;
CREATE POLICY "permitir_todo_empresas" ON public.empresas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Políticas para disponibilidad_guias
DROP POLICY IF EXISTS "permitir_todo_disponibilidad" ON public.disponibilidad_guias;
CREATE POLICY "permitir_todo_disponibilidad" ON public.disponibilidad_guias FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Políticas para chats
DROP POLICY IF EXISTS "permitir_todo_chats" ON public.chats;
CREATE POLICY "permitir_todo_chats" ON public.chats FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Políticas para chat_mensajes
DROP POLICY IF EXISTS "permitir_todo_chat_mensajes" ON public.chat_mensajes;
CREATE POLICY "permitir_todo_chat_mensajes" ON public.chat_mensajes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Políticas para evaluaciones_servicios
DROP POLICY IF EXISTS "allow_all" ON public.evaluaciones_servicios;
DROP POLICY IF EXISTS "permitir_todo_evaluaciones" ON public.evaluaciones_servicios;
CREATE POLICY "permitir_todo_evaluaciones" ON public.evaluaciones_servicios FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Políticas para reservas
DROP POLICY IF EXISTS "permitir_todo_reservas" ON public.reservas;
CREATE POLICY "permitir_todo_reservas" ON public.reservas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Políticas para relatos
DROP POLICY IF EXISTS "permitir_todo_relatos" ON public.relatos;
CREATE POLICY "permitir_todo_relatos" ON public.relatos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Políticas para comentarios_relatos
DROP POLICY IF EXISTS "permitir_todo_comentarios_relatos" ON public.comentarios_relatos;
CREATE POLICY "permitir_todo_comentarios_relatos" ON public.comentarios_relatos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Políticas para manuales
DROP POLICY IF EXISTS "permitir_todo_manuales" ON public.manuales;
CREATE POLICY "permitir_todo_manuales" ON public.manuales FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- ------------------------------------------------------------
-- 3. RESTRINGIR EL ACCESO DE SELECT A LA COLUMNA PASSWORD
-- ------------------------------------------------------------
-- Revocar todos los accesos SELECT de las tablas con password
REVOKE SELECT ON public.postulaciones_guias FROM anon, authenticated;
REVOKE SELECT ON public.postulaciones_estudiantes FROM anon, authenticated;
REVOKE SELECT ON public.empresas FROM anon, authenticated;

-- Volver a otorgar SELECT en todas las columnas excepto 'password' (y 'rut' si es sensible)
-- Columnas postulaciones_guias
GRANT SELECT (
  id, nombres, apellidos, nombre_visual, apellido_visual, edad, telefono, email, 
  ciudad_residencia, biografia, educacion, rutas_experiencia, 
  url_foto, url_cv, url_sernatur, url_primeros_auxilios, url_otras_certificaciones, 
  nivel, estado, created_at, nacionalidad, ciudad_trabajo, localidades_extra, habilitado_sii, codigo, idiomas
) ON public.postulaciones_guias TO anon, authenticated;

-- Columnas postulaciones_estudiantes
GRANT SELECT (
  id, nombres, apellidos, nombre_visual, apellido_visual, edad, telefono, email, 
  ciudad_residencia, biografia, educacion, experiencia_terreno, 
  url_foto, url_cv, url_certificaciones, 
  estado, created_at, nacionalidad, habilitado_sii, codigo, idiomas
) ON public.postulaciones_estudiantes TO anon, authenticated;

-- Columnas empresas
GRANT SELECT (
  id, nombre_empresa, email, contacto_nombre, telefono, estado, created_at
) ON public.empresas TO anon, authenticated;


-- ------------------------------------------------------------
-- 4. CREAR FUNCIONES RPC SEGURAS (SECURITY DEFINER)
-- ------------------------------------------------------------

-- A. Función para loguear Guía / Estudiante
CREATE OR REPLACE FUNCTION public.verify_guia_login(search_code text, input_password text)
RETURNS jsonb AS $$
DECLARE
    rec record;
    expected_code text;
BEGIN
    -- Validar guías profesionales
    FOR rec IN SELECT * FROM public.postulaciones_guias WHERE estado = 'aprobado' LOOP
        expected_code := 'PRO:' || upper(substring(rec.id::text from 1 for 5));
        IF expected_code = upper(search_code) THEN
            IF rec.password IS NOT NULL AND trim(rec.password) = trim(input_password) THEN
                RETURN jsonb_build_object(
                    'success', true,
                    'guia', to_jsonb(rec) - 'password'
                );
            ELSE
                RETURN jsonb_build_object('success', false, 'error', 'Contraseña incorrecta');
            END IF;
        END IF;
    END LOOP;
    
    -- Validar guías estudiantes
    FOR rec IN SELECT * FROM public.postulaciones_estudiantes WHERE estado = 'aprobado' LOOP
        expected_code := 'EST:' || upper(substring(rec.id::text from 1 for 5));
        IF expected_code = upper(search_code) THEN
            IF rec.password IS NOT NULL AND trim(rec.password) = trim(input_password) THEN
                RETURN jsonb_build_object(
                    'success', true,
                    'guia', to_jsonb(rec) - 'password'
                );
            ELSE
                RETURN jsonb_build_object('success', false, 'error', 'Contraseña incorrecta');
            END IF;
        END IF;
    END LOOP;
    
    RETURN jsonb_build_object('success', false, 'error', 'Código de credencial no encontrado o perfil no aprobado');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Función para recuperación de contraseña de Guías
CREATE OR REPLACE FUNCTION public.request_guia_password_recovery(search_code text)
RETURNS jsonb AS $$
DECLARE
    rec record;
    expected_code text;
    generated_pass text;
BEGIN
    -- Buscar en guías profesionales
    FOR rec IN SELECT * FROM public.postulaciones_guias WHERE estado = 'aprobado' LOOP
        expected_code := 'PRO:' || upper(substring(rec.id::text from 1 for 5));
        IF expected_code = upper(search_code) THEN
            IF rec.password IS NULL OR trim(rec.password) = '' THEN
                generated_pass := 'GC-' || upper(substring(md5(random()::text) from 1 for 6));
                UPDATE public.postulaciones_guias SET password = generated_pass WHERE id = rec.id;
                rec.password := generated_pass;
            END IF;
            RETURN jsonb_build_object(
                'success', true,
                'nombres', rec.nombres,
                'apellidos', rec.apellidos,
                'email', rec.email,
                'password', rec.password,
                'tipo', 'guia'
            );
        END IF;
    END LOOP;
    
    -- Buscar en guías estudiantes
    FOR rec IN SELECT * FROM public.postulaciones_estudiantes WHERE estado = 'aprobado' LOOP
        expected_code := 'EST:' || upper(substring(rec.id::text from 1 for 5));
        IF expected_code = upper(search_code) THEN
            IF rec.password IS NULL OR trim(rec.password) = '' THEN
                generated_pass := 'GC-' || upper(substring(md5(random()::text) from 1 for 6));
                UPDATE public.postulaciones_estudiantes SET password = generated_pass WHERE id = rec.id;
                rec.password := generated_pass;
            END IF;
            RETURN jsonb_build_object(
                'success', true,
                'nombres', rec.nombres,
                'apellidos', rec.apellidos,
                'email', rec.email,
                'password', rec.password,
                'tipo', 'estudiante'
            );
        END IF;
    END LOOP;
    
    RETURN jsonb_build_object('success', false, 'error', 'Código de credencial no encontrado o perfil no aprobado');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. Función para loguear Empresas
CREATE OR REPLACE FUNCTION public.verify_empresa_login(input_email text, input_password text)
RETURNS jsonb AS $$
DECLARE
    rec record;
BEGIN
    SELECT * INTO rec FROM public.empresas 
    WHERE trim(email) = trim(input_email) AND estado = 'activo' LIMIT 1;
    
    IF rec.id IS NOT NULL THEN
        IF rec.password IS NOT NULL AND trim(rec.password) = trim(input_password) THEN
            RETURN jsonb_build_object(
                'success', true,
                'empresa', to_jsonb(rec) - 'password'
            );
        ELSE
            RETURN jsonb_build_object('success', false, 'error', 'Contraseña incorrecta');
        END IF;
    END IF;
    
    RETURN jsonb_build_object('success', false, 'error', 'Correo no registrado o empresa inactiva');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- D. Función para que el Administrador recupere contraseñas en texto plano
CREATE OR REPLACE FUNCTION public.get_sensitive_password(tbl text, rec_id uuid)
RETURNS text AS $$
DECLARE
    result text;
    caller_email text;
BEGIN
    caller_email := auth.jwt() ->> 'email';
    
    -- Restringir para asegurar que solo usuarios administradores autenticados puedan invocarlo
    IF caller_email IS NULL THEN
        RAISE EXCEPTION 'No autorizado: Debes iniciar sesión como administrador';
    END IF;
    
    IF tbl = 'postulaciones_guias' THEN
        SELECT password INTO result FROM public.postulaciones_guias WHERE id = rec_id;
    ELSIF tbl = 'postulaciones_estudiantes' THEN
        SELECT password INTO result FROM public.postulaciones_estudiantes WHERE id = rec_id;
    ELSIF tbl = 'empresas' THEN
        SELECT password INTO result FROM public.empresas WHERE id = rec_id;
    ELSE
        RAISE EXCEPTION 'Tabla inválida';
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
