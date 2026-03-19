

create or replace function public.dashboard_barangay_yield_rankings(p_season_id int default null)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    target_season_id int;
    result jsonb;
    overall_avg numeric;
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
        return jsonb_build_object('ranking', '[]'::jsonb, 'overallAverage', 0);
    end if;

    with harvest_agg as (
        select f.barangay_id,
               sum(hr.bags_harvested * hr.avg_bag_weight_kg) as total_kg,
               sum(hr.area_harvested_ha) as total_area
        from public.field_activities fa
        join public.harvest_records hr on hr.id = fa.id
        join public.fields f on fa.field_id = f.id
        where fa.season_id = target_season_id
        group by f.barangay_id
        having sum(hr.area_harvested_ha) > 0
    ),
    ranking as (
        select
            b.name as barangay,
            cm.name as municipality,
            p.name as province,
            (ha.total_kg / ha.total_area / 1000)::numeric(10,2) as avg_yield_t_per_ha
        from harvest_agg ha
        join public.barangays b on b.id = ha.barangay_id
        join public.cities_municipalities cm on cm.id = b.city_municipality_id
        join public.provinces p on p.id = cm.province_id
    )
    select
        coalesce(
            (select jsonb_agg(
                jsonb_build_object(
                    'barangay', barangay,
                    'municipality', municipality,
                    'province', province,
                    'avg_yield_t_per_ha', avg_yield_t_per_ha
                ) order by avg_yield_t_per_ha desc
            ) from ranking),
            '[]'::jsonb
        ),
        coalesce(
            (select sum(total_kg) / sum(total_area) / 1000 from harvest_agg),
            0
        )
    into result, overall_avg;

    return jsonb_build_object('ranking', result, 'overallAverage', overall_avg);
end;
$$;
