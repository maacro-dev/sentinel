create or replace view analytics.trend_overall_yield as
    with yield_by_month as (
        select
            date_trunc('month', hr.harvest_date)::date as date,
            round(avg((hr.bags_harvested * hr.avg_bag_weight_kg) / nullif(hr.area_harvested_ha, 0) / 1000.0)::numeric, 2) as avg_yield_t_ha
        from harvest_records hr
            join field_activities fa on hr.id = fa.id
            join latest_season ls on fa.season_id = ls.id
        group by 1
        order by 1
    )
        select (
            select json_build_object('start_date', ls.start_date, 'end_date', ls.end_date, 'semester',
            ls.semester, 'season_year', ls.season_year)
                from latest_season ls
                limit 1) as season,
        coalesce((
            select json_agg(json_build_object('date', ym.date, 'avg_yield_t_ha', ym.avg_yield_t_ha)
            order by ym.date)
            from yield_by_month ym), '[]'::json) as data;
