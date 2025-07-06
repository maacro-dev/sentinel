
create type public.user_role as enum ('admin', 'data_manager', 'data_collector', 'pending');
create type public.user_status as enum ('active', 'inactive', 'disabled');

create table public.users (
  id            uuid references auth.users not null primary key,
  role          user_role not null default 'pending',
  first_name    text not null,
  last_name     text not null,
  date_of_birth date not null,
  status        user_status default 'active'::public.user_status,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);
comment on table public.users is 'Profile data for each user.';
comment on column public.users.id is 'References the internal Supabase Auth user.';

alter table public.users enable row level security;
create policy "Allow logged-in read access" on public.users for select using ( auth.role() = 'authenticated' );
create policy "Allow individual insert access" on public.users for insert with check ( auth.uid() = id );
create policy "Allow individual update access" on public.users for update using ( auth.uid() = id );

create or replace view public.user_details as
select
  usr.*,
  auth_user.email,
  auth_user.last_sign_in_at
from public.users usr
join auth.users auth_user
  on usr.id = auth_user.id;

-- alter table public.users replica identity full; 

-- create or replace function public.set_updated_at()
-- returns trigger language plpgsql security definer set search_path = public as $$
-- begin
--   new.updated_at := now();
--   return new;
-- end;
-- $$;

-- create trigger trg_users_updated_at
--   before update on public.users
--   for each row execute procedure public.set_updated_at();
