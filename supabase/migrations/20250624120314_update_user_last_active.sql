create or replace function update_user_last_active(uid int)
returns void as $$
begin
  update
    users
  set
    last_active = now()
  where id = uid;
end;
$$ language plpgsql;
