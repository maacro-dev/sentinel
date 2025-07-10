
-- public.users + auth.users
create or replace view user_details as
select
  usr.*,
  auth_user.email,
  auth_user.last_sign_in_at
from users usr
join auth.users auth_user
  on usr.id = auth_user.id;
