create or replace function public.crop_establishment_method_summary(
    p_season_id int default null,
    p_province_name text default null,
    p_municipality_name text default null,
    p_barangay_name text default null,
    p_variety_name text default null,
    p_method_name text default null,
    p_fertilizer_type text default null
)
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
    percent_diff numeric := 0;
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
        count(*) filter (where ce.actual_crop_establishment_method ilike '%direct%seed%'),
        count(*) filter (where ce.actual_crop_establishment_method ilike '%transplant%')
    into direct_count, transplant_count
    from public.field_activities fa
    join public.crop_establishments ce on fa.id = ce.id
    join public.fields f on fa.field_id = f.id
    join public.addresses a on f.barangay_id = a.barangay_id
    where fa.season_id = target_season_id
      and (p_province_name is null or a.province = p_province_name)
      and (p_municipality_name is null or a.city_municipality = p_municipality_name)
      and (p_barangay_name is null or a.barangay = p_barangay_name)
      -- variety filter
      and (p_variety_name is null or
           case p_variety_name
               when 'NSIC' then ce.rice_variety ilike '%nsic%'
               when 'PSB' then ce.rice_variety ilike '%psb%'
               when 'Others' then not (ce.rice_variety ilike '%nsic%' or ce.rice_variety ilike '%psb%')
               else true
           end)
      -- method filter (exact match)
      and (p_method_name is null or ce.actual_crop_establishment_method = p_method_name)
      -- fertiliser filter (field activity must have an application of that type)
      and (p_fertilizer_type is null or exists (
          select 1
          from public.field_activities fa_nm
          join public.fertilization_records fr on fr.id = fa_nm.id
          join public.fertilizer_applications fapp on fapp.fertilization_record_id = fr.id
          where fa_nm.field_id = fa.field_id   -- same field
            and fa_nm.season_id = fa.season_id -- same season
            and fapp.fertilizer_type = p_fertilizer_type
      ));

    total := direct_count + transplant_count;

    if total > 0 then
        if direct_count > transplant_count then
            percent_diff := round(((direct_count - transplant_count)::numeric / total) * 100, 2);
        elsif transplant_count > direct_count then
            percent_diff := round(((transplant_count - direct_count)::numeric / total) * 100, 2);
        else
            percent_diff := 0;
        end if;
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

create or replace function public.rice_variety_summary(
    p_season_id int default null,
    p_province_name text default null,
    p_municipality_name text default null,
    p_barangay_name text default null,
    p_method_name text default null,
    p_fertilizer_type text default null
)
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
        count(*) filter (where upper(ce.rice_variety) not like '%NSIC%'
                     and upper(ce.rice_variety) not like '%PSB%') as other
    into nsic_count, psb_count, other_count
    from public.field_activities fa
    join public.crop_establishments ce on fa.id = ce.id
    join public.fields f on fa.field_id = f.id
    join public.addresses a on f.barangay_id = a.barangay_id
    where fa.season_id = target_season_id
      and (p_province_name is null or a.province = p_province_name)
      and (p_municipality_name is null or a.city_municipality = p_municipality_name)
      and (p_barangay_name is null or a.barangay = p_barangay_name)
      -- method filter (exact match)
      and (p_method_name is null or ce.actual_crop_establishment_method = p_method_name)
      -- fertiliser filter (field must have had an application of that type)
      and (p_fertilizer_type is null or exists (
          select 1
          from public.field_activities fa_nm
          join public.fertilization_records fr on fr.id = fa_nm.id
          join public.fertilizer_applications fapp on fapp.fertilization_record_id = fr.id
          where fa_nm.field_id = fa.field_id
            and fa_nm.season_id = fa.season_id
            and fapp.fertilizer_type = p_fertilizer_type
      ));

    total := nsic_count + psb_count + other_count;

    -- dominant calculation unchanged …
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

