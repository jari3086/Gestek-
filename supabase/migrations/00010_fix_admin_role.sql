-- ============================================
-- 00010: Fix — dropear políticas nuevas también
-- ============================================

-- 0. Dropear TODAS las políticas (viejas y nuevas)
-- equipos
drop policy if exists "Tecnicos pueden insertar equipos" on public.equipos;
drop policy if exists "Tecnicos ven todos los equipos" on public.equipos;
drop policy if exists "Tecnicos actualizan equipos" on public.equipos;
drop policy if exists "Tecnicos eliminan equipos" on public.equipos;
drop policy if exists "Clientes ven sus equipos" on public.equipos;
drop policy if exists "Usuarios insertan sus equipos" on public.equipos;
drop policy if exists "Admin y tecnicos pueden insertar equipos" on public.equipos;
drop policy if exists "Admin ve todos los equipos, tecnicos ven todos, clientes ven los suyos" on public.equipos;
drop policy if exists "Admin y tecnicos actualizan equipos" on public.equipos;
drop policy if exists "Admin y tecnicos eliminan equipos" on public.equipos;

-- mantenimientos
drop policy if exists "Tecnicos pueden insertar mantenimientos" on public.mantenimientos;
drop policy if exists "Tecnicos ven todos los mantenimientos" on public.mantenimientos;
drop policy if exists "Tecnicos actualizan mantenimientos" on public.mantenimientos;
drop policy if exists "Tecnicos eliminan mantenimientos" on public.mantenimientos;
drop policy if exists "Clientes ven mantenimientos visibles" on public.mantenimientos;
drop policy if exists "Admin y tecnicos insertan mantenimientos" on public.mantenimientos;
drop policy if exists "Admin ve todos, tecnicos ven los suyos, clientes ven visibles" on public.mantenimientos;
drop policy if exists "Admin actualiza mantenimientos" on public.mantenimientos;
drop policy if exists "Admin elimina mantenimientos" on public.mantenimientos;

-- facturas
drop policy if exists "Tecnicos pueden insertar facturas" on public.facturas;
drop policy if exists "Tecnicos ven todas las facturas" on public.facturas;
drop policy if exists "Tecnicos actualizan facturas" on public.facturas;
drop policy if exists "Tecnicos eliminan facturas" on public.facturas;
drop policy if exists "Clientes ven sus facturas" on public.facturas;
drop policy if exists "Admin inserta facturas" on public.facturas;
drop policy if exists "Admin ve todas las facturas, clientes ven las suyas" on public.facturas;
drop policy if exists "Admin actualiza facturas" on public.facturas;
drop policy if exists "Admin elimina facturas" on public.facturas;

-- plantillas
drop policy if exists "Tecnicos pueden gestionar plantillas" on public.plantillas;
drop policy if exists "Clientes pueden ver plantillas" on public.plantillas;
drop policy if exists "Admin gestiona plantillas" on public.plantillas;

-- checklist_resultados
drop policy if exists "Tecnicos pueden gestionar checklist" on public.checklist_resultados;
drop policy if exists "Clientes pueden ver checklist de sus equipos" on public.checklist_resultados;
drop policy if exists "Admin y tecnicos gestionan checklist" on public.checklist_resultados;

-- fotos_mantenimiento
drop policy if exists "Tecnicos pueden gestionar fotos" on public.fotos_mantenimiento;
drop policy if exists "Clientes pueden ver fotos de sus equipos" on public.fotos_mantenimiento;
drop policy if exists "Admin y tecnicos gestionan fotos" on public.fotos_mantenimiento;

-- profiles
drop policy if exists "Usuarios ven su propio perfil" on public.profiles;
drop policy if exists "Usuarios actualizan su propio perfil" on public.profiles;
drop policy if exists "Tecnicos ven todos los perfiles" on public.profiles;
drop policy if exists "Tecnicos pueden actualizar cualquier perfil" on public.profiles;

