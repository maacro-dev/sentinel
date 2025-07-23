create schema if not exists analytics;

CREATE OR REPLACE FUNCTION analytics.dashboard_seasonal_stat_comparisons()
RETURNS JSONB
LANGUAGE plpgsql AS $$
DECLARE
    curr RECORD;
    prev RECORD;
    current_field_count NUMERIC := 0;
    previous_field_count NUMERIC := 0;
    current_forms_submitted NUMERIC := 0;
    previous_forms_submitted NUMERIC := 0;
    current_total_area NUMERIC := 0;
    previous_total_area NUMERIC := 0;
    current_total_yield NUMERIC := 0;
    previous_total_yield NUMERIC := 0;
    current_yield NUMERIC := 0;
    previous_yield NUMERIC := 0;
    current_not_sufficient NUMERIC := 0;
    previous_not_sufficient NUMERIC := 0;
    current_data_completeness NUMERIC := 0;
    previous_data_completeness NUMERIC := 0;
    current_damage_reports NUMERIC := 0;
    previous_damage_reports NUMERIC := 0;
    current_pest_reports NUMERIC := 0;
    previous_pest_reports NUMERIC := 0;
    result JSONB;
BEGIN
    SELECT * INTO curr FROM seasons ORDER BY start_date DESC LIMIT 1;
    IF NOT FOUND THEN
        RETURN jsonb_build_object();
    END IF;

    SELECT * INTO prev FROM seasons
    WHERE start_date < curr.start_date
    ORDER BY start_date DESC LIMIT 1;
    IF prev IS NULL THEN
        RETURN jsonb_build_object();
    END IF;

    SELECT
        COALESCE(COUNT(DISTINCT field_id) FILTER (WHERE season_id = curr.id), 0),
        COALESCE(COUNT(DISTINCT field_id) FILTER (WHERE season_id = prev.id), 0),
        COALESCE(COUNT(*) FILTER (WHERE season_id = curr.id), 0),
        COALESCE(COUNT(*) FILTER (WHERE season_id = prev.id), 0)
    INTO current_field_count, previous_field_count, current_forms_submitted, previous_forms_submitted
    FROM field_activities
    WHERE season_id IN (curr.id, prev.id);

    SELECT
        COALESCE(COUNT(*) FILTER (WHERE fa.season_id = curr.id), 0),
        COALESCE(COUNT(*) FILTER (WHERE fa.season_id = prev.id), 0),
        COALESCE(COUNT(*) FILTER (WHERE da.observed_pest IS NOT NULL AND fa.season_id = curr.id), 0),
        COALESCE(COUNT(*) FILTER (WHERE da.observed_pest IS NOT NULL AND fa.season_id = prev.id), 0)
    INTO current_damage_reports, previous_damage_reports, current_pest_reports, previous_pest_reports
    FROM field_activities fa
    JOIN damage_assessments da ON da.id = fa.id
    WHERE fa.season_id IN (curr.id, prev.id);

    SELECT
        COALESCE(SUM(hr.area_harvested) FILTER (WHERE fa.season_id = curr.id), 0),
        COALESCE(SUM(hr.area_harvested) FILTER (WHERE fa.season_id = prev.id), 0),
        COALESCE(SUM(hr.bags_harvested * hr.avg_bag_weight_kg) FILTER (WHERE fa.season_id = curr.id), 0),
        COALESCE(SUM(hr.bags_harvested * hr.avg_bag_weight_kg) FILTER (WHERE fa.season_id = prev.id), 0),
        COALESCE(COUNT(*) FILTER (WHERE hr.irrigation_supply IN ('Not Enough', 'Not Sufficient') AND fa.season_id = curr.id), 0),
        COALESCE(COUNT(*) FILTER (WHERE hr.irrigation_supply IN ('Not Enough', 'Not Sufficient') AND fa.season_id = prev.id), 0)
    INTO current_total_area, previous_total_area, current_total_yield, previous_total_yield, current_not_sufficient, previous_not_sufficient
    FROM field_activities fa
    JOIN harvest_records hr ON hr.id = fa.id
    WHERE fa.season_id IN (curr.id, prev.id);

    current_yield := CASE WHEN current_total_area > 0 THEN ROUND((current_total_yield / current_total_area) / 1000, 2) ELSE 0 END;
    previous_yield := CASE WHEN previous_total_area > 0 THEN ROUND((previous_total_yield / previous_total_area) / 1000, 2) ELSE 0 END;

    SELECT
        COALESCE(ROUND(
            (SUM(CASE WHEN fa.season_id = curr.id AND (
                (fa.activity_type = 'field_planning' AND fp.id IS NOT NULL) OR
                (fa.activity_type = 'crop_establishment' AND ce.id IS NOT NULL) OR
                (fa.activity_type = 'fertilization_record' AND fr.id IS NOT NULL) OR
                (fa.activity_type = 'harvest_record' AND hr.id IS NOT NULL)
            ) AND fa.verification_status = 'approved' THEN 1 ELSE 0 END) * 100.0) /
            NULLIF(COUNT(*) FILTER (WHERE fa.season_id = curr.id), 0), 2), 0),
        COALESCE(ROUND(
            (SUM(CASE WHEN fa.season_id = prev.id AND (
                (fa.activity_type = 'field_planning' AND fp.id IS NOT NULL) OR
                (fa.activity_type = 'crop_establishment' AND ce.id IS NOT NULL) OR
                (fa.activity_type = 'fertilization_record' AND fr.id IS NOT NULL) OR
                (fa.activity_type = 'harvest_record' AND hr.id IS NOT NULL)
            ) AND fa.verification_status = 'approved' THEN 1 ELSE 0 END) * 100.0) /
            NULLIF(COUNT(*) FILTER (WHERE fa.season_id = prev.id), 0), 2), 0)
    INTO current_data_completeness, previous_data_completeness
    FROM field_activities fa
    LEFT JOIN field_plannings fp ON fp.id = fa.id AND fa.activity_type = 'field_planning'
    LEFT JOIN crop_establishments ce ON ce.id = fa.id AND fa.activity_type = 'crop_establishment'
    LEFT JOIN fertilization_records fr ON fr.id = fa.id AND fa.activity_type = 'fertilization_record'
    LEFT JOIN harvest_records hr ON hr.id = fa.id AND fa.activity_type = 'harvest_record'
    WHERE fa.season_id IN (curr.id, prev.id);

    result := jsonb_build_object(
      'periods', jsonb_build_object(
        'current', jsonb_build_object(
          'start_date', curr.start_date,
          'end_date', curr.end_date,
          'semester', curr.semester,
          'season_year', curr.season_year
        ),
        'previous', jsonb_build_object(
          'start_date', prev.start_date,
          'end_date', prev.end_date,
          'semester', prev.semester,
          'season_year', prev.season_year
        )
      ),
      'stats', jsonb_build_array(
        jsonb_build_object(
          'name', 'field_count',
          'current_value', current_field_count,
          'previous_value', previous_field_count,
          'percent_change', CASE WHEN previous_field_count = 0 THEN CASE WHEN current_field_count = 0 THEN 0.00 ELSE NULL END ELSE ROUND(
            (
              (
                current_field_count - previous_field_count
              ):: NUMERIC / previous_field_count
            ) * 100,
            2
          ) END
        ),
        jsonb_build_object(
          'name', 'form_submission',
          'current_value', current_forms_submitted,
          'previous_value', previous_forms_submitted,
          'percent_change', CASE WHEN previous_forms_submitted = 0 THEN CASE WHEN current_forms_submitted = 0 THEN 0.00 ELSE NULL END ELSE ROUND(
            (
              (
                current_forms_submitted - previous_forms_submitted
              ):: NUMERIC / previous_forms_submitted
            ) * 100,
            2
          ) END
        ),
        jsonb_build_object(
          'name', 'yield',
          'current_value', current_yield,
          'previous_value', previous_yield,
          'percent_change', CASE WHEN previous_yield = 0 THEN CASE WHEN current_yield = 0 THEN 0.00 ELSE NULL END ELSE ROUND(
            (
              (current_yield - previous_yield) / previous_yield
            ) * 100,
            2
          ) END
        ),
        jsonb_build_object(
          'name', 'harvested_area',
          'current_value', ROUND(current_total_area, 2),
          'previous_value', ROUND(previous_total_area, 2),
          'percent_change', CASE WHEN previous_total_area = 0 THEN CASE WHEN current_total_area = 0 THEN 0.00 ELSE NULL END ELSE ROUND(
            (
              (
                current_total_area - previous_total_area
              ) / previous_total_area
            ) * 100,
            2
          ) END
        ),
        jsonb_build_object(
          'name', 'irrigation',
          'current_value', current_not_sufficient,
          'previous_value', previous_not_sufficient,
          'percent_change', CASE WHEN previous_not_sufficient = 0 THEN CASE WHEN current_not_sufficient = 0 THEN 0.00 ELSE NULL END ELSE ROUND(
            (
              (
                current_not_sufficient - previous_not_sufficient
              ):: NUMERIC / previous_not_sufficient
            ) * 100,
            2
          ) END
        ),
        jsonb_build_object(
          'name', 'data_completeness',
          'current_value', current_data_completeness,
          'previous_value', previous_data_completeness,
          'percent_change', CASE WHEN previous_data_completeness = 0 THEN CASE WHEN current_data_completeness = 0 THEN 0.00 ELSE NULL END ELSE ROUND(
            (
              (
                current_data_completeness - previous_data_completeness
              ) / previous_data_completeness
            ) * 100,
            2
          ) END
        ),
        jsonb_build_object(
          'name', 'damage_report',
          'current_value', current_damage_reports,
          'previous_value', previous_damage_reports,
          'percent_change', CASE WHEN previous_damage_reports = 0 THEN CASE WHEN current_damage_reports = 0 THEN 0.00 ELSE NULL END ELSE ROUND(
            (
              (
                current_damage_reports - previous_damage_reports
              ):: NUMERIC / previous_damage_reports
            ) * 100,
            2
          ) END
        ),
        jsonb_build_object(
          'name', 'pest_report',
          'current_value', current_pest_reports,
          'previous_value', previous_pest_reports,
          'percent_change',
            CASE WHEN previous_pest_reports = 0 THEN CASE WHEN current_pest_reports = 0 THEN 0.00 ELSE NULL END ELSE ROUND(
            (
              (
                current_pest_reports - previous_pest_reports
              ):: NUMERIC / previous_pest_reports
            ) * 100,
            2
          ) END
        )
      )
    );

    RETURN result;
