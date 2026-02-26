
-- todo to clean


create or replace function analytics.dashboard_barangay_yield_rankings(p_season_id int default null)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    target_season_id int;
    top_json jsonb;
    bottom_json jsonb;
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
        return jsonb_build_object('top', '[]'::jsonb, 'bottom', '[]'::jsonb);
    end if;

    with harvest_agg as (
        select f.barangay_id,
               sum(hr.bags_harvested * hr.avg_bag_weight_kg) as total_kg,
               sum(hr.area_harvested_ha) as total_area
        from public.field_activities fa
        join public.harvest_records hr on hr.id = fa.id
        join public.fields f on fa.field_id = f.id
        where fa.season_id = target_season_id
        group by f.barangay_id
        having sum(hr.area_harvested_ha) > 0
    ),
    barangay_ranking as (
        select b.name as barangay,
               cm.name as municipality,
               p.name as province,
               (ha.total_kg / ha.total_area / 1000)::numeric(10,2) as avg_yield_t_per_ha,
               rank() over (order by (ha.total_kg / ha.total_area) desc) as yield_rank
        from harvest_agg ha
        join public.barangays b on b.id = ha.barangay_id
        join public.cities_municipalities cm on cm.id = b.city_municipality_id
        join public.provinces p on p.id = cm.province_id
    )
    select into top_json, bottom_json
        coalesce(
            (select jsonb_agg(
                jsonb_build_object(
                    'barangay', barangay,
                    'province', province,
                    'municipality', municipality,
                    'avg_yield_t_per_ha', avg_yield_t_per_ha,
                    'rank', yield_rank
                )
             ) from barangay_ranking where yield_rank <= 3),
            '[]'::jsonb
        ),
        coalesce(
            (select jsonb_agg(
                jsonb_build_object(
                    'barangay', barangay,
                    'province', province,
                    'municipality', municipality,
                    'avg_yield_t_per_ha', avg_yield_t_per_ha,
                    'rank', yield_rank
                )
             ) from (
                 select *,
                        rank() over (order by avg_yield_t_per_ha asc) as reverse_rank
                 from barangay_ranking
             ) r where reverse_rank <= 3),
            '[]'::jsonb
        );

    return jsonb_build_object('top', top_json, 'bottom', bottom_json);
end;
$$;
