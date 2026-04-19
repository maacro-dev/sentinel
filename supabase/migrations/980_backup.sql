
create or replace function public.restore_backup(p_backup jsonb)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    table_name text;
    -- Insertion order: parent tables first
    table_order text[] := array[
        'mfids',
        'farmers',
        'fields',
        'seasons',
        'collection_tasks',
        'monitoring_visits',
        'field_activities',
        'field_plannings',
        'crop_establishments',
        'fertilization_records',
        'fertilizer_applications',
        'harvest_records',
        'damage_assessments',
        'notifications',
        'system_audit_logs',
        'activity_logs',
        -- 'audit_errors',
        'predicted_yields'
    ];
begin
    -- Delete in reverse order (children first)
    for i in reverse array_upper(table_order, 1)..1 loop
        table_name := table_order[i];
        if p_backup ? table_name then
            execute format('delete from public.%I', table_name);
        end if;
    end loop;

    -- Insert in forward order (parents first)
    for i in 1..array_upper(table_order, 1) loop
        table_name := table_order[i];
        if p_backup ? table_name then
            execute format('
                insert into public.%I
                select *
                from jsonb_to_recordset($1->%L)
                as %I(%s)
            ', table_name, table_name, table_name, (
                select string_agg(column_name || ' ' || data_type, ', ')
                from information_schema.columns
                where table_schema = 'public'
                  and table_name = table_name
                order by ordinal_position
            ))
            using p_backup;
        end if;
    end loop;

    return jsonb_build_object('success', true);
exception when others then
    return jsonb_build_object('success', false, 'error', sqlerrm);
end;
$$;


create or replace function public.reset_sequence(table_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  seq text;
begin
  select pg_get_serial_sequence('public.' || table_name, 'id')
  into seq;

  if seq is not null then
    execute format(
      'select setval(%L, coalesce((select max(id) from public.%I), 0) + 1, false)',
      seq,
      table_name
    );
  end if;
end;
$$;