create or replace function public.fertilizer_type_summary(
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
    v_total_apps int;
    v_most_type jsonb;
    v_most_brand jsonb;
    v_ranking jsonb;
    result jsonb;
begin
    with base as (
        select
            fa.id as field_activity_id,
            fr.id as fertilization_record_id,
            fa.season_id,
            a.province,
            a.city_municipality as municipality,
            a.barangay,
            ce.actual_crop_establishment_method as method,
            ce.rice_variety as variety,
            fapp.fertilizer_type,
            fapp.brand
        from public.fertilizer_applications fapp
        join public.fertilization_records fr on fapp.fertilization_record_id = fr.id
        join public.field_activities fa on fr.id = fa.id
        join public.fields f on fa.field_id = f.id
        join public.addresses a on f.barangay_id = a.barangay_id
        left join public.crop_establishments ce on ce.id = (
            select id from public.field_activities
            where field_id = fa.field_id
              and season_id = fa.season_id
              and activity_type = 'cultural-management'
            limit 1
        )
        where (p_season_id is null or fa.season_id = p_season_id)
          and (p_province is null or a.province = p_province)
          and (p_municipality is null or a.city_municipality = p_municipality)
          and (p_barangay is null or a.barangay = p_barangay)
          and (p_method is null or ce.actual_crop_establishment_method ilike '%' || p_method || '%')
          and (p_variety is null or
               case p_variety
                   when 'NSIC' then ce.rice_variety ilike '%nsic%'
                   when 'PSB' then ce.rice_variety ilike '%psb%'
                   when 'Others' then not (ce.rice_variety ilike '%nsic%' or ce.rice_variety ilike '%psb%')
                   else true
               end)
    ),
    totals as (
        select count(*) as total_apps from base
    ),
    all_types as (
        select distinct fertilizer_type from public.fertilizer_applications
    ),
    type_counts as (
        select at.fertilizer_type, coalesce(cnt, 0) as cnt
        from all_types at
        left join (
            select fertilizer_type, count(*) as cnt
            from base
            group by fertilizer_type
        ) bc on at.fertilizer_type = bc.fertilizer_type
    ),
    brand_counts as (
        select brand, count(*) as cnt
        from base
        group by brand
    )
    select
        (select total_apps from totals),
        (select jsonb_build_object('type', fertilizer_type, 'count', cnt)
         from type_counts order by cnt desc, fertilizer_type limit 1),
        (select jsonb_build_object('brand', brand, 'count', cnt)
         from brand_counts order by cnt desc limit 1),
        (select jsonb_agg(
            jsonb_build_object('type', fertilizer_type, 'count', cnt)
            order by fertilizer_type   -- stable alphabetical order
         ) from type_counts)
    into v_total_apps, v_most_type, v_most_brand, v_ranking;

    result := jsonb_build_object(
        'total_applications', v_total_apps,
        'most_common_type', v_most_type,
        'most_common_brand', v_most_brand,
        'ranking', coalesce(v_ranking, '[]'::jsonb)
    );

    return result;
end;
$$;

-- COMPARATIVE

create or replace function public.yield_by_location(
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
        from public.field_activities fa
        join public.harvest_records hr on hr.id = fa.id
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
          and (p_method is null or ce.actual_crop_establishment_method ilike '%' || p_method || '%')
          and (p_variety is null or
               case p_variety
                   when 'NSIC' then ce.rice_variety ilike '%nsic%'
                   when 'PSB' then ce.rice_variety ilike '%psb%'
                   when 'Others' then not (ce.rice_variety ilike '%nsic%' or ce.rice_variety ilike '%psb%')
                   else true
               end)
          and hr.area_harvested_ha > 0
          and (hr.bags_harvested * hr.avg_bag_weight_kg) > 0  -- exclude zero yield
    ),
    aggregated as (
        select
            case
                when p_barangay is not null then barangay_name
                when p_municipality is not null then barangay_name
                when p_province is not null then municipality_name
                else province_name
            end as location,
            avg(yield_t / area_harvested_ha) as avg_yield_t_ha
        from base
        group by location
    ),
    all_locations as (
        select distinct
            case
                when p_barangay is not null then b.name
                when p_municipality is not null then b.name
                when p_province is not null then cm.name
                else p.name
            end as location
        from public.provinces p
        left join public.cities_municipalities cm on
            (p_province is not null and cm.province_id = p.id) or
            (p_province is null)
        left join public.barangays b on
            (p_municipality is not null and b.city_municipality_id = cm.id) or
            (p_municipality is null)
        where (p_province is null or p.name = p_province)
          and (p_municipality is null or cm.name = p_municipality)
          and (p_barangay is null or b.name = p_barangay)
    ),
    overall as (
        select avg(yield_t / area_harvested_ha) as overall_avg
        from base
    ),
    final_ranking as (
        select
            al.location,
            coalesce(ag.avg_yield_t_ha, 0) as avg_yield_t_ha
        from all_locations al
        left join aggregated ag on al.location = ag.location
    )
    select
        (select overall_avg from overall),
        (select jsonb_build_object('value', avg_yield_t_ha, 'location', location)
         from final_ranking where avg_yield_t_ha > 0 order by avg_yield_t_ha desc limit 1),
        (select jsonb_build_object('value', avg_yield_t_ha, 'location', location)
         from final_ranking where avg_yield_t_ha > 0 order by avg_yield_t_ha asc limit 1),
        (select jsonb_agg(
            jsonb_build_object('location', location, 'yield', avg_yield_t_ha)
            order by avg_yield_t_ha desc
         )
         from final_ranking where avg_yield_t_ha > 0)
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
        'average_yield', coalesce(avg_yield, 0),
        'highest_yield', coalesce(highest, 'null'::jsonb),
        'lowest_yield', coalesce(lowest, 'null'::jsonb),
        'gap_percentage', gap_percentage,
        'ranking', coalesce(ranking, '[]'::jsonb)
    );

    return result;
