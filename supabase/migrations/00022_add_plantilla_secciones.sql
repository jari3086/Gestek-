-- 00022_add_plantilla_secciones.sql
-- Reestructura las plantillas en "secciones ordenadas": cada sección es un
-- checklist binario o un bloque de mediciones (con grupos y campos).
-- Esto permite equipos complejos (p. ej. CAVA) con varias listas de
-- verificación y varias matrices de mediciones independientes.

-- 1. Nueva columna `secciones` en plantillas
alter table public.plantillas
  add column if not exists secciones jsonb not null default '[]'::jsonb;

-- 2. Backfill: convertir items/mediciones existentes en secciones
do $$
declare
  rec record;
  contador int;
  nuevas_secciones jsonb;
  nueva_seccion jsonb;
begin
  for rec in
    select id, items, mediciones
    from public.plantillas
    where secciones is null
       or (jsonb_typeof(secciones) = 'array' and jsonb_array_length(secciones) = 0)
  loop
    nuevas_secciones := '[]'::jsonb;
    contador := 0;

    if rec.items is not null
       and jsonb_typeof(rec.items) = 'array'
       and jsonb_array_length(rec.items) > 0 then
      contador := contador + 1;
      nueva_seccion := jsonb_build_object(
        'id', 'sec-' || contador || '-' || replace(rec.id::text, '-', ''),
        'titulo', '',
        'tipo', 'checklist',
        'items', rec.items
      );
      nuevas_secciones := nuevas_secciones || jsonb_build_array(nueva_seccion);
    end if;

    if rec.mediciones is not null
       and jsonb_typeof(rec.mediciones) = 'array'
       and jsonb_array_length(rec.mediciones) > 0 then
      contador := contador + 1;
      nueva_seccion := jsonb_build_object(
        'id', 'sec-' || contador || '-' || replace(rec.id::text, '-', ''),
        'titulo', '',
        'tipo', 'mediciones',
        'grupos', jsonb_build_array(jsonb_build_object('titulo', '', 'campos', rec.mediciones))
      );
      nuevas_secciones := nuevas_secciones || jsonb_build_array(nueva_seccion);
    end if;

    update public.plantillas
      set secciones = nuevas_secciones
      where id = rec.id;
  end loop;
end $$;

-- 3. Migrar resultados de checklist al formato { secciones: [...] }
do $$
declare
  rec record;
  nuevas_secciones jsonb;
  nueva_seccion jsonb;
begin
  for rec in
    select id, resultados
    from public.checklist_resultados
    where resultados is not null
  loop
    if jsonb_typeof(rec.resultados) = 'object' and not (rec.resultados ? 'secciones') then
      nuevas_secciones := '[]'::jsonb;

      if rec.resultados ? 'checklist'
         and jsonb_array_length(rec.resultados -> 'checklist') > 0 then
        nueva_seccion := jsonb_build_object(
          'id', gen_random_uuid(),
          'titulo', '',
          'tipo', 'checklist',
          'items', rec.resultados -> 'checklist'
        );
        nuevas_secciones := nuevas_secciones || jsonb_build_array(nueva_seccion);
      end if;

      if rec.resultados ? 'mediciones'
         and jsonb_array_length(rec.resultados -> 'mediciones') > 0 then
        nueva_seccion := jsonb_build_object(
          'id', gen_random_uuid(),
          'titulo', '',
          'tipo', 'mediciones',
          'grupos', jsonb_build_array(
            jsonb_build_object('titulo', '', 'campos', rec.resultados -> 'mediciones')
          )
        );
        nuevas_secciones := nuevas_secciones || jsonb_build_array(nueva_seccion);
      end if;

      update public.checklist_resultados
        set resultados = jsonb_build_object('secciones', nuevas_secciones)
        where id = rec.id;
    elsif jsonb_typeof(rec.resultados) = 'array' then
      nueva_seccion := jsonb_build_object(
        'id', gen_random_uuid(),
        'titulo', '',
        'tipo', 'checklist',
        'items', rec.resultados
      );
      update public.checklist_resultados
        set resultados = jsonb_build_object('secciones', jsonb_build_array(nueva_seccion))
        where id = rec.id;
    end if;
  end loop;
end $$;
