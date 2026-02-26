CREATE OR REPLACE FUNCTION analytics.summary_form_progress(p_season_id int DEFAULT NULL)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
AS $$
DECLARE
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
    has_previous boolean := FALSE;
    result jsonb;
BEGIN
    -- Determine target season
    IF p_season_id IS NULL THEN
        SELECT * INTO curr
        FROM public.seasons
        ORDER BY start_date DESC
        LIMIT 1;
    ELSE
        SELECT * INTO curr
        FROM public.seasons
        WHERE id = p_season_id;
    END IF;

    IF NOT FOUND THEN
        RETURN jsonb_build_object();
    END IF;

    -- Get previous season (immediately before curr)
    SELECT * INTO prev
    FROM public.seasons
    WHERE start_date < curr.start_date
    ORDER BY start_date DESC
    LIMIT 1;

    has_previous := prev IS NOT NULL;

    -- Query counts
    IF has_previous THEN
        SELECT
            COALESCE(COUNT(*) FILTER (WHERE fa.season_id = curr.id), 0),
            COALESCE(COUNT(*) FILTER (WHERE fa.season_id = prev.id), 0),
            COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'approved' AND fa.season_id = curr.id), 0),
            COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'approved' AND fa.season_id = prev.id), 0),
            COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'pending' AND fa.season_id = curr.id), 0),
            COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'pending' AND fa.season_id = prev.id), 0),
            COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'rejected' AND fa.season_id = curr.id), 0),
            COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'rejected' AND fa.season_id = prev.id), 0)
        INTO
            current_total_forms,
            previous_total_forms,
            current_completed_forms,
            previous_completed_forms,
            current_pending_forms,
            previous_pending_forms,
            current_rejected_forms,
            previous_rejected_forms
        FROM public.field_activities fa
        WHERE fa.season_id IN (curr.id, prev.id);
    ELSE
        SELECT
            COALESCE(COUNT(*), 0),
            COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'approved'), 0),
            COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'pending'), 0),
            COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'rejected'), 0)
        INTO
            current_total_forms,
            current_completed_forms,
            current_pending_forms,
            current_rejected_forms
        FROM public.field_activities fa
        WHERE fa.season_id = curr.id;
    END IF;

    -- Build JSON result (including season IDs)
    result := jsonb_build_object(
        'seasons', jsonb_build_object(
            'current', jsonb_build_object(
                'id', curr.id,
                'start_date', curr.start_date,
                'end_date', curr.end_date,
                'semester', curr.semester,
                'season_year', curr.season_year
            ),
            'previous', CASE WHEN has_previous THEN
                jsonb_build_object(
                    'id', prev.id,
                    'start_date', prev.start_date,
                    'end_date', prev.end_date,
                    'semester', prev.semester,
                    'season_year', prev.season_year
                )
            ELSE NULL END
        ),
        'data', jsonb_build_array(
            jsonb_build_object(
                'name', 'total_forms',
                'current_value', current_total_forms,
                'previous_value', previous_total_forms,
                'percent_change', CASE
                    WHEN previous_total_forms = 0 THEN
                        CASE WHEN current_total_forms = 0 THEN 0.00 ELSE 100 END
                    ELSE ROUND(((current_total_forms - previous_total_forms)::numeric / previous_total_forms) * 100, 2)
                END
            ),
            jsonb_build_object(
                'name', 'completed_forms',
                'current_value', current_completed_forms,
                'previous_value', previous_completed_forms,
                'percent_change', CASE
                    WHEN previous_completed_forms = 0 THEN
                        CASE WHEN current_completed_forms = 0 THEN 0.00 ELSE 100 END
                    ELSE ROUND(((current_completed_forms - previous_completed_forms)::numeric / previous_completed_forms) * 100, 2)
                END
            ),
            jsonb_build_object(
                'name', 'pending_forms',
                'current_value', current_pending_forms,
                'previous_value', previous_pending_forms,
                'percent_change', CASE
                    WHEN previous_pending_forms = 0 THEN
                        CASE WHEN current_pending_forms = 0 THEN 0.00 ELSE 100 END
                    ELSE ROUND(((current_pending_forms - previous_pending_forms)::numeric / previous_pending_forms) * 100, 2)
                END
            ),
            jsonb_build_object(
                'name', 'rejected_forms',
                'current_value', current_rejected_forms,
                'previous_value', previous_rejected_forms,
                'percent_change', CASE
                    WHEN previous_rejected_forms = 0 THEN
                        CASE WHEN current_rejected_forms = 0 THEN 0.00 ELSE 100 END
                    ELSE ROUND(((current_rejected_forms - previous_rejected_forms)::numeric / previous_rejected_forms) * 100, 2)
                END
            )
        )
    );

    RETURN result;
END;
$$;
