CREATE OR REPLACE VIEW public.user_summaries AS
SELECT
    usr.auth_id,
    CONCAT(usr.first_name, ' ', usr.last_name) AS full_name,
    usr.status,
    role.name AS role,
    auth.email,
    auth.last_sign_in_at
FROM auth.users AS auth
JOIN public.users AS usr ON auth.id = usr.auth_id
JOIN public.roles AS role ON usr.role_id = role.id;
