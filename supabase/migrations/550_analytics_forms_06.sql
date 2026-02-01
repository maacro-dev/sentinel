
create or replace view analytics.summary_form_count as
with counts as (
  select
    count(*) filter (where activity_type = 'field-data')           as field_plannings_count,
    count(*) filter (where activity_type = 'cultural-management')  as crop_establishments_count,
    count(*) filter (where activity_type = 'nutrient-management')  as fertilization_records_count,
    count(*) filter (where activity_type = 'production')           as harvest_records_count,
    count(*) filter (where activity_type = 'damage-assessment')    as damage_assessments_count,
    count(*) filter (where activity_type = 'monitoring-visit')     as monitoring_visits_count
  from field_activity_details
)
select
  coalesce(
    ( select
        json_build_object(
          'start_date', ls.start_date,
          'end_date',   ls.end_date,
          'semester',   ls.semester,
          'season_year',ls.season_year
        )
      from latest_season ls
    ),
    json_build_object()
  ) as season,
  json_build_array(
    json_build_object('form','field_plannings','count',coalesce(c.field_plannings_count, 0)),
    json_build_object('form','crop_establishments','count',coalesce(c.crop_establishments_count, 0)),
    json_build_object('form','fertilization_records','count',coalesce(c.fertilization_records_count, 0)),
    json_build_object('form','harvest_records','count',coalesce(c.harvest_records_count, 0)),
    json_build_object('form','damage_assessments','count',coalesce(c.damage_assessments_count, 0)),
    json_build_object('form','monitoring_visits','count',coalesce(c.monitoring_visits_count, 0))
  ) as data
from counts c;
