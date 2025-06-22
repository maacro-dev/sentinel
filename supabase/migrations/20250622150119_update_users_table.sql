-- taken from `supabase db diff` output

alter table "public"."users" alter column "email" set not null;

alter table "public"."users" alter column "first_name" set not null;

alter table "public"."users" alter column "last_name" set not null;

alter table "public"."users" alter column "username" set not null;

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_username_key" UNIQUE using index "users_username_key";