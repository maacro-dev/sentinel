
-- todo to clean

CREATE OR REPLACE FUNCTION analytics.dashboard_summary()
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
    AS $$
DECLARE
    curr record;
    prev record;
    current_field_count numeric := 0;
    previous_field_count numeric := 0;
    current_forms_submitted numeric := 0;
    previous_forms_submitted numeric := 0;
    current_total_area numeric := 0;
    previous_total_area numeric := 0;
    current_total_yield numeric := 0;
    previous_total_yield numeric := 0;
    current_yield numeric := 0;
    previous_yield numeric := 0;
    current_not_sufficient numeric := 0;
    previous_not_sufficient numeric := 0;
    current_data_completeness numeric := 0;
    previous_data_completeness numeric := 0;
    current_damage_reports numeric := 0;
    previous_damage_reports numeric := 0;
    current_pest_reports numeric := 0;
    previous_pest_reports numeric := 0;
    has_previous boolean := FALSE;
    result jsonb;
BEGIN
    SELECT * INTO curr
    FROM public.seasons
    ORDER BY start_date DESC
    LIMIT 1;
    IF NOT found THEN
        RETURN JSON_BUILD_OBJECT();
    END IF;
    SELECT * INTO prev
    FROM public.seasons
    WHERE start_date < curr.start_date
    ORDER BY start_date DESC
    LIMIT 1;
    has_previous := prev IS NOT NULL;
    -- Only query data for seasons that exist
    IF has_previous THEN
        SELECT COALESCE(COUNT(DISTINCT field_id) FILTER (WHERE season_id = curr.id), 0),
            COALESCE(COUNT(DISTINCT field_id) FILTER (WHERE season_id = prev.id), 0),
            COALESCE(COUNT(*) FILTER (WHERE season_id = curr.id), 0),
            COALESCE(COUNT(*) FILTER (WHERE season_id = prev.id), 0) INTO current_field_count,
            previous_field_count,
            current_forms_submitted,
            previous_forms_submitted
        FROM public.field_activities
        WHERE season_id IN (curr.id, prev.id);
    ELSE
        SELECT COALESCE(COUNT(DISTINCT field_id), 0),
            COALESCE(COUNT(*), 0) INTO current_field_count,
            current_forms_submitted
        FROM public.field_activities
        WHERE season_id = curr.id;
    END IF;
    IF has_previous THEN
        SELECT COALESCE(COUNT(*) FILTER (WHERE fa.season_id = curr.id), 0),
            COALESCE(COUNT(*) FILTER (WHERE fa.season_id = prev.id), 0),
            COALESCE(COUNT(*) FILTER (WHERE da.observed_pest IS NOT NULL
                    AND fa.season_id = curr.id), 0),
            COALESCE(COUNT(*) FILTER (WHERE da.observed_pest IS NOT NULL
                    AND fa.season_id = prev.id), 0) INTO current_damage_reports,
            previous_damage_reports,
            current_pest_reports,
            previous_pest_reports
        FROM public.field_activities fa
            JOIN public.damage_assessments da ON da.id = fa.id
        WHERE fa.season_id IN (curr.id, prev.id);
    ELSE
        SELECT COALESCE(COUNT(*), 0),
            COALESCE(COUNT(*) FILTER (WHERE da.observed_pest IS NOT NULL), 0) INTO current_damage_reports,
            current_pest_reports
        FROM public.field_activities fa
            JOIN public.damage_assessments da ON da.id = fa.id
        WHERE fa.season_id = curr.id;
    END IF;
    IF has_previous THEN
        SELECT COALESCE(SUM(hr.area_harvested_ha) FILTER (WHERE fa.season_id = curr.id), 0),
            COALESCE(SUM(hr.area_harvested_ha) FILTER (WHERE fa.season_id = prev.id), 0),
            COALESCE(SUM(hr.bags_harvested * hr.avg_bag_weight_kg) FILTER (WHERE fa.season_id = curr.id), 0),
            COALESCE(SUM(hr.bags_harvested * hr.avg_bag_weight_kg) FILTER (WHERE fa.season_id = prev.id), 0),
            COALESCE(COUNT(*) FILTER (WHERE hr.irrigation_supply IN ('Not Enough', 'Not Sufficient')
                AND fa.season_id = curr.id), 0),
            COALESCE(COUNT(*) FILTER (WHERE hr.irrigation_supply IN ('Not Enough', 'Not Sufficient')
                AND fa.season_id = prev.id), 0) INTO current_total_area,
            previous_total_area,
            current_total_yield,
            previous_total_yield,
            current_not_sufficient,
            previous_not_sufficient
        FROM public.field_activities fa
            JOIN public.harvest_records hr ON hr.id = fa.id
        WHERE fa.season_id IN (curr.id, prev.id);
    ELSE
        SELECT COALESCE(SUM(hr.area_harvested_ha), 0),
            COALESCE(SUM(hr.bags_harvested * hr.avg_bag_weight_kg), 0),
            COALESCE(COUNT(*) FILTER (WHERE hr.irrigation_supply IN ('Not Enough', 'Not Sufficient')), 0) INTO current_total_area,
            current_total_yield,
            current_not_sufficient
        FROM public.field_activities fa
            JOIN public.harvest_records hr ON hr.id = fa.id
        WHERE fa.season_id = curr.id;
    END IF;
    current_yield := CASE WHEN current_total_area > 0 THEN
        ROUND((current_total_yield / current_total_area) / 1000, 2)
    ELSE
        0
    END;
    previous_yield := CASE WHEN previous_total_area > 0 THEN
        ROUND((previous_total_yield / previous_total_area) / 1000, 2)
    ELSE
        0
    END;
    IF has_previous THEN
        SELECT COALESCE(ROUND((SUM(
                        CASE WHEN fa.season_id = curr.id
                            AND ((fa.activity_type = 'field-data'
                                AND fp.id IS NOT NULL)
                            OR (fa.activity_type = 'cultural-management'
                                AND ce.id IS NOT NULL)
                            OR (fa.activity_type = 'nutrient-management'
                                AND fr.id IS NOT NULL)
                            OR (fa.activity_type = 'production'
                                AND hr.id IS NOT NULL))
                            AND fa.verification_status = 'approved' THEN
                            1
                        ELSE
                            0
                        END) * 100.0) / nullif(COUNT(*) FILTER (WHERE fa.season_id = curr.id), 0), 2), 0),
            COALESCE(ROUND((SUM(
                        CASE WHEN fa.season_id = prev.id
                            AND ((fa.activity_type = 'field-data'
                                AND fp.id IS NOT NULL)
                            OR (fa.activity_type = 'cultural-management'
                                AND ce.id IS NOT NULL)
                            OR (fa.activity_type = 'nutrient-management'
                                AND fr.id IS NOT NULL)
                            OR (fa.activity_type = 'production'
                                AND hr.id IS NOT NULL))
                            AND fa.verification_status = 'approved' THEN
                            1
                        ELSE
                            0
                        END) * 100.0) / nullif(COUNT(*) FILTER (WHERE fa.season_id = prev.id), 0), 2), 0) INTO current_data_completeness,
            previous_data_completeness
        FROM public.field_activities fa
            LEFT JOIN public.field_plannings fp ON fp.id = fa.id
                AND fa.activity_type = 'field-data'
        LEFT JOIN public.crop_establishments ce ON ce.id = fa.id
            AND fa.activity_type = 'cultural-management'
        LEFT JOIN public.fertilization_records fr ON fr.id = fa.id
            AND fa.activity_type = 'nutrient-management'
        LEFT JOIN public.harvest_records hr ON hr.id = fa.id
            AND fa.activity_type = 'production'
    WHERE fa.season_id IN (curr.id, prev.id);
    ELSE
        SELECT COALESCE(ROUND((SUM(
                        CASE WHEN ((fa.activity_type = 'field-data'
                            AND fp.id IS NOT NULL)
                            OR (fa.activity_type = 'cultural-management'
                                AND ce.id IS NOT NULL)
                            OR (fa.activity_type = 'nutrient-management'
                                AND fr.id IS NOT NULL)
                            OR (fa.activity_type = 'production'
                                AND hr.id IS NOT NULL))
                            AND fa.verification_status = 'approved' THEN
                            1
                        ELSE
                            0
                        END) * 100.0) / nullif(COUNT(*), 0), 2), 0) INTO current_data_completeness
        FROM public.field_activities fa
            LEFT JOIN public.field_plannings fp ON fp.id = fa.id
                AND fa.activity_type = 'field-data'
        LEFT JOIN public.crop_establishments ce ON ce.id = fa.id
            AND fa.activity_type = 'cultural-management'
        LEFT JOIN public.fertilization_records fr ON fr.id = fa.id
            AND fa.activity_type = 'nutrient-management'
        LEFT JOIN public.harvest_records hr ON hr.id = fa.id
            AND fa.activity_type = 'production'
    WHERE fa.season_id = curr.id;
    END IF;
    result := JSON_BUILD_OBJECT('seasons', JSON_BUILD_OBJECT('current', JSON_BUILD_OBJECT('start_date',
	curr.start_date, 'end_date', curr.end_date, 'semester', curr.semester, 'season_year',
	curr.season_year), 'previous', CASE WHEN has_previous THEN
		JSON_BUILD_OBJECT('start_date', prev.start_date, 'end_date', prev.end_date, 'semester',
		    prev.semester, 'season_year', prev.season_year)
            ELSE
                NULL
	    END), 'data', JSON_BUILD_ARRAY(JSON_BUILD_OBJECT('name', 'field_count',
		'current_value', current_field_count, 'previous_value', previous_field_count, 'percent_change', CASE WHEN
		previous_field_count = 0 THEN
                    CASE WHEN current_field_count = 0 THEN
                        0.00
                    ELSE
                        100
                    END
                ELSE
                    ROUND(((current_field_count - previous_field_count)::numeric / previous_field_count) * 100, 2)
		END), JSON_BUILD_OBJECT('name', 'form_submission', 'current_value', current_forms_submitted,
		    'previous_value', previous_forms_submitted, 'percent_change', CASE WHEN previous_forms_submitted = 0
		    THEN
                    CASE WHEN current_forms_submitted = 0 THEN
                        0.00
                    ELSE
                        100
                    END
                ELSE
                    ROUND(((current_forms_submitted - previous_forms_submitted)::numeric / previous_forms_submitted) * 100, 2)
		END), JSON_BUILD_OBJECT('name', 'yield', 'current_value', current_yield,
		    'previous_value', previous_yield, 'percent_change', CASE WHEN previous_yield = 0 THEN
                    CASE WHEN current_yield = 0 THEN
                        0.00
                    ELSE
                        100
                    END
                ELSE
                    ROUND(((current_yield - previous_yield) / previous_yield) * 100, 2)
		END), JSON_BUILD_OBJECT('name', 'harvested_area', 'current_value', ROUND(current_total_area,
		    2), 'previous_value', ROUND(previous_total_area, 2), 'percent_change', CASE WHEN previous_total_area
		    = 0 THEN
                    CASE WHEN current_total_area = 0 THEN
                        0.00
                    ELSE
                        100
                    END
                ELSE
                    ROUND(((current_total_area - previous_total_area) / previous_total_area) * 100, 2)
		END), JSON_BUILD_OBJECT('name', 'irrigation', 'current_value', current_not_sufficient,
		    'previous_value', previous_not_sufficient, 'percent_change', CASE WHEN previous_not_sufficient = 0
		    THEN
                    CASE WHEN current_not_sufficient = 0 THEN
                        0.00
                    ELSE
                        100
                    END
                ELSE
                    ROUND(((current_not_sufficient - previous_not_sufficient)::numeric / previous_not_sufficient) * 100, 2)
		END), JSON_BUILD_OBJECT('name', 'data_completeness', 'current_value', current_data_completeness,
		    'previous_value', previous_data_completeness, 'percent_change', CASE WHEN previous_data_completeness
		    = 0 THEN
                    CASE WHEN current_data_completeness = 0 THEN
                        0.00
                    ELSE
                        100
                    END
                ELSE
                    ROUND(((current_data_completeness - previous_data_completeness) / previous_data_completeness) * 100, 2)
		END), JSON_BUILD_OBJECT('name', 'damage_report', 'current_value', current_damage_reports,
		    'previous_value', previous_damage_reports, 'percent_change', CASE WHEN previous_damage_reports = 0
		    THEN
                    CASE WHEN current_damage_reports = 0 THEN
                        0.00
                    ELSE
                        100
                    END
                ELSE
                    ROUND(((current_damage_reports - previous_damage_reports)::numeric / previous_damage_reports) * 100, 2)
		END), JSON_BUILD_OBJECT('name', 'pest_report', 'current_value', current_pest_reports,
		    'previous_value', previous_pest_reports, 'percent_change', CASE WHEN previous_pest_reports = 0 THEN
                    CASE WHEN current_pest_reports = 0 THEN
                        0.00
                    ELSE
                        100
                    END
                ELSE
                    ROUND(((current_pest_reports - previous_pest_reports)::numeric / previous_pest_reports) * 100, 2)
                END)));
    RETURN result;
