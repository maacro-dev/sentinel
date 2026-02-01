
create table users (
  id            uuid references auth.users not null primary key,
  role          user_role not null,
  first_name    text not null,
  last_name     text not null,
  date_of_birth date not null,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);


-- public.users + internal auth.users
create or replace view user_details as
select
  usr.*,
  auth_user.email,
  auth_user.last_sign_in_at
from users usr
join auth.users auth_user on usr.id = auth_user.id;


create function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  insert into public.users (id, first_name, last_name, role, date_of_birth)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', 'N/A'),
    coalesce(new.raw_user_meta_data->>'last_name', 'N/A'),
    coalesce(new.raw_user_meta_data->>'role', 'pending')::public.user_role,
    coalesce((new.raw_user_meta_data->>'date_of_birth')::date, current_date)
  );
  return new;
end;
$$;


create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
