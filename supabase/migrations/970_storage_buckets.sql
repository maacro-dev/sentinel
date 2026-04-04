
insert into storage.buckets (id, name, allowed_mime_types)
values ('form-images', 'form-images', array['image/webp'])
on conflict (id) do nothing;
