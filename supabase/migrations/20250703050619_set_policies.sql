ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access roles"
  ON public.roles
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (true);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own data"
  ON public.users
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (true);


