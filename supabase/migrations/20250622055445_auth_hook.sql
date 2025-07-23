-- create or replace function public.custom_access_token_hook(event jsonb)
-- returns jsonb
-- language plpgsql
-- stable
-- as $$
-- declare
--   claims    jsonb;
--   user_role public.user_role;
-- begin
--   RAISE NOTICE 'custom_access_token_hook called for user_id: %', (event->>'user_id');

--   select role
--     into user_role
--     from public.users
--    where id = (event->>'user_id')::uuid;

--   claims := event->'claims';

--   if user_role is not null then
--     RAISE NOTICE 'user_role for % is %', event->>'user_id', user_role;
--     claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
--   else
--     RAISE NOTICE 'no user_role found for %', event->>'user_id';
--     claims := jsonb_set(claims, '{user_role}', 'null');
--   end if;

--   event := jsonb_set(event, '{claims}', claims);

--   return event;
-- end;
-- $$;

-- grant all
--   on table public.users
--   to supabase_auth_admin;

-- revoke all
--   on table public.users
--   from authenticated, anon, public;
