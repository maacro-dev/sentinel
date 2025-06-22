-- taken from `supabase db diff` output

alter table "public"."roles" alter column "created_at" drop default;

alter table "public"."roles" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."roles" alter column "updated_at" drop default;

alter table "public"."roles" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

alter table "public"."users" alter column "created_at" drop default;

alter table "public"."users" alter column "created_at" set data type timestamp with time zone using "created_at"::timestamp with time zone;

alter table "public"."users" alter column "last_active" set data type timestamp with time zone using "last_active"::timestamp with time zone;

alter table "public"."users" alter column "updated_at" drop default;

alter table "public"."users" alter column "updated_at" set data type timestamp with time zone using "updated_at"::timestamp with time zone;

set check_function_bodies = off;
