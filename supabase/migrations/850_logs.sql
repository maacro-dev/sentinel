
set search_path = public, pg_catalog;

-- system audit logs (admin/user management events)
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

-- activity logs (business/application events)
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

-- emergency audit errors
create table if not exists public.audit_errors (
  id bigserial primary key,
  occurred_at timestamptz not null default now(),
  function_name text,
  error_text text,
  payload jsonb
);
create index if not exists idx_audit_errors_time on public.audit_errors(occurred_at);


create or replace view public.system_audit_logs_view as
select
  l.id,
  l.occurred_at,
  l.user_id,
  u.email as user_email,
  concat(u.first_name, ' ', u.last_name) as user_name,
  l.event_type,
  l.target_user_id,
  tu.email as target_user_email,
  concat(tu.first_name, ' ', tu.last_name) as target_user_name,
  l.table_name,
  l.record_id,
  l.action,
  l.details
from public.system_audit_logs l
left join public.user_details u on l.user_id = u.id
left join public.user_details tu on l.target_user_id = tu.id;

-- View for activity logs with user names
create or replace view public.activity_logs_view as
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


-- log system changes (for user-management/admin triggers)
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

  -- Add trigger metadata
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
  exception when others then
    begin
      insert into public.audit_errors(function_name, error_text, payload)
      values ('log_system_change', sqlerrm, jsonb_build_object('table', tg_table_name, 'rec', _rec));
    exception when others then null; end;
    return coalesce(new, old);
  end;

  return coalesce(new, old);
end;
$$;


-- log activity changes (for business tables)
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
begin
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
    -- special case: domain-level events
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
    begin
      insert into public.audit_errors(function_name, error_text, payload)
      values ('log_activity_change', sqlerrm, jsonb_build_object('table', tg_table_name, 'rec', _rec));
    exception when others then null; end;
    return coalesce(new, old);
  end;

  return coalesce(new, old);
end;
$$;


-- system audit: user table
drop trigger if exists system_users_trigger on public.users;
create trigger system_users_trigger
  after insert or update or delete on public.users
  for each row execute function public.log_system_change();

-- activity triggers (business tables)
drop trigger if exists activity_farmers on public.farmers;
create trigger activity_farmers
  after insert or update or delete on public.farmers
  for each row execute function public.log_activity_change();

drop trigger if exists activity_fields on public.fields;
create trigger activity_fields
  after insert or update or delete on public.fields
  for each row execute function public.log_activity_change();

drop trigger if exists activity_field_activities on public.field_activities;
create trigger activity_field_activities
  after insert or update or delete on public.field_activities
  for each row execute function public.log_activity_change();


-- sync auth.audit_log_entries -> system_audit_logs (run this periodically)
create or replace function public.sync_auth_audit_entries()
returns integer
language sql
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
where (payload->>'action') is not null
  and not exists (
    select 1 from public.system_audit_logs s where s.details->>'entry_id' = auth.audit_log_entries.id::text
  )
returning 1;
$$;


create index if not exists idx_activity_logs_event_time on public.activity_logs(event_type, occurred_at);
create index if not exists idx_system_audit_logs_event_type on public.system_audit_logs(event_type, occurred_at);

