-- taken from `supabase db diff` output

CREATE OR REPLACE FUNCTION public.fetch_user_by_username(arg text)
 RETURNS record
 LANGUAGE plpgsql
AS $function$DECLARE
  result RECORD;
BEGIN
  SELECT
    u.id,
    u.first_name,
    u.last_name,
    u.username,
    u.email,
    u.status,
    u.created_at,
    u.updated_at,
    u.last_active,
    u.role_id,
    r.name AS role
  INTO result
  FROM public.users u
  LEFT JOIN public.roles r ON u.role_id = r.id
  WHERE u.username = arg
  LIMIT 1;

  RETURN result;
END;$function$
;