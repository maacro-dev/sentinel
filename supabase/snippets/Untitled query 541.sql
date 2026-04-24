create or replace function batch_schedule_core_collection_tasks(
  p_mfids text[],
  p_season_id int,
  p_collector_id uuid,
  p_start_date date,
  p_end_date date,
  p_user_id uuid default auth.uid()
)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_mfid      text;
  v_mfid_id   int;
  v_next_type text;
  v_types     text[] := array[
    'cultural-management',
    'nutrient-management',
    'production'
  ];
begin
  perform set_config('app.current_user_id', p_user_id::text, true);

  foreach v_mfid in array p_mfids loop
    -- Resolve MFID id
    select id into v_mfid_id from public.mfids where mfid = v_mfid;
    if not found then
      raise notice 'MFID "%" not found, skipping', v_mfid;
      continue;
    end if;

    -- Skip if field-data already exists for this MFID/season
    if exists (
      select 1 from public.collection_tasks
      where mfid_id = v_mfid_id
        and season_id = p_season_id
        and activity_type = 'field-data'
    ) then
      raise notice 'Field data already exists for mfid=%, season=%, skipping', v_mfid, p_season_id;
      continue;
    end if;

    -- Insert field-data task
    insert into public.collection_tasks (
      mfid_id, season_id, activity_type,
      collector_id, start_date, end_date, assigned_at
    ) values (
      v_mfid_id, p_season_id, 'field-data',
      p_collector_id, p_start_date, p_end_date, now()
    );

    -- Insert the other core types (if not already present)
    for i in 1..array_length(v_types, 1) loop
      v_next_type := v_types[i];
      if not exists (
        select 1 from public.collection_tasks
        where mfid_id = v_mfid_id
          and season_id = p_season_id
          and activity_type = v_next_type::public.activity_type
      ) then
        insert into public.collection_tasks (
          mfid_id, season_id, activity_type,
          collector_id, start_date, end_date, assigned_at
        ) values (
          v_mfid_id, p_season_id, v_next_type::public.activity_type,
          p_collector_id,
          p_start_date + (i * interval '1 month'),
          p_end_date   + (i * interval '1 month'),
          now()
        );
      end if;
    end loop;
  end loop;
end;
$$;