end;
$$;



create or replace function public.yield_by_method(
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
          and hr.area_harvested_ha > 0
          and (hr.bags_harvested * hr.avg_bag_weight_kg) > 0   -- exclude zero yield
    ),
    overall as (
        select avg(yield_t / area_harvested_ha) as overall_avg
        from base
    ),
    all_methods as (
        select unnest(array['direct-seeded', 'transplanted']) as method
    ),
    method_agg as (
        select
            am.method,
            avg(b.yield_t / b.area_harvested_ha) as avg_yield_t_ha,
            count(b.area_harvested_ha) as record_count
        from all_methods am
        left join base b on b.method = am.method
        group by am.method
    )
    select
        (select coalesce(overall_avg, 0) from overall),
        (select jsonb_build_object('value', avg_yield_t_ha, 'method', method)
         from method_agg
         where avg_yield_t_ha > 0
         order by avg_yield_t_ha desc
         limit 1),
        (select jsonb_build_object('value', avg_yield_t_ha, 'method', method)
         from method_agg
         where avg_yield_t_ha > 0
         order by avg_yield_t_ha asc
         limit 1),
        (select jsonb_agg(
            jsonb_build_object('method', method, 'yield', avg_yield_t_ha, 'count', record_count)
            order by avg_yield_t_ha desc)
         from method_agg
         where avg_yield_t_ha > 0)
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
        'highest_method', coalesce(highest, 'null'::jsonb),
        'lowest_method', coalesce(lowest, 'null'::jsonb),
        'gap_percentage', gap_percentage,
        'ranking', coalesce(ranking, '[]'::jsonb)
    );

    return result;
end;
$$;


create or replace function public.yield_by_variety(
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
            nullif(trim(coalesce(ce.rice_variety, '')), '') as variety
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
             or (upper(p_variety) = 'NSIC' and coalesce(ce.rice_variety, '') ilike '%nsic%')
             or (upper(p_variety) = 'PSB' and coalesce(ce.rice_variety, '') ilike '%psb%')
             or (upper(p_variety) = 'OTHERS' and (coalesce(ce.rice_variety, '') NOT ILIKE '%nsic%' and coalesce(ce.rice_variety, '') NOT ILIKE '%psb%'))
             or (ce.rice_variety = p_variety)
          )
          and hr.area_harvested_ha > 0
          and (hr.bags_harvested * hr.avg_bag_weight_kg) > 0   -- exclude zero yield
    ),
    overall as (
        select avg(yield_t / area_harvested_ha) as overall_avg
        from base
    ),
    variety_agg as (
        select
            variety,
            avg(yield_t / area_harvested_ha) as avg_yield_t_ha
        from base
        where variety is not null
        group by variety
    )
    select
        (select coalesce(overall_avg, 0) from overall),
        (select jsonb_build_object('value', avg_yield_t_ha, 'variety', variety)
         from variety_agg
         where avg_yield_t_ha > 0
         order by avg_yield_t_ha desc
         limit 1),
        (select jsonb_agg(jsonb_build_object('variety', variety, 'yield', avg_yield_t_ha) order by avg_yield_t_ha desc)
         from variety_agg
         where avg_yield_t_ha > 0)
    into avg_yield, highest, ranking;

    result := jsonb_build_object(
        'average_yield', avg_yield,
        'highest_variety', coalesce(highest, 'null'::jsonb),
        'ranking', coalesce(ranking, '[]'::jsonb)
    );

    return result;
