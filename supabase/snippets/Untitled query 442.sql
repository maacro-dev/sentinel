create or replace function public.get_available_locations_for_predictions(p_season_id int default null)
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
        join public.predicted_yields py on f.mfid_id = py.mfid_id and fa.season_id = py.season_id
        where fa.season_id = target_season_id
    ),
    municipality_list as (
        select distinct cm.name, p.name as province_name
        from public.field_activities fa
        join public.fields f on fa.field_id = f.id
        join public.addresses a on f.barangay_id = a.barangay_id
        join public.cities_municipalities cm on a.city_municipality_id = cm.id
        join public.provinces p on a.province_id = p.id
        join public.predicted_yields py on f.mfid_id = py.mfid_id and fa.season_id = py.season_id
        where fa.season_id = target_season_id
    ),
    barangay_list as (
        select distinct b.name, cm.name as municipality_name
        from public.field_activities fa
        join public.fields f on fa.field_id = f.id
        join public.addresses a on f.barangay_id = a.barangay_id
        join public.barangays b on a.barangay_id = b.id
        join public.cities_municipalities cm on a.city_municipality_id = cm.id
        join public.predicted_yields py on f.mfid_id = py.mfid_id and fa.season_id = py.season_id
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
