INSERT INTO users (
  id,
  role_id,
  first_name,
  last_name,
  username,
  email,
  status,
  last_active,
  created_at,
  updated_at
)
VALUES (
  1,
  1,
  'System',
  'Administrator',
  'admin',
  'admin@humayapp.com',
  'active',
  NOW(),
  NOW(),
  NOW()
);
