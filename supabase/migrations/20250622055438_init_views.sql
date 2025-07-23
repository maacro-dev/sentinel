
-- public.users + auth.users
create or replace view user_details as
select
  usr.*,
  auth_user.email,
  auth_user.last_sign_in_at
from users usr
join auth.users auth_user
  on usr.id = auth_user.id;

create or replace view field_details as
select
  fd.id             as field_id,
  fd.mfid           as mfid,
  f.first_name      as farmer_first_name,
  f.last_name       as farmer_last_name,
  b.name            as barangay,
  cm.name           as municipality,
  p.name            as province,
  fd.created_at     as created_at,
  fd.updated_at     as updated_at
from fields fd
join farmers f on f.id = fd.farmer_id
join barangays b on b.id = barangay_id
join cities_municipalities cm on cm.id = b.city_municipality_id
join provinces p on p.id = cm.province_id;
