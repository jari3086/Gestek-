create table if not exists public.sedes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.profiles(id) on delete cascade,
  nombre text not null,
  direccion text,
  ciudad text,
  departamento text,
  telefono text,
  email text,
  created_at timestamptz default now()
);

alter table public.sedes enable row level security;

create policy "sedes_select" on public.sedes
  for select using (true);

create policy "sedes_insert" on public.sedes
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador')
  );

create policy "sedes_update" on public.sedes
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador')
  );

create policy "sedes_delete" on public.sedes
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador')
  );

alter table public.equipos
  add column if not exists sede_id uuid references public.sedes(id) on delete set null;
