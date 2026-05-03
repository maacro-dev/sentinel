
create or replace function public.hierarchical_yields(
    p_season_id int default null,
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
    result jsonb;
begin
    with barangay_data as (
        select
            p.name as province,
            cm.name as municipality,
            b.name as barangay,
            sum(hr.bags_harvested * hr.avg_bag_weight_kg) as total_kg,
            sum(hr.area_harvested_ha) as total_area_ha
        from public.harvest_records hr
        join public.field_activities fa on hr.id = fa.id
        join public.fields f on fa.field_id = f.id
        join public.addresses a on f.barangay_id = a.barangay_id
        join public.barangays b on a.barangay_id = b.id
        join public.cities_municipalities cm on b.city_municipality_id = cm.id
        join public.provinces p on cm.province_id = p.id
        left join public.crop_establishments ce on ce.id = (
            select id from public.field_activities
            where field_id = fa.field_id
              and season_id = fa.season_id
              and activity_type = 'cultural-management'
            limit 1
        )
        where (p_season_id is null or fa.season_id = p_season_id)
          and (p_variety_name is null or
               case p_variety_name
                   when 'NSIC' then ce.rice_variety ilike '%nsic%'
                   when 'PSB' then ce.rice_variety ilike '%psb%'
                   when 'Others' then not (ce.rice_variety ilike '%nsic%' or ce.rice_variety ilike '%psb%')
                   else true
               end)
          and (p_method_name is null or
               (p_method_name = 'Direct-seeded' and ce.actual_crop_establishment_method ilike '%direct%seed%') or
               (p_method_name = 'Transplanted' and ce.actual_crop_establishment_method ilike '%transplant%'))
          and (p_fertilizer_type is null or exists (
              select 1
              from public.field_activities fa_nm
              join public.fertilization_records fr on fr.id = fa_nm.id
              join public.fertilizer_applications fapp on fapp.fertilization_record_id = fr.id
              where fa_nm.field_id = fa.field_id
                and fa_nm.season_id = fa.season_id
                and fapp.fertilizer_type = p_fertilizer_type
          ))
        group by p.name, cm.name, b.name
    ),
    municipality_agg as (
        select
            province,
            municipality,
            sum(total_kg) as total_kg,
            sum(total_area_ha) as total_area_ha,
            jsonb_agg(
                jsonb_build_object(
                    'barangay', barangay,
                    'avg_yield_t_per_ha',
                    case when total_area_ha > 0 then round((total_kg / total_area_ha / 1000)::numeric, 2) else 0 end
                ) order by barangay
            ) as barangays
        from barangay_data
        group by province, municipality
    ),
    province_agg as (
        select
            province,
            sum(total_kg) as total_kg,
            sum(total_area_ha) as total_area_ha,
            jsonb_agg(
                jsonb_build_object(
                    'municipality', municipality,
                    'avg_yield_t_per_ha',
                    case when total_area_ha > 0 then round((total_kg / total_area_ha / 1000)::numeric, 2) else 0 end,
                    'barangays', barangays
                ) order by municipality
            ) as municipalities
        from municipality_agg
        group by province
    ),
    all_provinces as (
        select name as province
        from public.provinces
    )
    select jsonb_agg(
        jsonb_build_object(
            'province', ap.province,
            'avg_yield_t_per_ha',
            case
                when pa.total_area_ha is null or pa.total_area_ha = 0 then 0
                else round((pa.total_kg / pa.total_area_ha / 1000)::numeric, 2)
            end,
            'municipalities', coalesce(pa.municipalities, '[]'::jsonb)
        ) order by ap.province
    ) into result
    from all_provinces ap
    left join province_agg pa on ap.province = pa.province;

    return coalesce(result, '[]'::jsonb);
end;
$$;
