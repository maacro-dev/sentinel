create or replace function analytics.yield_by_method(
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
    avg_yield numeric;
    highest jsonb;
    lowest  jsonb;
    gap_percentage numeric;
    ranking jsonb;
    result jsonb;
begin
    with base as (
        select
            hr.area_harvested_ha,
            (hr.bags_harvested * hr.avg_bag_weight_kg) / 1000.0 as yield_t,
            p.name as province,
            cm.name as municipality,
            b.name as barangay,
            ce.actual_crop_establishment_method as method,
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
    overall as (
        select coalesce(avg(yield_t / nullif(area_harvested_ha, 0)), 0) as overall_avg
        from base
        where area_harvested_ha > 0
    ),
    all_methods as (
        select unnest(array['direct-seeded', 'transplanted']) as method
    ),
    method_agg as (
        select
            am.method,
            coalesce(avg(b.yield_t / nullif(b.area_harvested_ha, 0)), 0) as avg_yield_t_ha,
            count(b.area_harvested_ha) as record_count
        from all_methods am
        left join base b on b.method = am.method and b.area_harvested_ha > 0
        group by am.method
    )
    select
        (select overall_avg from overall),
        (select jsonb_build_object('value', avg_yield_t_ha, 'method', method)
         from method_agg
         order by avg_yield_t_ha desc
         limit 1),
        (select jsonb_build_object('value', avg_yield_t_ha, 'method', method)
         from method_agg
         order by avg_yield_t_ha asc
         limit 1),
        (select jsonb_agg(
            jsonb_build_object('method', method, 'yield', avg_yield_t_ha, 'count', record_count)
            order by avg_yield_t_ha desc)
         from method_agg)
    into avg_yield, highest, lowest, ranking;

    gap_percentage := case
        when highest is not null
         and lowest is not null
         and (highest->>'value')::numeric > 0
        then (((highest->>'value')::numeric - (lowest->>'value')::numeric)
              / (highest->>'value')::numeric) * 100
        else 0
    end;

    result := jsonb_build_object(
        'average_yield', avg_yield,
        'highest_method', highest,
        'lowest_method', lowest,
        'gap_percentage', gap_percentage,
        'ranking', coalesce(ranking, '[]'::jsonb)
    );

    return result;
end;
$$;