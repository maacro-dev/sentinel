create or replace function analytics.crop_establishment_method_summary(p_season_id int default null)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    target_season_id int;
    direct_count int := 0;
    transplant_count int := 0;
    total int := 0;
    percent_diff numeric;
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
        return jsonb_build_object(
            'direct_seeded_count', 0,
            'transplanted_count', 0,
            'total', 0,
            'percent_difference', 0
        );
    end if;

    select
        count(*) filter (where ce.actual_crop_establishment_method ilike '%direct%seeded%') as direct,
        count(*) filter (where ce.actual_crop_establishment_method ilike '%transplant%') as transplant
    into direct_count, transplant_count
    from public.field_activities fa
    join public.crop_establishments ce on fa.id = ce.id
    where fa.season_id = target_season_id;

    total := direct_count + transplant_count;

    if transplant_count > 0 then
        percent_diff := round(((direct_count - transplant_count)::numeric / transplant_count) * 100, 2);
    elsif direct_count > 0 then
        percent_diff := 100;
    else
        percent_diff := 0;
    end if;

    result := jsonb_build_object(
        'direct_seeded_count', direct_count,
        'transplanted_count', transplant_count,
        'total', total,
        'percent_difference', percent_diff
    );

    return result;
end;
$$;

create or replace function analytics.rice_variety_summary(p_season_id int default null)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    target_season_id int;
    nsic_count int := 0;
    psb_count int := 0;
    other_count int := 0;
    total int := 0;
    dominant text;
    percent_diff numeric;
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
        return jsonb_build_object(
            'nsic_count', 0,
            'psb_count', 0,
            'other_count', 0,
            'total', 0,
            'dominant', 'None',
            'percent_difference', 0
        );
    end if;

    select
        count(*) filter (where upper(ce.rice_variety) like '%NSIC%') as nsic,
        count(*) filter (where upper(ce.rice_variety) like '%PSB%') as psb,
        count(*) filter (where upper(ce.rice_variety) not like '%NSIC%' and upper(ce.rice_variety) not like '%PSB%') as other
    into nsic_count, psb_count, other_count
    from public.field_activities fa
    join public.crop_establishments ce on fa.id = ce.id
    where fa.season_id = target_season_id;

    total := nsic_count + psb_count + other_count;

    -- Determine dominant variety and percentage difference
    if nsic_count >= psb_count and nsic_count >= other_count then
        dominant := 'NSIC';
        if nsic_count > 0 then
            if psb_count + other_count > 0 then
                percent_diff := round(((nsic_count - greatest(psb_count, other_count))::numeric / greatest(psb_count, other_count)) * 100, 2);
            else
                percent_diff := 100;
            end if;
        else
            percent_diff := 0;
        end if;
    elsif psb_count >= nsic_count and psb_count >= other_count then
        dominant := 'PSB';
        if psb_count > 0 then
            if nsic_count + other_count > 0 then
                percent_diff := round(((psb_count - greatest(nsic_count, other_count))::numeric / greatest(nsic_count, other_count)) * 100, 2);
            else
                percent_diff := 100;
            end if;
        else
            percent_diff := 0;
        end if;
    else
        dominant := 'Others';
        if other_count > 0 then
            if nsic_count + psb_count > 0 then
                percent_diff := round(((other_count - greatest(nsic_count, psb_count))::numeric / greatest(nsic_count, psb_count)) * 100, 2);
            else
                percent_diff := 100;
            end if;
        else
            percent_diff := 0;
        end if;
    end if;

    result := jsonb_build_object(
        'nsic_count', nsic_count,
        'psb_count', psb_count,
        'other_count', other_count,
        'total', total,
        'dominant', dominant,
        'percent_difference', percent_diff
    );

    return result;
