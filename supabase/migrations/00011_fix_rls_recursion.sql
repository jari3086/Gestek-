-- ============================================
-- 00011: Fix RLS recursion en profiles
-- Usar auth.jwt() para evitar recursion infinita
-- ============================================

drop policy if exists "Tecnicos ven todos los perfiles" on public.profiles;
drop policy if exists "Tecnicos pueden actualizar cualquier perfil" on public.profiles;

create policy "Tecnicos ven todos los perfiles"
  on public.profiles for select
  using (
    auth.uid() = id
    or auth.jwt() -> 'user_metadata' ->> 'role' in ('administrador', 'tecnico')
  );

create policy "Tecnicos pueden actualizar cualquier perfil"
  on public.profiles for update
  using (
    auth.jwt() -> 'user_metadata' ->> 'role' in ('administrador', 'tecnico')
  );
