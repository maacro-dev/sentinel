create or replace function public.log_activity_change()
returns trigger
security definer
set search_path = ''
language plpgsql
as $$
declare
  _evt text;
  _old jsonb;
  _new jsonb;
  _rec text;
  _actor uuid;
  _details jsonb;
  _mfid_text text;
  _collector_name text;
  _old_collector_name text;
begin

  if nullif(current_setting('app.import_mode', true), '') = 'true' then
    return coalesce(new, old);
  end if;


  if tg_table_schema = 'auth' then return coalesce(new, old); end if;

  if tg_op = 'INSERT' then
    _new := pg_catalog.to_jsonb(new);
    _old := null;
    _rec := _new ->> 'id';
    _evt := tg_table_name || '_created';
  elsif tg_op = 'UPDATE' then
    _old := pg_catalog.to_jsonb(old);
    _new := pg_catalog.to_jsonb(new);
    _rec := coalesce(_new ->> 'id', _old ->> 'id');
    if tg_table_name = 'field_activities' and (_old ->> 'verified') is distinct from (_new ->> 'verified') then
      _evt := 'field_activity_verified';
    else
      _evt := tg_table_name || '_updated';
    end if;
  elsif tg_op = 'DELETE' then
    _old := pg_catalog.to_jsonb(old);
    _new := null;
    _rec := _old ->> 'id';
    _evt := tg_table_name || '_deleted';
  else
    return coalesce(new, old);
  end if;

  begin
    _actor := nullif(pg_catalog.current_setting('app.current_user_id', true),'')::uuid;
  exception when others then _actor := null; end;

  begin
    _details := jsonb_build_object('trigger_table', tg_table_name, 'op', lower(tg_op));

    if tg_table_name = 'field_activities' and _evt = 'field_activity_verified' then
      with activity_data as (
        select
          fa.activity_type,
          s.label as season_label,
          f.mfid
        from public.field_activities fa
        join public.fields f on f.id = fa.field_id
        left join public.seasons s on s.id = fa.season_id
        where fa.id = (case when tg_op = 'DELETE' then old.id else new.id end)
      )
      select
        coalesce(jsonb_agg(jsonb_build_object(
          'activity_type', activity_type,
          'season', season_label,
          'mfid', mfid
        )), '[]'::jsonb) -> 0
      into _details
      from activity_data;

      _details := _details || jsonb_build_object(
        'verification_status', _new->>'verification_status',
        'verified_by', _new->>'verified_by',
        'verified_at', _new->>'verified_at',
        'remarks', _new->>'remarks'
      );
    end if;

   if tg_table_name = 'collection_tasks' then
      if tg_op = 'INSERT' then
        select m.mfid, coalesce(u.raw_user_meta_data->>'full_name', u.email) as collector_name
        into _mfid_text, _collector_name
        from public.mfids m
        left join auth.users u on u.id = new.collector_id
        where m.id = new.mfid_id;

      elsif tg_op = 'UPDATE' then
        -- Get MFID text
        select m.mfid into _mfid_text
        from public.mfids m
        where m.id = coalesce(new.mfid_id, old.mfid_id);

        -- Get new collector name
        if new.collector_id is not null then
          select coalesce(u.raw_user_meta_data->>'full_name', u.email) into _collector_name
          from auth.users u
          where u.id = new.collector_id;
        end if;

        -- Get old collector name (only if collector changed)
        if old.collector_id is distinct from new.collector_id then
          select coalesce(u.raw_user_meta_data->>'full_name', u.email) into _old_collector_name
          from auth.users u
          where u.id = old.collector_id;
        end if;

      elsif tg_op = 'DELETE' then
        select m.mfid, coalesce(u.raw_user_meta_data->>'full_name', u.email) as collector_name
        into _mfid_text, _collector_name
        from public.mfids m
        left join auth.users u on u.id = old.collector_id
        where m.id = old.mfid_id;
      end if;

      -- Add MFID to details
      if _mfid_text is not null then
        _details := _details || jsonb_build_object('mfid', _mfid_text);
      end if;
      -- Add current collector name
      if _collector_name is not null then
        _details := _details || jsonb_build_object('collector_name', _collector_name);
      end if;
      -- Add old collector name (for reassignment)
      if _old_collector_name is not null then
        _details := _details || jsonb_build_object('old_collector_name', _old_collector_name);
      end if;
    end if;

    if nullif(pg_catalog.current_setting('app.import_batch_id', true),'') is not null then
      _details := _details || jsonb_build_object('import_batch_id', pg_catalog.current_setting('app.import_batch_id', true));
    end if;
  exception when others then
    _details := jsonb_build_object('trigger_table', tg_table_name);
  end;

  begin
    insert into public.activity_logs(
      occurred_at, user_id, event_type, table_name, record_id, action, old_data, new_data, details
    ) values (
      now(), _actor, _evt, tg_table_name, _rec, lower(tg_op), _old, _new, _details
    );
  exception when others then
    -- Optionally log to a separate error table
    raise warning 'Activity log insert failed: %', sqlerrm;
  end;

  return coalesce(new, old);
end;
$$;