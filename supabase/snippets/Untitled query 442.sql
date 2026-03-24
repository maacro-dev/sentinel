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
