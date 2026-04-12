create or replace function update_modified_column()
    returns trigger
    security definer
    set search_path = ''
    as $$
begin
    new.updated_at = now();
    return new;
end;
$$
language plpgsql;

create trigger update_field_activities
    before update on public.field_activities for each row
    execute function update_modified_column();

create trigger update_collection_tasks
    before update on public.collection_tasks for each row
    execute function update_modified_column();

create trigger update_farmers
    before update on public.farmers for each row
    execute function update_modified_column();

create trigger update_fields
    before update on public.fields for each row
    execute function update_modified_column();

create trigger update_users
    before update on public.users for each row
    execute function update_modified_column();
