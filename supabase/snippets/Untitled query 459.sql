create or replace function analytics.yield_by_location(
    p_season_id int default null,
    p_province text default null,
    p_municipality text default null,
    p_barangay text default null,
    p_method text default null,
    p_variety text default null
)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    result jsonb;
    avg_yield numeric;
    highest jsonb;
    ranking jsonb;
begin
    with base as (
        select
            hr.area_harvested_ha,
            (hr.bags_harvested * hr.avg_bag_weight_kg) / 1000.0 as yield_kg,  -- kg, not t/ha yet
            p.name as province,
            cm.name as municipality,
            b.name as barangay,
            ce.actual_crop_establishment_method,
            ce.rice_variety
        from public.harvest_records hr
        join public.field_activities fa on hr.id = fa.id
        join public.fields f on fa.field_id = f.id
        join public.addresses a on f.barangay_id = a.barangay_id
        join public.provinces p on a.province_id = p.id
        join public.cities_municipalities cm on a.city_municipality_id = cm.id
        join public.barangays b on a.barangay_id = b.id
        left join public.crop_establishments ce on ce.id = (
            select id from public.field_activities
            where field_id = fa.field_id
              and season_id = fa.season_id
              and activity_type = 'cultural-management'
            limit 1
        )
        where (p_season_id is null or fa.season_id = p_season_id)
          and (p_province is null or p.name = p_province)
          and (p_municipality is null or cm.name = p_municipality)
          and (p_barangay is null or b.name = p_barangay)
          and (p_method is null or ce.actual_crop_establishment_method ilike '%' || p_method || '%')
          and (p_variety is null or
               case p_variety
                   when 'NSIC' then ce.rice_variety ilike '%nsic%'
                   when 'PSB' then ce.rice_variety ilike '%psb%'
                   when 'Others' then not (ce.rice_variety ilike '%nsic%' or ce.rice_variety ilike '%psb%')
                   else true
               end)
    ),
    -- Overall average yield (t/ha)
    overall as (
        select coalesce(avg(yield_kg / nullif(area_harvested_ha, 0)) / 1000.0, 0) as avg_yield
        from base
        where area_harvested_ha > 0
    ),
    -- Ranking at the appropriate granularity
    ranked as (
        select
            case
                when p_province is null then province
                when p_municipality is null then municipality
                else barangay
            end as location,
            avg(yield_kg / nullif(area_harvested_ha, 0)) / 1000.0 as avg_yield_t_ha
        from base
        where area_harvested_ha > 0
        group by location
        order by avg_yield_t_ha desc
    )
    select
        (select avg_yield from overall) into avg_yield;

    -- Highest yield location
    select jsonb_build_object(
        'value', avg_yield_t_ha,
        'location', location
    ) into highest
    from ranked
    limit 1;

    -- Ranking list
    select jsonb_agg(
        jsonb_build_object('location', location, 'yield', avg_yield_t_ha)
        order by avg_yield_t_ha desc
    ) into ranking
    from ranked;

    result := jsonb_build_object(
        'average_yield', avg_yield,
        'highest_yield', highest,
        'ranking', coalesce(ranking, '[]'::jsonb)
    );

    return result;
end;
$$;
