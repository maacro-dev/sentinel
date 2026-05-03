create or replace function public.trend_data_collection(p_season_id int default null)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    collection_data jsonb;
begin
    with collection_rate as (
        select
            date(fa.collected_at) as date,
            count(*) as data_collected
        from public.field_activities fa
        where (p_season_id is null or fa.season_id = p_season_id)
        group by date(fa.collected_at)
    )
    select coalesce(
        jsonb_agg(jsonb_build_object('date', cr.date, 'data_collected', cr.data_collected) order by cr.date),
        '[]'::jsonb
    ) into collection_data
    from collection_rate cr;

    return collection_data;
end;
$$;
