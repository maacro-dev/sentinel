create or replace function fetch_user_by_username(arg text)
returns record as $$
declare
  result record;
begin
  select
    u.id,
    u.email,
    u.username,
    u.first_name,
    u.last_name,
    r.name as role
  into result
  from users u
  left join roles r on u.role_id = r.id
  where u.username = arg
  limit 1;

  return result;
end;
$$ language plpgsql;
