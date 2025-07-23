create or replace function public.create_seed_user(
  p_id uuid,
  p_email text,
  p_password text,
  p_first_name text,
  p_last_name text,
  p_date_of_birth date,
  p_role public.user_role,
  p_created_at timestamptz default now()
) returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    confirmed_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at,
    is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000', -- instance_id (always 0s for single-tenant)
    p_id,                                   -- id (user UUID)
    'authenticated',                        -- aud (audience claim)
    'authenticated',                        -- role (internal GoTrue role)
    p_email,                                -- email
    p_password,                             -- encrypted_password
    p_created_at,                           -- email_confirmed_at (when email was confirmed)
    null,                                   -- invited_at
    '',                                     -- confirmation_token
    null,                                   -- confirmation_sent_at
    '',                                     -- recovery_token
    null,                                   -- recovery_sent_at
    '',                                     -- email_change_token_new
    '',                                     -- email_change
    null,                                   -- email_change_sent_at
    null,                                   -- last_sign_in_at
    jsonb_build_object(                     -- raw_app_meta_data
      'provider', 'email',
      'providers', jsonb_build_array('email')
    ),
    jsonb_build_object(                     -- raw_user_meta_data
      'email_verified', true,
      'first_name', p_first_name,
      'last_name', p_last_name,
      'date_of_birth', p_date_of_birth::text,
      'role', p_role::public.user_role
    ),
    null,                                   -- is_super_admin
    p_created_at,                          -- created_at
    p_created_at,                          -- updated_at
    null,                                  -- phone
    null,                                  -- phone_confirmed_at
    '',                                    -- phone_change
    '',                                    -- phone_change_token
    null,                                  -- phone_change_sent_at
    DEFAULT,                               -- confirmed_at
    '',                                    -- email_change_token_current
    0,                                     -- email_change_confirm_status
    null,                                  -- banned_until
    '',                                    -- reauthentication_token
    null,                                  -- reauthentication_sent_at
    false,                                 -- is_sso_user
    null,                                  -- deleted_at
    false                                  -- is_anonymous
  );

  insert into auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at,
    id
  ) values (
    p_id,                                  -- provider_id (same as user id for email)
    p_id,                                  -- user_id (FK to auth.users)
    jsonb_build_object(                   -- identity_data
      'sub', p_id::text,
      'email', p_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',                              -- provider (email, google, etc.)
    p_created_at,                         -- last_sign_in_at
    p_created_at,                         -- created_at
    p_created_at,                         -- updated_at
    p_id                                  -- id (same as user id)
  );
end;
$$;




select public.create_seed_user(
  '7ba8a45d-de4c-47e1-ae23-be9b263dbfd9',
  'admin@humayapp.com',
  '$2a$10$thbOnXLJUoQqbcpmErWKcuTXDvx.XptgWV2/J370t.4ETJxnYirj.',
  'System',
  'Administrator',
  '1990-01-01',
  'admin'
);

select public.create_seed_user(
  'c2d8d22f-3987-4277-8945-634822e39320',
  'manager@humayapp.com',
  '$2a$10$jVGxs3MiNbzP/IyVb/dbR.8g13E2z0XuQyZxOb40fI84WpSDXoY9e',
  'Data',
  'Manager',
  '1990-01-01',
  'data_manager'
);

select public.create_seed_user(
  '9ea752ca-dd53-4967-b555-dccc88844731',
  'reyangelo.calopez@humayapp.com',
  '$2a$12$XOdnURTPryC1VcpbD8WWned2y62flisSuqYXt5bMqxOwwsmuT.78O',
  'Rey Angelo',
  'Calopez',
  '2000-01-01',
  'data_manager'
);
