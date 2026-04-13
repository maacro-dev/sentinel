-- -- Users [READ]
-- create policy "Allow logged-in read access"
-- on users
-- as permissive
-- for select
-- to public
-- using ( auth.uid() = id );
-- -- Users [INSERT]
-- create policy "Allow individual insert access"
-- on users
-- as permissive
-- for insert
-- to public
-- with CHECK (auth.uid() = id );
-- create policy "Allow individual update access"
-- on users
-- as permissive
-- for update
-- to public
-- using ( auth.uid() = id );
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

CREATE POLICY "Allow authenticated to read users" ON users AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read barangays" ON barangays AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read cities_municipalities" ON cities_municipalities AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read provinces" ON provinces AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read farmers" ON farmers AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to insert farmers" ON farmers AS permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated to update farmers" ON farmers AS permissive
    FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read fields" ON fields AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to insert fields" ON fields AS permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated to update fields" ON fields AS permissive
    FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read seasons" ON seasons AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read field_activities" ON field_activities AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to insert field_activities" ON field_activities AS permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated to update field_activities" ON field_activities AS permissive
    FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read field_plannings" ON field_plannings AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to insert field_plannings" ON field_plannings AS permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated to update field_plannings" ON field_plannings AS permissive
    FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read crop_establishments" ON crop_establishments AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to insert crop_establishments" ON crop_establishments AS permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated to update crop_establishments" ON crop_establishments AS permissive
    FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read fertilization_records" ON fertilization_records AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to insert fertilization_records" ON fertilization_records AS permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated to update fertilization_records" ON fertilization_records AS permissive
    FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read fertilizer_applications" ON fertilizer_applications AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to insert fertilizer_applications" ON fertilizer_applications AS permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated to update fertilizer_applications" ON fertilizer_applications AS permissive
    FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read harvest_records" ON harvest_records AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to insert harvest_records" ON harvest_records AS permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated to update harvest_records" ON harvest_records AS permissive
    FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read damage_assessments" ON damage_assessments AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to insert damage_assessments" ON damage_assessments AS permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated to update damage_assessments" ON damage_assessments AS permissive
    FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read monitoring visits" ON monitoring_visits AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to insert monitoring visits" ON monitoring_visits AS permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated to update monitoring visits" ON monitoring_visits AS permissive
    FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read system audit logs" ON system_audit_logs AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to insert system audit logs" ON system_audit_logs AS permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated to update system audit logs" ON system_audit_logs AS permissive
    FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read activity logs" ON activity_logs AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to insert activity logs" ON activity_logs AS permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated to update activity logs" ON activity_logs AS permissive
    FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to read audit errors" ON audit_errors AS permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to insert audit errors" ON audit_errors AS permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated to update audit errors" ON audit_errors AS permissive
    FOR UPDATE TO authenticated USING (TRUE);

create policy "Allow authenticated to read tasks" on collection_tasks as permissive
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Allow authenticated to insert tasks" ON collection_tasks AS permissive
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Allow authenticated to update tasks" ON collection_tasks AS permissive
    FOR UPDATE TO authenticated USING (TRUE);

-- storage start --

CREATE POLICY "allow authenticated uploads" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'form-images');

CREATE POLICY "allow authenticated reads" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'form-images');

CREATE POLICY "Allow authenticated users to update files in form-images" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'form-images') WITH CHECK ( bucket_id = 'form-images');

CREATE POLICY "Allow authenticated to delete tasks" ON collection_tasks AS permissive
    FOR DELETE TO authenticated USING (TRUE);

-- storage end --

GRANT SELECT ON field_details TO authenticated;

GRANT SELECT ON user_details TO authenticated;

GRANT SELECT ON mfid_details TO authenticated;

GRANT SELECT ON field_activity_details TO authenticated;

GRANT SELECT ON users TO authenticated;

GRANT SELECT ON barangays TO authenticated;

GRANT SELECT ON cities_municipalities TO authenticated;

GRANT SELECT ON provinces TO authenticated;

GRANT SELECT ON users TO authenticated, public;

GRANT SELECT ON farmers TO authenticated;

GRANT SELECT ON fields TO authenticated;

GRANT SELECT ON seasons TO authenticated;

GRANT SELECT ON field_activities TO authenticated;

GRANT SELECT ON collection_details TO authenticated;

GRANT SELECT ON field_plannings TO authenticated;

GRANT SELECT ON crop_establishments TO authenticated;

GRANT SELECT ON fertilization_records TO authenticated;

GRANT SELECT ON fertilizer_applications TO authenticated;

GRANT SELECT ON harvest_records TO authenticated;

GRANT SELECT ON damage_assessments TO authenticated;

GRANT SELECT ON monitoring_visits TO authenticated;

GRANT SELECT ON activity_logs_view TO authenticated;

GRANT SELECT ON system_audit_logs_view TO authenticated;

GRANT ALL privileges ON users TO service_role;

GRANT ALL privileges ON user_details TO service_role;

ALTER DEFAULT privileges IN SCHEMA public GRANT ALL ON tables TO service_role;

GRANT usage ON SCHEMA spatial TO anon, authenticated, service_role;

-- GRANT usage ON SCHEMA analytics TO anon, authenticated, service_role;

-- GRANT ALL ON ALL tables IN SCHEMA analytics TO anon, authenticated, service_role;

-- GRANT ALL ON ALL ROUTINES IN SCHEMA analytics TO anon, authenticated, service_role;

-- GRANT ALL ON ALL sequences IN SCHEMA analytics TO anon, authenticated, service_role;

-- ALTER DEFAULT privileges FOR ROLE postgres IN SCHEMA analytics GRANT ALL ON tables TO anon, authenticated, service_role;

-- ALTER DEFAULT privileges FOR ROLE postgres IN SCHEMA analytics GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ALTER DEFAULT privileges FOR ROLE postgres IN SCHEMA analytics GRANT ALL ON sequences TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE ON ALL tables IN SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE ON ALL tables IN SCHEMA public TO anon;

GRANT ALL privileges ON ALL tables IN SCHEMA public TO service_role;

ALTER DEFAULT privileges IN SCHEMA public GRANT ALL ON tables TO service_role;

GRANT EXECUTE ON ALL functions IN SCHEMA realtime TO service_role;

