-- -- Users [READ]
-- create policy "Allow logged-in read access"
--   on users
--   as permissive
--   for select
--   to public
--   using ( auth.uid() = id );

-- -- Users [INSERT]
-- create policy "Allow individual insert access"
--   on users
--   as permissive
--   for insert
--   to public
--   with check ( auth.uid() = id );

-- create policy "Allow individual update access"
--   on users
--   as permissive
--   for update
--   to public
--   using ( auth.uid() = id );

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE barangays ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities_municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;

ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_plannings ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertilization_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertilizer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_visits ENABLE ROW LEVEL SECURITY;

create policy "Allow authenticated to read users"
  on users
  as permissive
  for select
  to authenticated
  using (true);

create policy "Allow authenticated to read barangays"
  on barangays
  as permissive
  for select
  to authenticated
  using (true);

create policy "Allow authenticated to read cities_municipalities"
  on cities_municipalities
  as permissive
  for select
  to authenticated
  using (true);

create policy "Allow authenticated to read provinces"
  on provinces
  as permissive
  for select
  to authenticated
  using (true);

create policy "Allow authenticated to read farmers"
  on farmers
  as permissive
  for select
  to authenticated
  using (true);

create policy "Allow authenticated to read fields"
  on fields
  as permissive
  for select
  to authenticated
  using (true);

create policy "Allow authenticated to read seasons"
  on seasons
  as permissive
  for select
  to authenticated
  using (true);

create policy "Allow authenticated to read field_activities"
  on field_activities
  as permissive
  for select
  to authenticated
  using (true);

create policy "Allow authenticated to read field_plannings"
  on field_plannings
  as permissive
  for select
  to authenticated
  using (true);

create policy "Allow authenticated to read crop_establishments"
  on crop_establishments
  as permissive
  for select
  to authenticated
  using (true);

create policy "Allow authenticated to read fertilization_records"
  on fertilization_records
  as permissive
  for select
  to authenticated
  using (true);

create policy "Allow authenticated to read fertilizer_applications"
  on fertilizer_applications
  as permissive
  for select
  to authenticated
  using (true);

create policy "Allow authenticated to read harvest_records"
  on harvest_records
  as permissive
  for select
  to authenticated
  using (true);

create policy "Allow authenticated to read damage_assessments"
  on damage_assessments
  as permissive
  for select
  to authenticated
  using (true);

create policy "Allow authenticated to read monitoring visits"
  on monitoring_visits
  as permissive
  for select
  to authenticated
  using (true);


-- views
grant select on field_details to authenticated;
grant select on user_details to authenticated;
grant select on field_data_details to authenticated;
grant select on field_activity_details to authenticated;
grant select on analytics.dashboard_barangay_yield_rankings to authenticated;
grant select on analytics.trend_data_collection to authenticated;
grant select on analytics.trend_overall_yield to authenticated;
grant select on analytics.summary_form_count to authenticated;


grant select on users to authenticated;

grant select on barangays to authenticated;
grant select on cities_municipalities to authenticated;
grant select on provinces to authenticated;
grant select on users to authenticated, public;
grant select on farmers to authenticated;
grant select on fields to authenticated;
grant select on seasons to authenticated;
grant select on field_activities to authenticated;
grant select on field_plannings to authenticated;
grant select on crop_establishments to authenticated;
grant select on fertilization_records to authenticated;
grant select on fertilizer_applications to authenticated;
grant select on harvest_records to authenticated;
grant select on damage_assessments to authenticated;
grant select on monitoring_visits to authenticated;


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
