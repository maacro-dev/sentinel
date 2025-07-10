

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
    '00000000-0000-0000-0000-000000000000',
    p_id,
    'authenticated', 'authenticated',
    p_email, p_password,
    p_created_at,
    null, '', null, '', null, '', '', null,
    null, '{"provider": "email", "providers": ["email"]}',
    '{"email_verified": true}', null,
    p_created_at, p_created_at,
    null, null, '', '', null, DEFAULT, '',
    0, null, '', null, false, null, false
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
    p_id,
    p_id,
    json_build_object(
      'sub', p_id::text,
      'email', p_email,
      'email_verified', true,
      'phone_verified', false
    )::jsonb,
    'email',
    p_created_at,
    p_created_at,
    p_created_at,
    p_id
  );

  insert into public.users (
    id,
    first_name,
    last_name,
    date_of_birth,
    role,
    status,
    created_at,
    updated_at
  ) values (
    p_id,
    p_first_name,
    p_last_name,
    p_date_of_birth,
    p_role,
    'active',
    p_created_at,
    p_created_at
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
