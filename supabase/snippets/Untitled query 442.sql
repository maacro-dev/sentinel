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
