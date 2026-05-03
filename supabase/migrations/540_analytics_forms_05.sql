create or replace function public.summary_form_progress(p_season_id int default null)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    curr record;
    prev record;
    previous_total_forms numeric := 0;
    current_total_forms numeric := 0;
    previous_completed_forms numeric := 0;
    current_completed_forms numeric := 0;
    previous_pending_forms numeric := 0;
    current_pending_forms numeric := 0;
    previous_rejected_forms numeric := 0;
    current_rejected_forms numeric := 0;
    previous_unknown_forms numeric := 0;
    current_unknown_forms numeric := 0;
    has_previous boolean := false;
    result jsonb;
begin
    if p_season_id is null then
        select
            coalesce(count(*), 0),
            coalesce(count(*) filter (where verification_status = 'approved'), 0),
            coalesce(count(*) filter (where verification_status = 'pending'), 0),
            coalesce(count(*) filter (where verification_status = 'rejected'), 0),
            coalesce(count(*) filter (where verification_status = 'unknown' or verification_status is null), 0)
        into
            current_total_forms, current_completed_forms, current_pending_forms,
            current_rejected_forms, current_unknown_forms
        from public.field_activities;

        result := jsonb_build_array(
            jsonb_build_object(
                'name', 'total_forms',
                'current_value', current_total_forms,
                'previous_value', 0,
                'percent_change', 0
            ),
            jsonb_build_object(
                'name', 'completed_forms',
                'current_value', current_completed_forms,
                'previous_value', 0,
                'percent_change', 0
            ),
            jsonb_build_object(
                'name', 'pending_forms',
                'current_value', current_pending_forms,
                'previous_value', 0,
                'percent_change', 0
            ),
            jsonb_build_object(
                'name', 'rejected_forms',
                'current_value', current_rejected_forms,
                'previous_value', 0,
                'percent_change', 0
            ),
            jsonb_build_object(
                'name', 'unknown_forms',
                'current_value', current_unknown_forms,
                'previous_value', 0,
                'percent_change', 0
            )
        );

        return result;
    end if;

    select * into curr
    from public.seasons
    where id = p_season_id;

    if not found then
        return '[]'::jsonb;
    end if;

    select * into prev from public.seasons
    where start_date < curr.start_date
    order by start_date desc
    limit 1;

    has_previous := prev is not null;

    if has_previous then
        select
            coalesce(count(*) filter (where fa.season_id = curr.id), 0),
            coalesce(count(*) filter (where fa.season_id = prev.id), 0),
            coalesce(count(*) filter (where fa.verification_status = 'approved' and fa.season_id = curr.id), 0),
            coalesce(count(*) filter (where fa.verification_status = 'approved' and fa.season_id = prev.id), 0),
            coalesce(count(*) filter (where fa.verification_status = 'pending' and fa.season_id = curr.id), 0),
            coalesce(count(*) filter (where fa.verification_status = 'pending' and fa.season_id = prev.id), 0),
            coalesce(count(*) filter (where fa.verification_status = 'rejected' and fa.season_id = curr.id), 0),
            coalesce(count(*) filter (where fa.verification_status = 'rejected' and fa.season_id = prev.id), 0),
            coalesce(count(*) filter (where (fa.verification_status = 'unknown' or fa.verification_status is null) and fa.season_id = curr.id), 0),
            coalesce(count(*) filter (where (fa.verification_status = 'unknown' or fa.verification_status is null) and fa.season_id = prev.id), 0)
        into
            current_total_forms,
            previous_total_forms,
            current_completed_forms,
            previous_completed_forms,
            current_pending_forms,
            previous_pending_forms,
            current_rejected_forms,
            previous_rejected_forms,
            current_unknown_forms,
            previous_unknown_forms
        from public.field_activities fa
        where fa.season_id in (curr.id, prev.id);
    else
        select
            coalesce(count(*), 0),
            coalesce(count(*) filter (where fa.verification_status = 'approved'), 0),
            coalesce(count(*) filter (where fa.verification_status = 'pending'), 0),
            coalesce(count(*) filter (where fa.verification_status = 'rejected'), 0),
            coalesce(count(*) filter (where fa.verification_status = 'unknown' or fa.verification_status is null), 0)
        into
            current_total_forms,
            current_completed_forms,
            current_pending_forms,
            current_rejected_forms,
            current_unknown_forms
        from public.field_activities fa
        where fa.season_id = curr.id;
    end if;

    result := jsonb_build_array(
        jsonb_build_object(
            'name', 'total_forms',
            'current_value', current_total_forms,
            'previous_value', previous_total_forms,
            'percent_change', case
                when previous_total_forms = 0 then
                    case when current_total_forms = 0 then 0.00 else 100 end
                else round(((current_total_forms - previous_total_forms)::numeric / previous_total_forms) * 100, 2)
            end
        ),
        jsonb_build_object(
            'name', 'completed_forms',
            'current_value', current_completed_forms,
            'previous_value', previous_completed_forms,
            'percent_change', case
                when previous_completed_forms = 0 then
                    case when current_completed_forms = 0 then 0.00 else 100 end
                else round(((current_completed_forms - previous_completed_forms)::numeric / previous_completed_forms) * 100, 2)
            end
        ),
        jsonb_build_object(
            'name', 'pending_forms',
            'current_value', current_pending_forms,
            'previous_value', previous_pending_forms,
            'percent_change', case
                when previous_pending_forms = 0 then
                    case when current_pending_forms = 0 then 0.00 else 100 end
                else round(((current_pending_forms - previous_pending_forms)::numeric / previous_pending_forms) * 100, 2)
            end
        ),
        jsonb_build_object(
            'name', 'rejected_forms',
            'current_value', current_rejected_forms,
            'previous_value', previous_rejected_forms,
            'percent_change', case
                when previous_rejected_forms = 0 then
                    case when current_rejected_forms = 0 then 0.00 else 100 end
                else round(((current_rejected_forms - previous_rejected_forms)::numeric / previous_rejected_forms) * 100, 2)
            end
        ),
        jsonb_build_object(
            'name', 'unknown_forms',
            'current_value', current_unknown_forms,
            'previous_value', previous_unknown_forms,
            'percent_change', case
                when previous_unknown_forms = 0 then
                    case when current_unknown_forms = 0 then 0.00 else 100 end
                else round(((current_unknown_forms - previous_unknown_forms)::numeric / previous_unknown_forms) * 100, 2)
            end
        )
    );

    return result;
end;
$$;
