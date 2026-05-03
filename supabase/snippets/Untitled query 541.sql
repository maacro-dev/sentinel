create or replace view seasons_with_yield_data as
  select distinct s.*
  from seasons s
  join field_activities fa on fa.season_id = s.id
  join harvest_records hr on hr.id = fa.id;