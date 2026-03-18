create or replace function public.trend_overall_yield(p_season_id int default null)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    target_season_id int;
    season_info jsonb;
    yield_data jsonb;
begin
    if p_season_id is null then
        select id into target_season_id
        from public.seasons
        order by start_date desc
        limit 1;
    else
        target_season_id := p_season_id;
    end if;

    if target_season_id is null then
        return jsonb_build_object('season', null, 'data', '[]'::jsonb);
    end if;

    select jsonb_build_object(
        'start_date', s.start_date,
        'end_date', s.end_date,
        'semester', s.semester,
        'season_year', s.season_year
    ) into season_info
    from public.seasons s
    where s.id = target_season_id;

    with yield_by_month as (
        select
            date_trunc('month', hr.harvest_date)::date as date,
            round(avg((hr.bags_harvested * hr.avg_bag_weight_kg) / nullif(hr.area_harvested_ha, 0) / 1000.0)::numeric, 2) as avg_yield_t_ha
        from public.harvest_records hr
        join public.field_activities fa on hr.id = fa.id
        where fa.season_id = target_season_id
        group by date_trunc('month', hr.harvest_date)
        order by date
    )
    select coalesce(
        jsonb_agg(jsonb_build_object('date', ym.date, 'avg_yield_t_ha', ym.avg_yield_t_ha) order by ym.date),
        '[]'::jsonb
    ) into yield_data
    from yield_by_month ym;

    return jsonb_build_object('season', season_info, 'data', yield_data);
end;
$$;
