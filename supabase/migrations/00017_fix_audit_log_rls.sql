-- ============================================
-- 00017: Fix audit_log — SECURITY DEFINER function
-- La función se ejecuta como owner (postgres), bypass RLS
-- ============================================

-- Asegurar RLS deshabilitado + políticas removidas
ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_insert" ON public.audit_log;

-- Función SECURITY DEFINER para insertar audit
CREATE OR REPLACE FUNCTION public.insert_audit_log(
  p_user_id UUID,
  p_action TEXT,
  p_entity TEXT,
  p_entity_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_log (user_id, action, entity, entity_id, details)
  VALUES (p_user_id, p_action, p_entity, p_entity_id, p_details);
END;
$$;

-- Dar permiso al rol anon y autenticado para llamar la función
GRANT EXECUTE ON FUNCTION public.insert_audit_log TO anon, authenticated, service_role;