END;
$$;

CREATE OR REPLACE VIEW analytics.dashboard_barangay_yield_rankings AS
WITH season_data AS (
    SELECT s.id AS season_id,
        s.start_date,
        s.season_year
    FROM seasons s
    ORDER BY s.start_date DESC
    LIMIT 1
),
harvest_agg AS (
    SELECT f.barangay_id,
        SUM(hr.bags_harvested * hr.avg_bag_weight_kg) AS total_kg,
        SUM(hr.area_harvested_ha) AS total_area
    FROM season_data sd
        JOIN field_activities fa ON fa.season_id = sd.season_id
        JOIN harvest_records hr ON hr.id = fa.id
        JOIN fields f ON fa.field_id = f.id
    GROUP BY f.barangay_id
    HAVING SUM(hr.area_harvested_ha) > 0
),
barangay_ranking AS (
    SELECT b.name AS barangay,
        cm.name AS municipality,
        p.name AS province,
(ha.total_kg / ha.total_area / 1000)::numeric(10, 2) AS avg_yield_t_per_ha,
        RANK() OVER (ORDER BY (ha.total_kg / ha.total_area) DESC) AS yield_rank
FROM harvest_agg ha
    JOIN barangays b ON b.id = ha.barangay_id
    JOIN cities_municipalities cm ON cm.id = b.city_municipality_id
    JOIN provinces p ON p.id = cm.province_id
)
SELECT (
	SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('barangay', barangay, 'province', province,
	    'municipality', municipality, 'avg_yield_t_per_ha', avg_yield_t_per_ha, 'rank', yield_rank)),
	    '[]'::json)
        FROM barangay_ranking
        WHERE yield_rank <= 3) AS top,
