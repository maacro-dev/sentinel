INSERT INTO storage.buckets(id, name, allowed_mime_types)
    VALUES ('form-images', 'form-images', ARRAY['image/webp']);

CREATE POLICY "allow authenticated uploads" ON storage.objects
    FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'form-images');

CREATE POLICY "allow authenticated reads" ON storage.objects
    FOR SELECT TO authenticated
        USING (bucket_id = 'form-images');
