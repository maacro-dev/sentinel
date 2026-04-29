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