
create table if not exists public.system_audit_logs (
  id bigserial primary key,
  occurred_at timestamptz not null default now(),
  user_id uuid,                 -- actor/admin
  event_type text not null,     -- e.g. login_success, user_created
  target_user_id uuid,          -- affected user (if any)
  table_name text,              -- optional source table
  record_id text,               -- optional PK of affected row
  action text,                  -- insert/update/delete/custom
  details jsonb                 -- raw payload or extra metadata
);

create index if not exists idx_system_audit_logs_time on public.system_audit_logs(occurred_at);
create index if not exists idx_system_audit_logs_user on public.system_audit_logs(user_id);
create index if not exists idx_system_audit_logs_target on public.system_audit_logs(target_user_id);

create table if not exists public.activity_logs (
  id bigserial primary key,
  occurred_at timestamptz not null default now(),
  user_id uuid,                 -- actor inside app
  event_type text not null,     -- e.g. farmer_created, form_approved
  table_name text,              -- source table
  record_id text,               -- affected row id
  action text,                  -- insert/update/delete/custom
  old_data jsonb,
  new_data jsonb,
  details jsonb                 -- extra metadata (e.g. batch_id)
);

create index if not exists idx_activity_logs_time on public.activity_logs(occurred_at);
create index if not exists idx_activity_logs_user on public.activity_logs(user_id);
create index if not exists idx_activity_logs_record on public.activity_logs(table_name, record_id);

create or replace view public.system_audit_logs_view
 as
select
  l.id,
  l.occurred_at,
  l.user_id,
  u.email as user_email,
  concat(u.first_name, ' ', u.last_name) as user_name,
  l.event_type,
  l.target_user_id,
  case
    when tu.email is not null then tu.email
    else (l.details::jsonb #>> '{old_data,email}')
  end as target_user_email,
  case
    when tu.first_name is not null then concat(tu.first_name, ' ', tu.last_name)
    else (l.details::jsonb #>> '{old_data,first_name}') || ' ' || (l.details::jsonb #>> '{old_data,last_name}')
  end as target_user_name,
  l.table_name,
  l.record_id,
  l.action,
  l.details
from public.system_audit_logs l
left join public.user_details u on l.user_id = u.id
left join public.user_details tu on l.target_user_id = tu.id;

create or replace view public.activity_logs_view
 as
select
  l.id,
  l.occurred_at,
  l.user_id,
  u.email as user_email,
  concat(u.first_name, ' ', u.last_name) as user_name,
  l.event_type,
  l.table_name,
  l.record_id,
  l.action,
  l.old_data,
  l.new_data,
  l.details
from public.activity_logs l
left join public.user_details u on l.user_id = u.id;


create or replace function public.log_system_change()
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
  _target uuid;
  _details jsonb;
begin
  if tg_table_schema = 'auth' then return coalesce(new, old); end if;

  if tg_op = 'INSERT' then
    _new := pg_catalog.to_jsonb(new);
    _old := null;
    _rec := _new ->> 'id';
    _evt := tg_table_name || '_created';
    _details := jsonb_build_object('new_data', _new);
  elsif tg_op = 'UPDATE' then
    _old := pg_catalog.to_jsonb(old);
    _new := pg_catalog.to_jsonb(new);
    _rec := coalesce(_new ->> 'id', _old ->> 'id');
    _evt := tg_table_name || '_updated';
    _details := jsonb_build_object('old_data', _old, 'new_data', _new);
  elsif tg_op = 'DELETE' then
    _old := pg_catalog.to_jsonb(old);
    _new := null;
    _rec := _old ->> 'id';
    _evt := tg_table_name || '_deleted';
    _details := jsonb_build_object('old_data', _old);
  else
    return coalesce(new, old);
  end if;

  _details := _details || jsonb_build_object(
    'trigger_table_schema', tg_table_schema,
    'trigger_table_name', tg_table_name,
    'trigger_name', tg_name,
    'op', lower(tg_op)
  );

  if nullif(pg_catalog.current_setting('app.import_batch_id', true),'') is not null then
    _details := _details || jsonb_build_object('import_batch_id', pg_catalog.current_setting('app.import_batch_id', true));
  end if;

  begin
    _actor := nullif(pg_catalog.current_setting('app.current_user_id', true),'')::uuid;
  exception when others then _actor := null; end;

  begin
    _target := nullif(_rec,'')::uuid;
  exception when others then _target := null; end;

  begin
    insert into public.system_audit_logs(
      occurred_at, user_id, event_type, target_user_id, table_name, record_id, action, details
    ) values (
      now(), _actor, _evt, _target, tg_table_name, _rec, lower(tg_op), _details
    );

  return coalesce(new, old);
  end;
end;
$$;


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



drop trigger if exists system_users_trigger on public.users;
create trigger system_users_trigger
  after insert or update or delete on public.users
  for each row execute function public.log_system_change();

drop trigger if exists activity_collection_tasks on public.collection_tasks;
create trigger activity_collection_tasks
  after insert or update or delete on public.collection_tasks
  for each row execute function public.log_activity_change();

-- drop trigger if exists activity_field_activities on public.field_activities;
-- create trigger activity_field_activities
--   after insert or update or delete on public.field_activities
--   for each row execute function public.log_activity_change();


create or replace function public.sync_auth_audit_entries()
returns integer
language sql
security definer
set search_path = ''
as $$
    insert into public.system_audit_logs(
        occurred_at, user_id, event_type, target_user_id, table_name, record_id, action, details
    )
    select
        created_at,
        (payload->>'actor_id')::uuid,
        coalesce(payload->>'action', payload->>'type', 'auth_event'),
        nullif((payload->>'actor_id'), '')::uuid,
        'auth.audit_log_entries',
        (payload->>'actor_id')::text,
        payload->>'action',
        jsonb_build_object('entry_payload', payload, 'entry_id', auth.audit_log_entries.id)
    from auth.audit_log_entries
    where payload->>'action' in ('login', 'logout', 'user_updated_password', 'user_recovery_requested')
      and not exists (
          select 1 from public.system_audit_logs s
          where s.details->>'entry_id' = auth.audit_log_entries.id::text
      )
    returning 1;
$$;


create index if not exists idx_activity_logs_event_time on public.activity_logs(event_type, occurred_at);
create index if not exists idx_system_audit_logs_event_type on public.system_audit_logs(event_type, occurred_at);


SELECT cron.schedule( 'sync-auth-audit-5min', '*/5 * * * *', $$ SELECT public.sync_auth_audit_entries(); $$);
