
create or replace function update_modified_column()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger update_field_activities before update on field_activities for each row execute function update_modified_column();
create trigger update_farmers before update on farmers for each row execute function update_modified_column();
create trigger update_fields before update on fields for each row execute function update_modified_column();
create trigger update_users before update on users for each row execute function update_modified_column();