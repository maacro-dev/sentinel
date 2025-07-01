CREATE OR REPLACE VIEW public.user_profiles AS
SELECT
    usr.auth_id,
    usr.first_name,
    usr.last_name,
    usr.national_id,
    usr.date_of_birth,
    usr.status,
    role.name AS role,
    auth.email,
    auth.last_sign_in_at,
    usr.created_at,
    usr.updated_at
FROM auth.users AS auth
JOIN public.users AS usr ON auth.id = usr.auth_id
JOIN public.roles AS role ON usr.role_id = role.id;