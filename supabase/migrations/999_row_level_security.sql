alter table users enable row level security;

alter table barangays enable row level security;

alter table cities_municipalities enable row level security;

alter table provinces enable row level security;

alter table farmers enable row level security;

alter table fields enable row level security;

alter table seasons enable row level security;

alter table field_activities enable row level security;

alter table field_plannings enable row level security;

alter table crop_establishments enable row level security;

alter table fertilization_records enable row level security;

alter table fertilizer_applications enable row level security;

alter table harvest_records enable row level security;

alter table damage_assessments enable row level security;

alter table monitoring_visits enable row level security;

alter table collection_tasks enable row level security;

alter table activity_logs enable row level security;

alter table system_audit_logs enable row level security;

alter table mfids enable row level security;

alter table predicted_yields enable row level security;

alter table notifications enable row level security;

create policy "Allow authenticated to read users" on users as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to read barangays" on barangays as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to read cities_municipalities" on cities_municipalities as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to read provinces" on provinces as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to read farmers" on farmers as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to insert farmers" on farmers as permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

create policy "Allow authenticated to update farmers" on farmers as permissive
    for update to authenticated using (TRUE);

create policy "Allow authenticated to read fields" on fields as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to insert fields" on fields as permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

create policy "Allow authenticated to update fields" on fields as permissive
    for update to authenticated using (TRUE);

create policy "Allow authenticated to read seasons" on seasons as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to read field_activities" on field_activities as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to insert field_activities" on field_activities as permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

create policy "Allow authenticated to update field_activities" on field_activities as permissive
    for update to authenticated using (TRUE);

create policy "Allow authenticated to read field_plannings" on field_plannings as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to insert field_plannings" on field_plannings as permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

create policy "Allow authenticated to update field_plannings" on field_plannings as permissive
    for update to authenticated using (TRUE);

create policy "Allow authenticated to read crop_establishments" on crop_establishments as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to insert crop_establishments" on crop_establishments as permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

create policy "Allow authenticated to update crop_establishments" on crop_establishments as permissive
    for update to authenticated using (TRUE);

create policy "Allow authenticated to read fertilization_records" on fertilization_records as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to insert fertilization_records" on fertilization_records as permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

create policy "Allow authenticated to update fertilization_records" on fertilization_records as permissive
    for update to authenticated using (TRUE);

create policy "Allow authenticated to read fertilizer_applications" on fertilizer_applications as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to insert fertilizer_applications" on fertilizer_applications as permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

create policy "Allow authenticated to update fertilizer_applications" on fertilizer_applications as permissive
    for update to authenticated using (TRUE);

create policy "Allow authenticated to read harvest_records" on harvest_records as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to insert harvest_records" on harvest_records as permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

create policy "Allow authenticated to update harvest_records" on harvest_records as permissive
    for update to authenticated using (TRUE);

create policy "Allow authenticated to read damage_assessments" on damage_assessments as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to insert damage_assessments" on damage_assessments as permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

create policy "Allow authenticated to update damage_assessments" on damage_assessments as permissive
    for update to authenticated using (TRUE);

create policy "Allow authenticated to read monitoring visits" on monitoring_visits as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to insert monitoring visits" on monitoring_visits as permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

create policy "Allow authenticated to update monitoring visits" on monitoring_visits as permissive
    for update to authenticated using (TRUE);

create policy "Allow authenticated to read system audit logs" on system_audit_logs as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to insert system audit logs" on system_audit_logs as permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

create policy "Allow authenticated to update system audit logs" on system_audit_logs as permissive
    for update to authenticated using (TRUE);

create policy "Allow authenticated to read activity logs" on activity_logs as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to insert activity logs" on activity_logs as permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

create policy "Allow authenticated to update activity logs" on activity_logs as permissive
    for update to authenticated using (TRUE);

create policy "Allow authenticated to read tasks" on collection_tasks as permissive
    FOR SELECT TO authenticated using (TRUE);

create policy "Allow authenticated to insert tasks" on collection_tasks as permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

create policy "Allow authenticated to update tasks" on collection_tasks as permissive
    for update to authenticated using (TRUE);


create policy "Users can view notifications" on public.notifications for select to authenticated using (true);

create policy "Only triggers can insert" on public.notifications for insert with check (false);


-- storage start --

create policy "allow authenticated uploads" on storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'form-images');

create policy "allow authenticated reads" on storage.objects
    FOR SELECT TO authenticated using (bucket_id = 'form-images');

create policy "Allow authenticated users to update files in form-images" on storage.objects
    for update to authenticated using (bucket_id = 'form-images') WITH CHECK ( bucket_id = 'form-images');

create policy "Allow authenticated to delete tasks" on collection_tasks as permissive
    FOR DELETE TO authenticated using (TRUE);

-- storage end --

grant select on field_details to authenticated;

grant select on user_details to authenticated;

grant select on mfid_details to authenticated;

grant select on field_activity_details to authenticated;

grant select on users to authenticated;

grant select on barangays to authenticated;

grant select on cities_municipalities to authenticated;

grant select on provinces to authenticated;

grant select on users to authenticated, public;

grant select on farmers to authenticated;

grant select on fields to authenticated;

grant select on seasons to authenticated;

grant select on field_activities to authenticated;

grant select on collection_details to authenticated;

grant select on field_plannings to authenticated;

grant select on crop_establishments to authenticated;

grant select on fertilization_records to authenticated;

grant select on fertilizer_applications to authenticated;

grant select, insert, update, delete on table collection_tasks to authenticated;

grant select on harvest_records to authenticated;

grant select on damage_assessments to authenticated;

grant select on monitoring_visits to authenticated;

grant select, insert on table activity_logs to authenticated;

grant select on activity_logs_view to authenticated;

grant select on system_audit_logs_view to authenticated;

grant select, insert on table system_audit_logs to authenticated;

grant all privileges on users to service_role;

grant all privileges on user_details to service_role;

alter default privileges in schema public grant all on tables to service_role;

grant usage on schema spatial to anon, authenticated, service_role;

grant select, insert, update on all tables in schema public to authenticated;

grant select, insert, update on all tables in schema public to anon;

grant all privileges on all tables in schema public to service_role;

alter default privileges in schema public grant all on tables to service_role;

grant execute on all functions in schema realtime to service_role;

