create or replace function predicted_yield_forecast(
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
    forecast jsonb;
    total_predicted numeric;
    max_yield numeric;
    min_yield numeric;
    avg_yield numeric;
    result jsonb;
begin
    with base as (
        select
            py.predicted_yield_t_ha,
            date_trunc('month', (fp.est_crop_establishment_date + (ce.rice_variety_maturity_duration || ' days')::interval)) as harvest_month,
            p.name as province,
            cm.name as municipality,
            b.name as barangay,
            ce.actual_crop_establishment_method as method,
            ce.rice_variety as variety
        from public.predicted_yields py
        join public.fields f on py.mfid_id = f.mfid_id
        join public.addresses a on f.barangay_id = a.barangay_id
        join public.provinces p on a.province_id = p.id
        join public.cities_municipalities cm on a.city_municipality_id = cm.id
        join public.barangays b on a.barangay_id = b.id
        join public.field_activities fa on f.id = fa.field_id and fa.season_id = py.season_id and fa.activity_type = 'field-data'
        join public.field_plannings fp on fa.id = fp.id
        left join public.crop_establishments ce on ce.id = (
            select id from public.field_activities
            where field_id = f.id
              and season_id = py.season_id
              and activity_type = 'cultural-management'
            limit 1
        )
        where (p_season_id is null or py.season_id = p_season_id)
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
          and fp.est_crop_establishment_date is not null
          and ce.rice_variety_maturity_duration is not null
    ),
    monthly as (
        select
            harvest_month,
            sum(predicted_yield_t_ha) as total_yield
        from base
        group by harvest_month
        order by harvest_month
    )
    select
        coalesce(
            (select jsonb_agg(
                jsonb_build_object('month', to_char(harvest_month, 'Mon YYYY'), 'yield', total_yield)
                order by harvest_month)
             from monthly),
            '[]'::jsonb
        ),
        coalesce((select sum(total_yield) from monthly), 0),
        coalesce((select max(total_yield) from monthly), 0),
        coalesce((select min(total_yield) from monthly), 0),
        coalesce((select avg(total_yield) from monthly), 0)
    into forecast, total_predicted, max_yield, min_yield, avg_yield;

    result := jsonb_build_object(
        'forecast', forecast,
        'total_predicted', total_predicted,
        'max_monthly', max_yield,
        'min_monthly', min_yield,
        'avg_monthly', avg_yield
    );

    return result;
end;
$$;