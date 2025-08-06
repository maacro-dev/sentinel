
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


create or replace function update_modified_column()
  returns trigger
  security definer
  set search_path = ''
as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger update_field_activities before update on public.field_activities for each row execute function update_modified_column();
create trigger update_farmers before update on public.farmers for each row execute function update_modified_column();
create trigger update_fields before update on public.fields for each row execute function update_modified_column();
create trigger update_users before update on public.users for each row execute function update_modified_column();
