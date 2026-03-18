create or replace function public.crop_establishment_method_summary(p_season_id int default null)
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
