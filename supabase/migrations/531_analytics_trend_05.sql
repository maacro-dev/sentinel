create or replace function public.province_yields(p_season_id int default null)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    target_season_id int;
    result jsonb;
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
        return '[]'::jsonb;
    end if;

    with all_provinces as (
        select id, name as province
        from public.provinces
    ),
    province_yield as (
        select
            p.id as province_id,
            sum(hr.bags_harvested * hr.avg_bag_weight_kg) as total_kg,
            sum(hr.area_harvested_ha) as total_area_ha
        from public.harvest_records hr
        join public.field_activities fa on hr.id = fa.id
        join public.fields f on fa.field_id = f.id
        join public.addresses a on f.barangay_id = a.barangay_id
        join public.provinces p on a.province_id = p.id
        where fa.season_id = target_season_id
        group by p.id
    )
    select jsonb_agg(
        jsonb_build_object(
            'province', ap.province,
            'avg_yield_t_per_ha',
            case
                when py.total_area_ha > 0 then
                    round((py.total_kg / py.total_area_ha / 1000)::numeric, 2)
                else 0
            end
        ) order by ap.province
    ) into result
    from all_provinces ap
    left join province_yield py on ap.id = py.province_id;

    return coalesce(result, '[]'::jsonb);
end;
$$;