end;
$$;


create or replace function public.damage_by_location(
    p_season_id int default null,
    p_province text default null,
    p_municipality text default null,
    p_barangay text default null,
    p_cause text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_total_reports numeric;
    v_total_area numeric;
    v_highest_area jsonb;
    v_highest_count jsonb;
    v_ranking jsonb;
    result jsonb;
begin
    with base as (
        select
            da.affected_area_ha,
            da.cause,
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
        left join public.damage_assessments da on da.id = fa.id
        where (p_season_id is null or fa.season_id = p_season_id)
          and (p_province is null or p.name = p_province)
          and (p_municipality is null or cm.name = p_municipality)
          and (p_barangay is null or b.name = p_barangay)
          and (p_cause is null or da.cause ilike '%' || p_cause || '%')
          and da.affected_area_ha > 0                    -- exclude zero or null damage area
          and da.cause is not null                       -- only valid damage records
    ),
    totals as (
        select
            count(*) as total_reports,
            coalesce(sum(affected_area_ha), 0) as total_area
        from base
    ),
    ranked as (
        select
            case
                when p_barangay is not null then barangay_name
                when p_municipality is not null then barangay_name
                when p_province is not null then municipality_name
                else province_name
            end as location,
            count(*) as damage_count,
            coalesce(sum(affected_area_ha), 0) as total_affected_area
        from base
        group by location
    )
    select
        (select total_reports from totals),
        (select total_area from totals),
        (select jsonb_build_object('value', total_affected_area, 'location', location)
         from ranked where total_affected_area > 0 order by total_affected_area desc limit 1),
        (select jsonb_build_object('value', damage_count, 'location', location)
         from ranked where damage_count > 0 order by damage_count desc limit 1),
        (select jsonb_agg(
            jsonb_build_object(
                'location', location,
                'damage_count', damage_count,
                'total_affected_area', total_affected_area
            )
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
                    else 0
                end,
                total_affected_area desc
         )
         from ranked where total_affected_area > 0)
    into v_total_reports, v_total_area, v_highest_area, v_highest_count, v_ranking;

    result := jsonb_build_object(
        'total_damage_reports', coalesce(v_total_reports, 0),
        'total_affected_area_ha', coalesce(v_total_area, 0),
        'highest_affected_area', coalesce(v_highest_area, 'null'::jsonb),
        'highest_damage_count', coalesce(v_highest_count, 'null'::jsonb),
        'ranking', coalesce(v_ranking, '[]'::jsonb)
    );

    return result;
end;
$$;

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


create or replace function public.get_available_locations(p_season_id int default null)
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

    with province_list as (
        select distinct p.name
        from public.field_activities fa
        join public.fields f on fa.field_id = f.id
        join public.addresses a on f.barangay_id = a.barangay_id
        join public.provinces p on a.province_id = p.id
        where fa.season_id = target_season_id
    ),
    municipality_list as (
        select distinct cm.name, p.name as province_name
        from public.field_activities fa
        join public.fields f on fa.field_id = f.id
        join public.addresses a on f.barangay_id = a.barangay_id
        join public.cities_municipalities cm on a.city_municipality_id = cm.id
        join public.provinces p on a.province_id = p.id
        where fa.season_id = target_season_id
    ),
    barangay_list as (
        select distinct b.name, cm.name as municipality_name
        from public.field_activities fa
        join public.fields f on fa.field_id = f.id
        join public.addresses a on f.barangay_id = a.barangay_id
        join public.barangays b on a.barangay_id = b.id
        join public.cities_municipalities cm on a.city_municipality_id = cm.id
        where fa.season_id = target_season_id
    )
    select jsonb_build_object(
        'provinces', coalesce((select jsonb_agg(name order by name) from province_list), '[]'::jsonb),
        'municipalities', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'province', province_name) order by province_name, name) from municipality_list), '[]'::jsonb),
        'barangays', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'municipality', municipality_name) order by municipality_name, name) from barangay_list), '[]'::jsonb)
    ) into result;

    return result;
end;
$$;
