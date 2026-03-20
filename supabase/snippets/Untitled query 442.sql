create view seasons_with_data as
select distinct s.*
from seasons s
join field_activities fa on fa.season_id = s.id;