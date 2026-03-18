create or replace function public.trend_data_collection(p_season_id int default null)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    target_season_id int;
    season_info jsonb;
    collection_data jsonb;
begin
    -- Determine target season
    if p_season_id is null then
        select id into target_season_id
        from public.seasons
        order by start_date desc
        limit 1;
    else
        target_season_id := p_season_id;
    end if;

    -- If no season found, return empty structure
    if target_season_id is null then
        return jsonb_build_object('season', null, 'data', '[]'::jsonb);
    end if;

    -- Get season information
    select jsonb_build_object(
        'start_date', s.start_date,
        'end_date', s.end_date,
        'semester', s.semester,
        'season_year', s.season_year
    ) into season_info
    from public.seasons s
    where s.id = target_season_id;

    -- Calculate daily collection rate for the selected season
    with collection_rate as (
        select
            date(fa.collected_at) as date,
            count(*) as data_collected
        from public.field_activities fa
        where fa.season_id = target_season_id
        group by date(fa.collected_at)
    )
    select coalesce(
        jsonb_agg(jsonb_build_object('date', cr.date, 'data_collected', cr.data_collected) order by cr.date),
        '[]'::jsonb
    ) into collection_data
    from collection_rate cr;

    return jsonb_build_object('season', season_info, 'data', collection_data);
end;
$$;
