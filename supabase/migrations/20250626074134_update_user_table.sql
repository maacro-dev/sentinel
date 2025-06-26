alter table public.users
  add column auth_id uuid unique
   references auth.users(id) on delete cascade;

update public.users u
set auth_id = a.id
from auth.users a
where a.email = (u.username || '@humayapp.com');

alter table public.users
  alter column auth_id set not null;
