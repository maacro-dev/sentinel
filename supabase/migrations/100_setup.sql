create schema if not exists spatial;
create schema if not exists analytics;

create extension if not exists postgis schema spatial;
create extension if not exists pg_cron;

begin;
drop publication if exists supabase_realtime;
create publication supabase_realtime;
commit;

