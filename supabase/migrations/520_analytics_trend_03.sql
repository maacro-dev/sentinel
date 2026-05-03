create or replace function public.trend_overall_yield(p_season_id int default null)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    yield_data jsonb;
begin
    with yield_by_month as (
        select
            date_trunc('month', hr.harvest_date)::date as date,
            round(avg((hr.bags_harvested * hr.avg_bag_weight_kg) / nullif(hr.area_harvested_ha, 0) / 1000.0)::numeric, 2) as avg_yield_t_ha
        from public.harvest_records hr
        join public.field_activities fa on hr.id = fa.id
        where (p_season_id is null or fa.season_id = p_season_id)
        group by date_trunc('month', hr.harvest_date)
        order by date
    )
    select coalesce(
        jsonb_agg(jsonb_build_object('date', ym.date, 'avg_yield_t_ha', ym.avg_yield_t_ha) order by ym.date),
        '[]'::jsonb
    ) into yield_data
    from yield_by_month ym;

    return yield_data;
end;
$$;