-- 1. Cambiar columna role de user_role enum a text (si aun no se hizo)
do $$
begin
  if exists (
    select 1 from pg_type t
    join pg_attribute a on a.atttypid = t.oid
    where t.typname = 'user_role'
    and a.attrelid = 'public.profiles'::regclass
    and a.attname = 'role'
  ) then
    alter table public.profiles
      alter column role drop default,
      alter column role type text using role::text,
      alter column role set default 'cliente';
  end if;
end $$;

-- 2. Renombrar 'tecnico' existente a 'administrador'
update public.profiles set role = 'administrador' where role = 'tecnico';

-- 3. Actualizar trigger handle_new_user (sin cast a enum)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, nombre, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'cliente'),
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- 4. Recrear RLS policies para 3 roles

-- Equipos
create policy "Admin y tecnicos pueden insertar equipos"
  on public.equipos for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('administrador', 'tecnico'))
  );

create policy "Admin ve todos los equipos, tecnicos ven todos, clientes ven los suyos"
  on public.equipos for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('administrador', 'tecnico'))
    or cliente_id = auth.uid()
  );

create policy "Admin y tecnicos actualizan equipos"
  on public.equipos for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('administrador', 'tecnico'))
  );

create policy "Admin y tecnicos eliminan equipos"
  on public.equipos for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('administrador', 'tecnico'))
  );

-- Mantenimientos
create policy "Admin y tecnicos insertan mantenimientos"
  on public.mantenimientos for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('administrador', 'tecnico'))
  );

create policy "Admin ve todos, tecnicos ven los suyos, clientes ven visibles"
  on public.mantenimientos for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador')
    or (exists (select 1 from public.profiles where id = auth.uid() and role = 'tecnico') and tecnico_id = auth.uid())
    or (exists (
      select 1 from public.equipos
      where equipos.id = mantenimientos.equipo_id
      and equipos.cliente_id = auth.uid()
    ) and visible_para_cliente = true)
  );

create policy "Admin actualiza mantenimientos"
  on public.mantenimientos for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador')
  );

create policy "Admin elimina mantenimientos"
  on public.mantenimientos for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador')
  );

-- Facturas
create policy "Admin inserta facturas"
  on public.facturas for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador')
  );

create policy "Admin ve todas las facturas, clientes ven las suyas"
  on public.facturas for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador')
    or cliente_id = auth.uid()
  );

create policy "Admin actualiza facturas"
  on public.facturas for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador')
  );

create policy "Admin elimina facturas"
  on public.facturas for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador')
  );

-- Plantillas
create policy "Admin gestiona plantillas"
  on public.plantillas for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador')
  );

create policy "Clientes pueden ver plantillas"
  on public.plantillas for select
  using (true);

-- Checklist resultados
create policy "Admin y tecnicos gestionan checklist"
  on public.checklist_resultados for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('administrador', 'tecnico'))
  );

create policy "Clientes pueden ver checklist de sus equipos"
  on public.checklist_resultados for select
  using (exists (
    select 1 from public.mantenimientos m
    join public.equipos e on e.id = m.equipo_id
    where m.id = checklist_resultados.mantenimiento_id
    and e.cliente_id = auth.uid()
  ));

-- Fotos mantenimiento
create policy "Admin y tecnicos gestionan fotos"
  on public.fotos_mantenimiento for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('administrador', 'tecnico'))
  );

create policy "Clientes pueden ver fotos de sus equipos"
  on public.fotos_mantenimiento for select
  using (exists (
    select 1 from public.mantenimientos m
    join public.equipos e on e.id = m.equipo_id
    where m.id = fotos_mantenimiento.mantenimiento_id
    and e.cliente_id = auth.uid()
  ));

-- Profiles
create policy "Usuarios ven su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuarios actualizan su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Tecnicos ven todos los perfiles"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('administrador', 'tecnico')
    )
  );

create policy "Tecnicos pueden actualizar cualquier perfil"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('administrador', 'tecnico')
    )
  );