(
	SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('barangay', barangay, 'province', province,
	    'municipality', municipality, 'avg_yield_t_per_ha', avg_yield_t_per_ha, 'rank', yield_rank)),
	    '[]'::json)
        FROM (
            SELECT *,
                RANK() OVER (ORDER BY avg_yield_t_per_ha ASC) AS reverse_rank
            FROM barangay_ranking) r
        WHERE reverse_rank <= 3) AS bottom;

CREATE OR REPLACE VIEW analytics.trend_overall_yield AS
WITH latest_season AS (
    SELECT id,
        start_date,
        end_date,
        semester,
        season_year
    FROM seasons
    ORDER BY start_date DESC
    LIMIT 1
),
yield_by_month AS (
    SELECT DATE_TRUNC('month', hr.harvest_date)::date AS date,
        ROUND(AVG((hr.bags_harvested * hr.avg_bag_weight_kg) / nullif(hr.area_harvested_ha, 0) / 1000.0)::numeric, 2) AS avg_yield_t_ha
    FROM harvest_records hr
        JOIN field_activities fa ON hr.id = fa.id
        JOIN latest_season ls ON fa.season_id = ls.id
    GROUP BY 1
    ORDER BY 1
)
    SELECT COALESCE((
	    SELECT JSON_BUILD_OBJECT('start_date', ls.start_date, 'end_date', ls.end_date, 'semester',
		ls.semester, 'season_year', ls.season_year)
            FROM latest_season ls), '{}'::json) AS season,
        COALESCE((
            SELECT JSON_AGG(JSON_BUILD_OBJECT('date', ym.date, 'avg_yield_t_ha', ym.avg_yield_t_ha)
                ORDER BY ym.date)
            FROM yield_by_month ym), '[]'::json) AS data;

