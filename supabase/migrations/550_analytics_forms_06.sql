create or replace function public.summary_form_count(p_season_id int default null)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    target_season_id int;
    season_info jsonb;
    result jsonb;
    form_types text[];
    statuses text[];
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

    if target_season_id is null then
        return jsonb_build_object('season', null, 'data', '{}'::jsonb);
    end if;

    -- Get all activity_type enum values (exact labels)
    select array_agg(enumlabel order by enumlabel)
    into form_types
    from pg_enum
    where enumtypid = 'public.activity_type'::regtype;

    -- Get all verification_status enum values
    select array_agg(enumlabel order by enumlabel)
    into statuses
    from pg_enum
    where enumtypid = 'public.verification_status'::regtype;

    -- Add 'unknown' for NULL statuses
    statuses := statuses || ARRAY['unknown'];

    -- Fetch season metadata
    select jsonb_build_object(
        'start_date', s.start_date,
        'end_date', s.end_date,
        'semester', s.semester,
        'season_year', s.season_year
    ) into season_info
    from public.seasons s
    where s.id = target_season_id;

    -- Generate all combinations and aggregate counts
    with combinations as (
        select
            f as form,
            s as status
        from unnest(form_types) f(form)
        cross join unnest(statuses) s(status)
    ),
    actual_counts as (
        select
            activity_type::text as form,
            coalesce(verification_status::text, 'unknown') as status,
            count(*) as count
        from public.field_activity_details
        where season_id = target_season_id
        group by activity_type, verification_status
    ),
    full_data as (
        select
            c.form,
            c.status,
            coalesce(ac.count, 0) as count
        from combinations c
        left join actual_counts ac on c.form = ac.form and c.status = ac.status
    ),
    per_form as (
        select
            form,
            jsonb_object_agg(status, count) as status_counts
        from full_data
        group by form
    )
    select jsonb_build_object(
        'season', season_info,
        'data', (select jsonb_object_agg(form, status_counts) from per_form)
    ) into result;

    return result;
end;
$$;