END;
$$;

CREATE OR REPLACE VIEW analytics.dashboard_yield_timeseries AS
WITH monthly_yields AS (
  SELECT
    date_trunc('month', hr.harvest_date) AS month_start,
    (hr.bags_harvested * hr.avg_bag_weight_kg) / nullif(hr.area_harvested, 0) / 1000.0 AS yield_t_ha
  FROM harvest_records hr
  JOIN field_activities fa ON hr.id = fa.id
)
SELECT
  to_char(month_start, 'mon yyyy') AS month_year,
  round(avg(yield_t_ha)::numeric, 2) AS avg_yield_t_ha
FROM monthly_yields
GROUP BY month_start
ORDER BY month_start;

CREATE OR REPLACE VIEW analytics.dashboard_barangay_yield_rankings AS
WITH season_data AS (
    SELECT
        s.id AS season_id,
        s.start_date,
        s.season_year
    FROM seasons s
    ORDER BY s.start_date DESC
    LIMIT 1
),
harvest_agg AS (
    SELECT
        f.barangay_id,
        SUM(hr.bags_harvested * hr.avg_bag_weight_kg) AS total_kg,
        SUM(hr.area_harvested) AS total_area
    FROM season_data sd
    JOIN field_activities fa ON fa.season_id = sd.season_id
    JOIN harvest_records hr ON hr.id = fa.id
    JOIN fields f ON fa.field_id = f.id
    GROUP BY f.barangay_id
    HAVING SUM(hr.area_harvested) > 0
),
barangay_ranking AS (
    SELECT
        b.name AS barangay,
        cm.name AS municipality,
        p.name AS province,
        (ha.total_kg / ha.total_area / 1000)::numeric(10,2) AS avg_yield_t_per_ha,
        RANK() OVER (ORDER BY (ha.total_kg / ha.total_area) DESC) AS yield_rank
    FROM harvest_agg ha
    JOIN barangays b ON b.id = ha.barangay_id
    JOIN cities_municipalities cm ON cm.id = b.city_municipality_id
    JOIN provinces p ON p.id = cm.province_id
)
SELECT
  (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'barangay',       barangay,
      'province',       province,
      'municipality',   municipality,
      'avg_yield_t_per_ha', avg_yield_t_per_ha,
      'rank',           yield_rank
    )), '[]'::jsonb)
    FROM barangay_ranking
    WHERE yield_rank <= 3
  ) AS top,
  (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'barangay',       barangay,
      'province',       province,
      'municipality',   municipality,
      'avg_yield_t_per_ha', avg_yield_t_per_ha,
      'rank',           yield_rank
    )), '[]'::jsonb)
    FROM (
      SELECT *,
             RANK() OVER (ORDER BY avg_yield_t_per_ha ASC) AS reverse_rank
      FROM barangay_ranking
    ) r
    WHERE reverse_rank <= 3
  ) AS bottom;