CREATE OR REPLACE VIEW analytics.trend_data_collection AS
WITH latest_season AS (
    SELECT id,
        start_date,
        end_date,
        semester,
        season_year
    FROM seasons
    ORDER BY start_date DESC
    LIMIT 1
),
collection_rate AS (
    SELECT DATE(fa.collected_at) AS date,
        COUNT(*) AS data_collected
    FROM field_activities fa
        JOIN latest_season ls ON fa.season_id = ls.id
    GROUP BY DATE(fa.collected_at))
        SELECT (
		SELECT JSON_BUILD_OBJECT('start_date', ls.start_date, 'end_date', ls.end_date,
		    'semester', ls.semester, 'season_year', ls.season_year)
                FROM latest_season ls) AS season,
    COALESCE((
        SELECT JSON_AGG(JSON_BUILD_OBJECT('date', cr.date, 'data_collected', cr.data_collected))
        FROM collection_rate cr), '[]'::json) AS data;

CREATE OR REPLACE FUNCTION analytics.summary_form_progress()
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
    AS $$
DECLARE
    curr RECORD;
    prev RECORD;
    previous_total_forms numeric := 0;
    current_total_forms numeric := 0;
    previous_completed_forms numeric := 0;
    current_completed_forms numeric := 0;
    previous_pending_forms numeric := 0;
    current_pending_forms numeric := 0;
    previous_rejected_forms numeric := 0;
    current_rejected_forms numeric := 0;
    result jsonb;
