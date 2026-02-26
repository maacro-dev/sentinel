
-- todo to clean

create or replace function analytics.dashboard_summary()
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
    as $$
declare
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
