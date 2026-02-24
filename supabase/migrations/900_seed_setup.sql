CREATE OR REPLACE FUNCTION public.create_seed_user(
    p_id uuid,
    p_email text,
    p_password text,
    p_first_name text,
    p_last_name text,
    p_date_of_birth date,
    p_role public.user_role,
    p_created_at timestamptz DEFAULT NOW()
)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
    AS $$
BEGIN
    INSERT INTO auth.users(instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at,
	confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new,
	email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
	created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at,
	confirmed_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token,
	reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous)
        VALUES('00000000-0000-0000-0000-000000000000', -- instance_id (always 0s for single-tenant)
            p_id, -- id (user UUID)
            'authenticated', -- aud (audience claim)
            'authenticated', -- role (internal GoTrue role)
            p_email, -- email
            p_password, -- encrypted_password
            p_created_at, -- email_confirmed_at (when email was confirmed)
            NULL, -- invited_at
            '', -- confirmation_token
            NULL, -- confirmation_sent_at
            '', -- recovery_token
            NULL, -- recovery_sent_at
            '', -- email_change_token_new
            '', -- email_change
            NULL, -- email_change_sent_at
            NULL, -- last_sign_in_at
            JSONB_BUILD_OBJECT( -- raw_app_meta_data
                'provider', 'email', 'providers', JSONB_BUILD_ARRAY('email')), JSONB_BUILD_OBJECT( -- raw_user_meta_data
		'email_verified', TRUE, 'first_name', p_first_name, 'last_name', p_last_name, 'date_of_birth',
		    p_date_of_birth::text, 'role', p_role::public.user_role), NULL, -- is_super_admin
            p_created_at, -- created_at
            p_created_at, -- updated_at
            NULL, -- phone
            NULL, -- phone_confirmed_at
            '', -- phone_change
            '', -- phone_change_token
            NULL, -- phone_change_sent_at
            DEFAULT, -- confirmed_at
            '', -- email_change_token_current
            0, -- email_change_confirm_status
            NULL, -- banned_until
            '', -- reauthentication_token
            NULL, -- reauthentication_sent_at
            FALSE, -- is_sso_user
            NULL, -- deleted_at
            FALSE -- is_anonymous
);
    INSERT INTO auth.identities(provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
        VALUES(p_id, -- provider_id (same as user id for email)
            p_id, -- user_id (FK to auth.users)
            JSONB_BUILD_OBJECT( -- identity_data
		'sub', p_id::text, 'email', p_email, 'email_verified', TRUE, 'phone_verified', FALSE),
		    'email', -- provider (email, google, etc.)
            p_created_at, -- last_sign_in_at
            p_created_at, -- created_at
            p_created_at, -- updated_at
            p_id -- id (same as user id)
);
END;
$$;