BEGIN
    SELECT * INTO curr
    FROM public.seasons
    ORDER BY start_date DESC
    LIMIT 1;
    IF NOT FOUND THEN
        RETURN JSON_BUILD_OBJECT();
    END IF;
    SELECT * INTO prev
    FROM public.seasons
    WHERE start_date < curr.start_date
    ORDER BY start_date DESC
    LIMIT 1;
    IF prev IS NULL THEN
        RETURN JSON_BUILD_OBJECT();
    END IF;
    SELECT COALESCE(COUNT(*) FILTER (WHERE fa.season_id = curr.id), 0),
        COALESCE(COUNT(*) FILTER (WHERE fa.season_id = prev.id), 0),
        COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'approved'
                AND fa.season_id = curr.id), 0),
        COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'approved'
                AND fa.season_id = prev.id), 0),
        COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'pending'
                AND fa.season_id = curr.id), 0),
        COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'pending'
                AND fa.season_id = prev.id), 0),
        COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'rejected'
                AND fa.season_id = curr.id), 0),
        COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'rejected'
                AND fa.season_id = prev.id), 0) INTO current_total_forms,
        previous_total_forms,
        current_completed_forms,
        previous_completed_forms,
        current_pending_forms,
        previous_pending_forms,
        current_rejected_forms,
        previous_rejected_forms
    FROM public.field_activities fa
    WHERE fa.season_id IN (curr.id, prev.id);
    result := JSON_BUILD_OBJECT('seasons', JSON_BUILD_OBJECT('current',
	JSON_BUILD_OBJECT('start_date', curr.start_date, 'end_date', curr.end_date, 'semester',
	curr.semester, 'season_year', curr.season_year), 'previous', JSON_BUILD_OBJECT('start_date',
	prev.start_date, 'end_date', prev.end_date, 'semester', prev.semester, 'season_year',
	prev.season_year)), 'data', JSON_BUILD_ARRAY(JSON_BUILD_OBJECT('name', 'total_forms',
	'current_value', current_total_forms, 'previous_value', previous_total_forms, 'percent_change', CASE WHEN
	previous_total_forms = 0 THEN
                    CASE WHEN current_total_forms = 0 THEN
                        0.00
                    ELSE
                        100
                    END
                ELSE
                    ROUND(((current_total_forms - previous_total_forms)::numeric / previous_total_forms) * 100, 2)
		END), JSON_BUILD_OBJECT('name', 'completed_forms', 'current_value', current_completed_forms,
		    'previous_value', previous_completed_forms, 'percent_change', CASE WHEN previous_completed_forms =
		    0 THEN
                    CASE WHEN current_completed_forms = 0 THEN
                        0.00
                    ELSE
                        100
                    END
                ELSE
                    ROUND(((current_completed_forms - previous_completed_forms)::numeric / previous_completed_forms) * 100, 2)
		END), JSON_BUILD_OBJECT('name', 'pending_forms', 'current_value', current_pending_forms,
		    'previous_value', previous_pending_forms, 'percent_change', CASE WHEN previous_pending_forms = 0
		    THEN
                    CASE WHEN current_pending_forms = 0 THEN
                        0.00
                    ELSE
                        100
                    END
                ELSE
                    ROUND(((current_pending_forms - previous_pending_forms)::numeric / previous_pending_forms) * 100, 2)
		END), JSON_BUILD_OBJECT('name', 'rejected_forms', 'current_value', current_rejected_forms,
		    'previous_value', previous_rejected_forms, 'percent_change', CASE WHEN previous_rejected_forms = 0
		    THEN
                    CASE WHEN current_rejected_forms = 0 THEN
                        0.00
                    ELSE
                        100
                    END
                ELSE
                    ROUND(((current_rejected_forms - previous_rejected_forms)::numeric / previous_rejected_forms) * 100, 2)
                END)));
    RETURN result;
