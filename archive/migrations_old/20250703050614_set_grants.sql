GRANT USAGE ON SCHEMA public TO public;

GRANT SELECT ON public.user_profiles TO public;
GRANT SELECT ON public.users TO public;
GRANT SELECT ON public.roles TO public;

GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT ON public.users TO authenticated;
GRANT SELECT ON public.roles TO authenticated;

