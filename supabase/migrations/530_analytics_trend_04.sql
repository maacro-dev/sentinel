
create or replace view analytics.trend_data_collection as
with collection_rate as (
  select
    date(fa.collected_at) as date,
    count(*) as data_collected
  from field_activities fa
  join latest_season ls on fa.season_id = ls.id
  group by date(fa.collected_at)
)
select
  coalesce(
    ( select
        json_build_object(
          'start_date',    ls.start_date,
          'end_date',      ls.end_date,
          'semester',      ls.semester,
          'season_year',   ls.season_year
        )
      from latest_season ls
    ),
    json_build_object()
  ) as season,

  coalesce(
    ( select
        json_agg(
          json_build_object(
            'date', cr.date,
            'data_collected', cr.data_collected
          )
        )
      from collection_rate cr
    ),
    '[]'::json
  ) as data;
