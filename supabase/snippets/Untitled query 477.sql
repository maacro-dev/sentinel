create or replace function public.damage_by_cause(
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
    v_total_reports numeric;
    v_total_area numeric;
    v_highest_reports jsonb;
    v_highest_area jsonb;
    v_ranking jsonb;
    result jsonb;
begin
    with base as (
        select
            da.affected_area_ha,
            da.cause,
            p.name as province,
            cm.name as municipality,
            b.name as barangay,
            ce.actual_crop_establishment_method as method,
            ce.rice_variety
        from public.damage_assessments da
        join public.field_activities fa on da.id = fa.id
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
          and da.affected_area_ha > 0        -- exclude zero or null affected area
          and da.cause is not null           -- only valid causes
    ),
    totals as (
        select
            count(*) as total_reports,
            coalesce(sum(affected_area_ha), 0) as total_area
        from base
    ),
    cause_agg as (
        select
            cause,
            count(*) as report_count,
            coalesce(sum(affected_area_ha), 0) as total_affected_area
        from base
        group by cause
    )
    select
        (select total_reports from totals),
        (select total_area from totals),
        (select jsonb_build_object('value', report_count, 'cause', cause)
         from cause_agg where report_count > 0 order by report_count desc limit 1),
        (select jsonb_build_object('value', total_affected_area, 'cause', cause)
         from cause_agg where total_affected_area > 0 order by total_affected_area desc limit 1),
        (select jsonb_agg(
            jsonb_build_object(
                'cause', cause,
                'damage_count', report_count,
                'total_affected_area', total_affected_area
            )
            order by report_count desc
         )
         from cause_agg where total_affected_area > 0)
    into v_total_reports, v_total_area, v_highest_reports, v_highest_area, v_ranking;

    result := jsonb_build_object(
        'total_damage_reports', coalesce(v_total_reports, 0),
        'total_affected_area_ha', coalesce(v_total_area, 0),
        'highest_damage_count', coalesce(v_highest_reports, 'null'::jsonb),
        'highest_affected_area', coalesce(v_highest_area, 'null'::jsonb),
        'ranking', coalesce(v_ranking, '[]'::jsonb)
    );

    return result;
end;
$$;