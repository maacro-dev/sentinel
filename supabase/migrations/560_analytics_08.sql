
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
    predicted_forecast jsonb;
    actual_forecast jsonb;
    total_predicted numeric;
    max_yield numeric;
    min_yield numeric;
    avg_monthly_yield numeric;
    overall_avg_yield numeric;
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
            count(*) as field_count,
            sum(predicted_yield_t_ha) as total_yield,
            avg(predicted_yield_t_ha) as avg_yield_per_field
        from base
        group by harvest_month
        order by harvest_month
    )
    select
        coalesce(jsonb_agg(
            jsonb_build_object(
                'month', to_char(harvest_month, 'Mon YYYY'),
                'total_yield', total_yield,
                'field_count', field_count,
                'avg_yield_per_field', avg_yield_per_field
            ) order by harvest_month
        ), '[]'::jsonb),
        coalesce((select sum(total_yield) from monthly), 0),
        coalesce((select max(total_yield) from monthly), 0),
        coalesce((select min(total_yield) from monthly), 0),
        coalesce((select avg(total_yield) from monthly), 0),
        coalesce((select avg(predicted_yield_t_ha) from base), 0)
    into predicted_forecast, total_predicted, max_yield, min_yield, avg_monthly_yield, overall_avg_yield;

    with actual_base as (
        select
            (hr.bags_harvested * hr.avg_bag_weight_kg) / 1000.0 as actual_yield_t,
            date_trunc('month', hr.harvest_date) as harvest_month,
            p.name as province,
            cm.name as municipality,
            b.name as barangay,
            ce.actual_crop_establishment_method as method,
            ce.rice_variety as variety
        from public.harvest_records hr
        join public.field_activities fa on hr.id = fa.id
        join public.fields f on fa.field_id = f.id
        join public.addresses a on f.barangay_id = a.barangay_id
        join public.provinces p on a.province_id = p.id
        join public.cities_municipalities cm on a.city_municipality_id = cm.id
        join public.barangays b on a.barangay_id = b.id
        left join public.crop_establishments ce on ce.id = (
            select id from public.field_activities
            where field_id = f.id
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
    actual_monthly as (
        select
            harvest_month,
            sum(actual_yield_t) as total_yield
        from actual_base
        group by harvest_month
        order by harvest_month
    )
    select coalesce(jsonb_agg(
        jsonb_build_object(
            'month', to_char(harvest_month, 'Mon YYYY'),
            'total_yield', total_yield
        ) order by harvest_month
    ), '[]'::jsonb) into actual_forecast
    from actual_monthly;

    result := jsonb_build_object(
        'predicted_forecast', predicted_forecast,
        'actual_yields', actual_forecast,
        'total_predicted', total_predicted,
        'max_monthly', max_yield,
        'min_monthly', min_yield,
        'avg_monthly', avg_monthly_yield,
        'overall_avg_yield_per_field', overall_avg_yield
    );

    return result;
end;
$$;



-- create or replace function predicted_yield_by_location(
--     p_season_id int default null,
--     p_province text default null,
--     p_municipality text default null,
--     p_barangay text default null,
--     p_method text default null,
--     p_variety text default null
-- )
-- returns jsonb
-- language plpgsql
-- security definer
-- set search_path = ''
-- as $$
-- declare
--     avg_yield numeric;
--     highest jsonb;
--     lowest  jsonb;
--     gap_percentage numeric;
--     ranking jsonb;
--     result jsonb;
-- begin
--     with base as (
--         select
--             py.predicted_yield_t_ha as yield_t,
--             p.name as province_name,
--             cm.name as municipality_name,
--             b.name as barangay_name,
--             ce.actual_crop_establishment_method as method,
--             ce.rice_variety as variety
--         from public.predicted_yields py
--         join public.fields f on py.mfid_id = f.mfid_id
--         join public.addresses a on f.barangay_id = a.barangay_id
--         join public.provinces p on a.province_id = p.id
--         join public.cities_municipalities cm on a.city_municipality_id = cm.id
--         join public.barangays b on a.barangay_id = b.id
--         left join public.crop_establishments ce on ce.id = (
--             select id from public.field_activities
--             where field_id = f.id
--               and season_id = py.season_id
--               and activity_type = 'cultural-management'
--             limit 1
--         )
--         where (p_season_id is null or py.season_id = p_season_id)
--           and (p_province is null or p.name = p_province)
--           and (p_municipality is null or cm.name = p_municipality)
--           and (p_barangay is null or b.name = p_barangay)
--           and (p_method is null or ce.actual_crop_establishment_method ilike '%' || p_method || '%')
--           and (p_variety is null or
--                case p_variety
--                    when 'NSIC' then ce.rice_variety ilike '%nsic%'
--                    when 'PSB' then ce.rice_variety ilike '%psb%'
--                    when 'Others' then not (ce.rice_variety ilike '%nsic%' or ce.rice_variety ilike '%psb%')
--                    else true
--                end)
--     ),
--     aggregated as (
--         select
--             case
--                 when p_barangay is not null then barangay_name
--                 when p_municipality is not null then barangay_name
--                 when p_province is not null then municipality_name
--                 else province_name
--             end as location,
--             avg(yield_t) as avg_yield_t_ha
--         from base
--         group by location
--     ),
--     all_locations as (
--         select distinct
--             case
--                 when p_barangay is not null then b.name
--                 when p_municipality is not null then b.name
--                 when p_province is not null then cm.name
--                 else p.name
--             end as location
--         from public.provinces p
--         left join public.cities_municipalities cm on
--             (p_province is not null and cm.province_id = p.id) or
--             (p_province is null)
--         left join public.barangays b on
--             (p_municipality is not null and b.city_municipality_id = cm.id) or
--             (p_municipality is null)
--         where (p_province is null or p.name = p_province)
--           and (p_municipality is null or cm.name = p_municipality)
--           and (p_barangay is null or b.name = p_barangay)
--     ),
--     overall as (
--         select coalesce(avg(yield_t), 0) as overall_avg
--         from base
--     ),
--     final_ranking as (
--         select
--             al.location,
--             coalesce(ag.avg_yield_t_ha, 0) as avg_yield_t_ha
--         from all_locations al
--         left join aggregated ag on al.location = ag.location
--     )
--     select
--         (select overall_avg from overall),
--         (select jsonb_build_object('value', avg_yield_t_ha, 'location', location)
--          from final_ranking order by avg_yield_t_ha desc limit 1),
--         (select jsonb_build_object('value', avg_yield_t_ha, 'location', location)
--          from final_ranking order by avg_yield_t_ha asc limit 1),
--         (select jsonb_agg(
--             jsonb_build_object('location', location, 'yield', avg_yield_t_ha)
--             order by avg_yield_t_ha desc
--          )
--          from final_ranking)
--     into avg_yield, highest, lowest, ranking;

--     gap_percentage := case
--         when highest is not null
--          and lowest is not null
--          and (highest->>'value')::numeric > 0
--         then (((highest->>'value')::numeric - (lowest->>'value')::numeric)
--               / (highest->>'value')::numeric) * 100
--         else 0
--     end;

--     result := jsonb_build_object(
--         'average_yield', avg_yield,
--         'highest_yield', coalesce(highest, 'null'::jsonb),
--         'lowest_yield', coalesce(lowest, 'null'::jsonb),
--         'gap_percentage', gap_percentage,
--         'ranking', coalesce(ranking, '[]'::jsonb)
--     );

--     return result;
-- end;
-- $$;


-- create or replace function predicted_yield_by_variety(
--     p_season_id int default null,
--     p_province text default null,
--     p_municipality text default null,
--     p_barangay text default null,
--     p_method text default null,
--     p_variety text default null
-- )
-- returns jsonb
-- language plpgsql
-- security definer
-- set search_path = ''
-- as $$
-- declare
--     avg_yield numeric;
--     highest jsonb;
--     ranking jsonb;
--     result jsonb;
-- begin
--     with base as (
--         select
--             py.predicted_yield_t_ha as yield_t,
--             ce.rice_variety as variety,
--             p.name as province,
--             cm.name as municipality,
--             b.name as barangay,
--             ce.actual_crop_establishment_method as method
--         from public.predicted_yields py
--         join public.fields f on py.mfid_id = f.mfid_id
--         join public.addresses a on f.barangay_id = a.barangay_id
--         join public.provinces p on a.province_id = p.id
--         join public.cities_municipalities cm on a.city_municipality_id = cm.id
--         join public.barangays b on a.barangay_id = b.id
--         left join public.crop_establishments ce on ce.id = (
--             select id from public.field_activities
--             where field_id = f.id
--               and season_id = py.season_id
--               and activity_type = 'cultural-management'
--             limit 1
--         )
--         where (p_season_id is null or py.season_id = p_season_id)
--           and (p_province is null or p.name = p_province)
--           and (p_municipality is null or cm.name = p_municipality)
--           and (p_barangay is null or b.name = p_barangay)
--           and (p_method is null or ce.actual_crop_establishment_method ilike '%' || p_method || '%')
--           and (p_variety is null or
--                case p_variety
--                    when 'NSIC' then ce.rice_variety ilike '%nsic%'
--                    when 'PSB' then ce.rice_variety ilike '%psb%'
--                    when 'Others' then not (ce.rice_variety ilike '%nsic%' or ce.rice_variety ilike '%psb%')
--                    else true
--                end)
--     ),
--     overall as (
--         select coalesce(avg(yield_t), 0) as overall_avg
--         from base
--     ),
--     variety_agg as (
--         select
--             variety,
--             avg(yield_t) as avg_yield_t_ha
--         from base
--         where variety is not null
--         group by variety
--     )
--     select
--         (select overall_avg from overall),
--         (select jsonb_build_object('value', avg_yield_t_ha, 'variety', variety)
--          from variety_agg order by avg_yield_t_ha desc limit 1),
--         (select jsonb_agg(jsonb_build_object('variety', variety, 'yield', avg_yield_t_ha) order by avg_yield_t_ha desc)
--          from variety_agg)
--     into avg_yield, highest, ranking;

--     result := jsonb_build_object(
--         'average_yield', avg_yield,
--         'highest_variety', highest,
--         'ranking', coalesce(ranking, '[]'::jsonb)
--     );

--     return result;
-- end;
-- $$;


create or replace function predicted_yield_by_soil_type(
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
            py.predicted_yield_t_ha as yield_t,
            fp.soil_type,
            ce.actual_crop_establishment_method as method,
            ce.rice_variety as variety
        from public.predicted_yields py
        join public.fields f on py.mfid_id = f.mfid_id
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
          and (p_province is null or exists (select 1 from public.addresses a where a.barangay_id = f.barangay_id and a.province = p_province))
          and (p_municipality is null or exists (select 1 from public.addresses a where a.barangay_id = f.barangay_id and a.city_municipality = p_municipality))
          and (p_barangay is null or exists (select 1 from public.addresses a where a.barangay_id = f.barangay_id and a.barangay = p_barangay))
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
        select coalesce(avg(yield_t), 0) as overall_avg
        from base
    ),
    soil_agg as (
        select
            soil_type,
            avg(yield_t) as avg_yield_t_ha,
            count(*) as count
        from base
        where soil_type is not null
        group by soil_type
    )
    select
        (select overall_avg from overall),
        (select jsonb_build_object('value', avg_yield_t_ha, 'soil_type', soil_type)
         from soil_agg order by avg_yield_t_ha desc limit 1),
        (select jsonb_build_object('value', avg_yield_t_ha, 'soil_type', soil_type)
         from soil_agg order by avg_yield_t_ha asc limit 1),
        (select jsonb_agg(
            jsonb_build_object('soil_type', soil_type, 'yield', avg_yield_t_ha, 'count', count)
            order by avg_yield_t_ha desc)
         from soil_agg)
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
        'highest_soil_type', highest,
        'lowest_soil_type', lowest,
        'gap_percentage', gap_percentage,
        'ranking', coalesce(ranking, '[]'::jsonb)
    );

    return result;
end;
$$;


create or replace function predicted_yield_by_soil_variety(
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
    ranking jsonb;
    result jsonb;
begin
    with base as (
        select
            py.predicted_yield_t_ha as yield_t,
            fp.soil_type,
            ce.rice_variety as variety,
            ce.actual_crop_establishment_method as method
        from public.predicted_yields py
        join public.fields f on py.mfid_id = f.mfid_id
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
          and (p_province is null or exists (select 1 from public.addresses a where a.barangay_id = f.barangay_id and a.province = p_province))
          and (p_municipality is null or exists (select 1 from public.addresses a where a.barangay_id = f.barangay_id and a.city_municipality = p_municipality))
          and (p_barangay is null or exists (select 1 from public.addresses a where a.barangay_id = f.barangay_id and a.barangay = p_barangay))
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
        select coalesce(avg(yield_t), 0) as overall_avg
        from base
    ),
    soil_variety_agg as (
        select
            soil_type,
            variety,
            avg(yield_t) as avg_yield_t_ha,
            count(*) as count
        from base
        where soil_type is not null and variety is not null
        group by soil_type, variety
    )
    select
        (select overall_avg from overall),
        (select jsonb_build_object('value', avg_yield_t_ha, 'soil_type', soil_type, 'variety', variety)
         from soil_variety_agg order by avg_yield_t_ha desc limit 1),
        (select jsonb_agg(
            jsonb_build_object('soil_type', soil_type, 'variety', variety, 'yield', avg_yield_t_ha, 'count', count)
            order by avg_yield_t_ha desc)
         from soil_variety_agg)
    into avg_yield, highest, ranking;

    result := jsonb_build_object(
        'average_yield', avg_yield,
        'highest_soil_variety', highest,
        'ranking', coalesce(ranking, '[]'::jsonb)
    );

    return result;
end;
$$;


create or replace function predicted_yield_per_year()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    ranking jsonb;
    avg_yield numeric;
    result jsonb;
begin
    with year_agg as (
        select
            s.season_year,
            avg(py.predicted_yield_t_ha) as avg_yield_t_ha,
            count(*) as count
        from public.predicted_yields py
        join public.seasons s on py.season_id = s.id
        group by s.season_year
        order by s.season_year
    )
    select
        (select jsonb_agg(
            jsonb_build_object('year', season_year, 'yield', avg_yield_t_ha, 'count', count)
            order by season_year)
         from year_agg),
        (select coalesce(avg(avg_yield_t_ha), 0) from year_agg)
    into ranking, avg_yield;

    result := jsonb_build_object(
        'average_yield', avg_yield,
        'ranking', coalesce(ranking, '[]'::jsonb)
    );

    return result;
end;
$$;


create or replace function predicted_harvest_distribution_by_month(
    p_season_id int default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    ranking jsonb;
    total_yield numeric;
    result jsonb;
begin
    with harvest_est as (
        select
            py.predicted_yield_t_ha,
            date_trunc('month', (fp.est_crop_establishment_date + (ce.rice_variety_maturity_duration || ' days')::interval)) as harvest_month
        from public.predicted_yields py
        join public.fields f on py.mfid_id = f.mfid_id
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
          and fp.est_crop_establishment_date is not null
          and ce.rice_variety_maturity_duration is not null
    )
    select
        jsonb_agg(
            jsonb_build_object('month', to_char(harvest_month, 'Month'), 'yield', sum_yield)
            order by harvest_month
        ),
        coalesce(sum(sum_yield), 0)
    into ranking, total_yield
    from (
        select harvest_month, sum(predicted_yield_t_ha) as sum_yield
        from harvest_est
        group by harvest_month
    ) sub;

    result := jsonb_build_object(
        'total_yield', total_yield,
        'ranking', coalesce(ranking, '[]'::jsonb)
    );

    return result;
end;
$$;
