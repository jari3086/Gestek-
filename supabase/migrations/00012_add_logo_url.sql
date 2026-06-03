-- ============================================
-- 00012: Agregar logo_url a profiles
-- ============================================

alter table public.profiles
  add column if not exists logo_url text;
