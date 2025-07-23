-- Users [READ]
create policy "Allow logged-in read access"
  on users
  as permissive
  for select
  to public
  using ( auth.uid() = id );

-- Users [INSERT]
create policy "Allow individual insert access"
  on users
  as permissive
  for insert
  to public
  with check ( auth.uid() = id );

create policy "Allow individual update access"
  on users
  as permissive
  for update
  to public
  using ( auth.uid() = id );

create policy "Allow authenticated to read farmers"
  on farmers
  as permissive
  for select
  to authenticated
  using ( auth.uid() = id );

create policy "Allow authenticated to read field_activities"
  on field_activities
  as permissive
  for select
  to authenticated
  using ( auth.uid() = id );

create policy "Allow authenticated to read seasons"
  on seasons
  as permissive
  for select
  to authenticated
  using ( auth.uid() = id );

create policy "Allow data_manager to update verification"
  on field_activities
  as permissive
  for update
  to authenticated
  using (auth.role() = 'data_manager' and verified_by is null)
  with check (verification_status in ('approved', 'rejected') and verified_by = auth.uid());

grant select on user_details to authenticated;
grant select on users to authenticated, public;

grant select on fields to authenticated, public;
grant select on farmers to authenticated, public;
grant select on field_activities to authenticated, public;
grant select on seasons to authenticated, public;


grant all privileges on users to service_role;
grant all privileges on user_details to service_role;


alter default privileges in schema public
grant all on tables to service_role;


-- analytics schema
grant usage on schema analytics to anon, authenticated, service_role;
grant all on all tables in schema analytics to anon, authenticated, service_role;
grant all on all routines in schema analytics to anon, authenticated, service_role;
grant all on all sequences in schema analytics to anon, authenticated, service_role;
alter default privileges for role postgres in schema analytics grant all on tables to anon, authenticated, service_role;
alter default privileges for role postgres in schema analytics grant all on routines to anon, authenticated, service_role;
alter default privileges for role postgres in schema analytics grant all on sequences to anon, authenticated, service_role;

grant all privileges on all tables in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
