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

-- Users [UPDATE]
create policy "Allow individual update access"
  on users
  as permissive
  for update
  to public
  using ( auth.uid() = id );

grant select on user_details to authenticated;
grant select on users to authenticated, public;

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
