create or replace function public.summary_form_count(p_season_id int default null)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    result jsonb;
    form_types text[];
    statuses text[];
begin
    select array_agg(enumlabel order by enumlabel) into form_types
    from pg_enum where enumtypid = 'public.activity_type'::regtype;

    select array_agg(enumlabel order by enumlabel) into statuses
    from pg_enum where enumtypid = 'public.verification_status'::regtype;

    statuses := statuses || ARRAY['unknown'];

    with combinations as (
        select f as form, s as status
        from unnest(form_types) f(form)
        cross join unnest(statuses) s(status)
    ),
    actual_counts as (
        select
            activity_type::text as form,
            coalesce(verification_status::text, 'unknown') as status,
            count(*) as count
        from public.field_activity_details
        where (p_season_id is null or season_id = p_season_id)
        group by activity_type, verification_status
    ),
    full_data as (
        select c.form, c.status, coalesce(ac.count, 0) as count
        from combinations c
        left join actual_counts ac on c.form = ac.form and c.status = ac.status
    ),
    per_form as (
        select form, jsonb_object_agg(status, count) as status_counts
        from full_data group by form
    )
    select coalesce(
        (select jsonb_object_agg(form, status_counts) from per_form),
        '{}'::jsonb
    ) into result;

    return result;
end;
$$;
