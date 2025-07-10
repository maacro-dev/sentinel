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