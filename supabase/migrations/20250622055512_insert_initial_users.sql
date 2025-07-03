INSERT INTO auth.users 
VALUES 
  (
    '00000000-0000-0000-0000-000000000000', 
    '7ba8a45d-de4c-47e1-ae23-be9b263dbfd9', 
    'authenticated', 'authenticated', 
    'admin@humayapp.com', '$2a$10$thbOnXLJUoQqbcpmErWKcuTXDvx.XptgWV2/J370t.4ETJxnYirj.', 
    '2025-06-26 09:11:34.191931+00', 
    NULL, '', NULL, '', NULL, '', '', NULL, 
    NULL, '{"provider": "email", "providers": ["email"]}', 
    '{"email_verified": true}', NULL, 
    '2025-06-26 09:11:34.189371+00', 
    '2025-06-26 09:11:34.192701+00', 
    NULL, NULL, '', '', NULL, DEFAULT, '', 
    0, NULL, '', NULL, false, NULL, false
  ),
  (
    '00000000-0000-0000-0000-000000000000', 
    'c2d8d22f-3987-4277-8945-634822e39320', 
    'authenticated', 'authenticated', 
    'manager@humayapp.com', '$2a$10$jVGxs3MiNbzP/IyVb/dbR.8g13E2z0XuQyZxOb40fI84WpSDXoY9e', 
    '2025-06-26 09:11:34.191931+00', 
    NULL, '', NULL, '', NULL, '', '', NULL, 
    NULL, '{"provider": "email", "providers": ["email"]}', 
    '{"email_verified": true}', NULL, 
    '2025-06-26 09:11:34.189371+00', 
    '2025-06-26 09:11:34.192701+00', 
    NULL, NULL, '', '', NULL, DEFAULT, '', 
    0, NULL, '', NULL, false, NULL, false
  );

INSERT INTO auth.identities 
VALUES 
  (
    '7ba8a45d-de4c-47e1-ae23-be9b263dbfd9', 
    '7ba8a45d-de4c-47e1-ae23-be9b263dbfd9', 
    '{"sub": "7ba8a45d-de4c-47e1-ae23-be9b263dbfd9", "email": "admin@humayapp.com", "email_verified": false, "phone_verified": false}', 
    'email', '2025-06-26 09:11:34.190423+00', 
    '2025-06-26 09:11:34.190451+00', 
    '2025-06-26 09:11:34.190451+00', 
    DEFAULT, 'fe6a198e-8cce-40b9-b3d7-b41581800602'
  ),
  (
    'c2d8d22f-3987-4277-8945-634822e39320', 
    'c2d8d22f-3987-4277-8945-634822e39320', 
    '{"sub": "11111111-1111-1111-1111-111111111111", "email": "manager@humayapp.com", "email_verified": false, "phone_verified": false}', 
    'email', '2025-06-26 09:11:34.190423+00', 
    '2025-06-26 09:11:34.190451+00', 
    '2025-06-26 09:11:34.190451+00', 
    DEFAULT, 'c2d8d22f-3987-4277-8945-634822e39320'
  );

INSERT INTO public.users (
  id, 
  auth_id, 
  role_id, 
  first_name, 
  last_name, 
  date_of_birth, 
  -- email, 
  status, 
  created_at, 
  updated_at
)
VALUES 
  (
    1, '7ba8a45d-de4c-47e1-ae23-be9b263dbfd9', 
    1, 'System', 'Administrator', 
    '1990-01-01', 
    'active', '2025-06-26 09:12:16+00', 
    '2025-06-26 09:12:17+00'
  ),
  (
    2, 'c2d8d22f-3987-4277-8945-634822e39320', 
    2, 'Data', 'Manager', 
    '1990-01-01', 
    'active', '2025-06-26 09:12:16+00', 
    '2025-06-26 09:12:17+00'
  );
