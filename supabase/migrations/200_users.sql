create table users(
    id              uuid not null references auth.users primary key,
    role            user_role not null,
    first_name      text not null,
    last_name       text not null,
    is_active       boolean not null default true,
    date_of_birth   date not null,
    created_at      timestamptz not null default now() ,
    updated_at      timestamptz not null default now()
);

create or replace view user_details as
    select
        v_user.*,
        auth_user.email,
        auth_user.last_sign_in_at
    from users v_user
    join auth.users auth_user on v_user.id = auth_user.id;

create view public.user_backup_view as
select
    v_user.id,
    v_user.role,
    v_user.first_name,
    v_user.last_name,
    v_user.is_active,
    v_user.date_of_birth,
    v_user.created_at as user_created_at,
    v_user.updated_at as user_updated_at,
    auth_user.email,
    auth_user.last_sign_in_at,
    auth_user.encrypted_password,
    auth_user.created_at as auth_created_at,
    auth_user.updated_at as auth_updated_at
from public.users v_user
join auth.users auth_user on v_user.id = auth_user.id;



create function public.handle_new_user()
    returns trigger
    language plpgsql
    security definer
    set search_path = ''
    as $$
begin
    insert into public.users(id, first_name, last_name, role, date_of_birth, is_active)
    values(
        new.id,
        coalesce(new.raw_user_meta_data ->> 'first_name', 'n/a'),
        coalesce(new.raw_user_meta_data ->> 'last_name', 'n/a'),
        coalesce(new.raw_user_meta_data ->> 'role', 'pending')::public.user_role,
        coalesce((new.raw_user_meta_data ->> 'date_of_birth')::date, current_date),
        coalesce((new.raw_user_meta_data ->> 'is_active')::boolean, true)
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

create or replace trigger on_auth_user_created
    after insert on auth.users for each row
    execute procedure public.handle_new_user();



create or replace function public.handle_user_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if (new.raw_user_meta_data is distinct from old.raw_user_meta_data) then
        update public.users
        set
            first_name = coalesce(new.raw_user_meta_data->>'first_name', first_name),
            last_name = coalesce(new.raw_user_meta_data->>'last_name', last_name),
            role = coalesce((new.raw_user_meta_data->>'role')::public.user_role, role),
            is_active = coalesce((new.raw_user_meta_data->>'is_active')::boolean, is_active),
            updated_at = now()
        where id = new.id;
    end if;
    return new;
end;
$$;

create trigger on_auth_user_updated
    after update of raw_user_meta_data on auth.users
    for each row
    execute procedure public.handle_user_update();
