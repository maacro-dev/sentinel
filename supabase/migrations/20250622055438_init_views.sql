
-- public.users + auth.users
create or replace view user_details as
select
  usr.*,
  auth_user.email,
  auth_user.last_sign_in_at
from users usr
join auth.users auth_user
  on usr.id = auth_user.id;


create or replace view submitted_forms as
select
    fa.id as field_activity_id,
    fa.activity_type,
    fa.collected_at,
    s.id as season_id,
    s.year,
    s.sem
from field_activities fa
join seasons s on fa.season_id = s.id;