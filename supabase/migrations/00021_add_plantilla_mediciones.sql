-- 00021_add_plantilla_mediciones.sql
-- Separa la lista de chequeo en dos bloques: checklist binario (Cumple/No cumple)
-- y mediciones cuantitativas (parámetro + unidad + valor).

-- 1. Nueva columna `mediciones` en plantillas (JSONB)
alter table public.plantillas
  add column if not exists mediciones jsonb not null default '[]'::jsonb;

-- 2. Migración de datos antiguos en checklist_resultados.
--    Formato anterior: arreglo [ { nombre, categoria, resultado: ok|falla|na, observacion } ]
--    Formato nuevo:    { checklist: [ { itemId, nombre, cumple, observacion } ], mediciones: [] }
do $$
declare
  rec record;
  nuevos jsonb;
  nuevos_items jsonb;
  item jsonb;
begin
  for rec in
    select id, resultados
    from public.checklist_resultados
    where resultados is not null
      and jsonb_typeof(resultados) = 'array'
  loop
    nuevos_items := '[]'::jsonb;
    for item in select * from jsonb_array_elements(rec.resultados)
    loop
      nuevos_items := nuevos_items || jsonb_build_object(
        'itemId', gen_random_uuid(),
        'nombre', coalesce(item->>'nombre', ''),
        'cumple', coalesce(item->>'resultado', '') = 'ok',
        'observacion', coalesce(item->>'observacion', '')
      );
    end loop;
    nuevos := jsonb_build_object('checklist', nuevos_items, 'mediciones', '[]'::jsonb);
    update public.checklist_resultados
      set resultados = nuevos
      where id = rec.id;
  end loop;
end $$;

-- 3. Normalizar resultados que ya vengan en objeto pero sin clave 'mediciones'
do $$
declare
  rec record;
begin
  for rec in
    select id, resultados
    from public.checklist_resultados
    where resultados is not null
      and jsonb_typeof(resultados) = 'object'
      and not (resultados ? 'mediciones')
  loop
    update public.checklist_resultados
      set resultados = resultados || jsonb_build_object('mediciones', '[]'::jsonb)
      where id = rec.id;
  end loop;
end $$;
