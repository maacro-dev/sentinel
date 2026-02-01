insert into storage.buckets (id, name, allowed_mime_types)
values ('form-images', 'form-images', ARRAY['image/webp']);

create policy "allow authenticated uploads"
on storage.objects for insert to authenticated with check (
  bucket_id = 'form-images'
);

create policy "allow authenticated reads"
on storage.objects for select to authenticated using (
  bucket_id = 'form-images'
);

