create or replace function public.summary_form_count(p_season_id int default null)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    target_season_id int;
    season_info jsonb;
    counts_record record;
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
        return jsonb_build_object('season', null, 'data', '[]'::jsonb);
    end if;

    select jsonb_build_object(
        'start_date', s.start_date,
        'end_date', s.end_date,
        'semester', s.semester,
        'season_year', s.season_year
    ) into season_info
    from public.seasons s
    where s.id = target_season_id;

    select
        coalesce(count(*) filter (where activity_type = 'field-data'), 0) as field_plannings_count,
        coalesce(count(*) filter (where activity_type = 'cultural-management'), 0) as crop_establishments_count,
        coalesce(count(*) filter (where activity_type = 'nutrient-management'), 0) as fertilization_records_count,
        coalesce(count(*) filter (where activity_type = 'production'), 0) as harvest_records_count,
        coalesce(count(*) filter (where activity_type = 'damage-assessment'), 0) as damage_assessments_count,
        coalesce(count(*) filter (where activity_type = 'monitoring-visit'), 0) as monitoring_visits_count
    into counts_record
    from public.field_activity_details  -- assuming this view/table has a season_id column
    where season_id = target_season_id;

    return jsonb_build_object(
        'season', season_info,
        'data', jsonb_build_array(
            jsonb_build_object('form', 'field_plannings', 'count', counts_record.field_plannings_count),
            jsonb_build_object('form', 'crop_establishments', 'count', counts_record.crop_establishments_count),
            jsonb_build_object('form', 'fertilization_records', 'count', counts_record.fertilization_records_count),
            jsonb_build_object('form', 'harvest_records', 'count', counts_record.harvest_records_count),
            jsonb_build_object('form', 'damage_assessments', 'count', counts_record.damage_assessments_count),
            jsonb_build_object('form', 'monitoring_visits', 'count', counts_record.monitoring_visits_count)
        )
    );
end;
$$;