END
$$;

-- TODO: add comparisons when data is available
CREATE OR REPLACE VIEW analytics.summary_form_count AS
WITH counts AS (
    SELECT COUNT(*) FILTER (WHERE activity_type = 'field-data') AS field_plannings_count,
        COUNT(*) FILTER (WHERE activity_type = 'cultural-management') AS crop_establishments_count,
        COUNT(*) FILTER (WHERE activity_type = 'nutrient-management') AS fertilization_records_count,
        COUNT(*) FILTER (WHERE activity_type = 'production') AS harvest_records_count,
        COUNT(*) FILTER (WHERE activity_type = 'damage-assessment') AS damage_assessments_count,
        COUNT(*) FILTER (WHERE activity_type = 'monitoring-visit') AS monitoring_visits_count
    FROM field_activity_details
)
SELECT JSON_BUILD_OBJECT('start_date', ls.start_date, 'end_date', ls.end_date, 'semester', ls.semester,
    'season_year', ls.season_year) AS season,
    JSON_BUILD_ARRAY(JSON_BUILD_OBJECT('form', 'field_plannings', 'count', c.field_plannings_count),
	JSON_BUILD_OBJECT('form', 'crop_establishments', 'count', c.crop_establishments_count),
	JSON_BUILD_OBJECT('form', 'fertilization_records', 'count', c.fertilization_records_count),
	JSON_BUILD_OBJECT('form', 'harvest_records', 'count', c.harvest_records_count),
	JSON_BUILD_OBJECT('form', 'damage_assessments', 'count', c.damage_assessments_count),
	JSON_BUILD_OBJECT('form', 'monitoring_visits', 'count', c.monitoring_visits_count)) AS data
FROM latest_season ls
    CROSS JOIN counts c;