end;
$$;



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
            p.id as province_id,
            p.name as province_name,
            cm.id as municipality_id,
            cm.name as municipality_name,
            b.id as barangay_id,
            b.name as barangay_name
        from public.provinces p
        left join public.addresses a on a.province_id = p.id
        left join public.cities_municipalities cm on cm.id = a.city_municipality_id
        left join public.barangays b on b.id = a.barangay_id
        left join public.fields f on f.barangay_id = b.id
        left join public.field_activities fa on fa.field_id = f.id
        left join public.harvest_records hr on hr.id = fa.id
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
    ranked as (
        select
            case
                when p_barangay is not null then barangay_name
                when p_municipality is not null then barangay_name
                when p_province is not null then municipality_name
                else province_name
            end as location,
            avg(yield_t / nullif(area_harvested_ha, 0)) as avg_yield_t_ha
        from base
        where area_harvested_ha > 0
        group by location
    )
    select
        (select overall_avg from overall),
        (select jsonb_build_object('value', avg_yield_t_ha, 'location', location)
         from ranked order by avg_yield_t_ha desc limit 1),
        (select jsonb_build_object('value', avg_yield_t_ha, 'location', location)
         from ranked order by avg_yield_t_ha asc limit 1),
        (select jsonb_agg(
            jsonb_build_object('location', location, 'yield', avg_yield_t_ha)
            order by
                case
                    when p_province is null and p_municipality is null and p_barangay is null then
                        case location
                            when 'Aklan' then 1
                            when 'Antique' then 2
                            when 'Capiz' then 3
                            when 'Iloilo' then 4
                            when 'Guimaras' then 5
                            else 6
                        end
                    else 0  -- all locations get same priority, then sort by yield desc
                end,
                avg_yield_t_ha desc
         )
         from ranked)
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
        'highest_yield', coalesce(highest, 'null'::jsonb),
        'lowest_yield', coalesce(lowest, 'null'::jsonb),
        'gap_percentage', gap_percentage,
        'ranking', coalesce(ranking, '[]'::jsonb)
    );

    return result;
end;
$$;



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


create or replace function analytics.yield_by_variety(
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
            hr.area_harvested_ha,
            (hr.bags_harvested * hr.avg_bag_weight_kg) / 1000.0 as yield_t,
            p.name as province,
            cm.name as municipality,
            b.name as barangay,
            ce.actual_crop_establishment_method as method,
            nullif(trim(coalesce(ce.rice_variety, '')), '') as variety -- keep the real variety string (distinct)
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
          and (
                p_variety is null
             -- allow special filter tokens but do NOT collapse actual variety strings in the result
             or (upper(p_variety) = 'NSIC' and coalesce(ce.rice_variety, '') ilike '%nsic%')
             or (upper(p_variety) = 'PSB' and coalesce(ce.rice_variety, '') ilike '%psb%')
             or (upper(p_variety) = 'OTHERS' and (coalesce(ce.rice_variety, '') NOT ILIKE '%nsic%' and coalesce(ce.rice_variety, '') NOT ILIKE '%psb%'))
             or (ce.rice_variety = p_variety)
          )
    ),
    overall as (
        select coalesce(avg(yield_t / nullif(area_harvested_ha, 0)), 0) as overall_avg
        from base
        where area_harvested_ha > 0
    ),
    -- aggregate by the actual variety string. exclude NULL/empty varieties so we get distinct real varieties
    variety_agg as (
        select
            variety,
            avg(yield_t / nullif(area_harvested_ha, 0)) as avg_yield_t_ha
        from base
        where area_harvested_ha > 0
          and variety is not null
        group by variety
    )
    select
        (select overall_avg from overall),
        -- highest variety explicitly ordered to ensure correct top result
        (select jsonb_build_object('value', avg_yield_t_ha, 'variety', variety)
         from variety_agg
         order by avg_yield_t_ha desc
         limit 1),
        -- return each distinct variety (no grouping into "Others") ordered by avg yield desc
        (select jsonb_agg(jsonb_build_object('variety', variety, 'yield', avg_yield_t_ha) order by avg_yield_t_ha desc)
         from variety_agg)
    into avg_yield, highest, ranking;

    result := jsonb_build_object(
        'average_yield', avg_yield,
        'highest_variety', highest,
        'ranking', coalesce(ranking, '[]'::jsonb)
    );

    return result;
end;
$$;
