CREATE OR REPLACE VIEW analytics.summary_form_count AS
with counts AS (
    SELECT COUNT(*) FILTER (WHERE activity_type = 'field-data') AS field_plannings_count,
        COUNT(*) FILTER (WHERE activity_type = 'cultural-management') AS crop_establishments_count,
        COUNT(*) FILTER (WHERE activity_type = 'nutrient-management') AS fertilization_records_count,
        COUNT(*) FILTER (WHERE activity_type = 'production') AS harvest_records_count,
        COUNT(*) FILTER (WHERE activity_type = 'damage-assessment') AS damage_assessments_count,
        COUNT(*) FILTER (WHERE activity_type = 'monitoring-visit') AS monitoring_visits_count
    FROM field_activity_details
)
SELECT COALESCE((
	SELECT JSON_BUILD_OBJECT('start_date', ls.start_date, 'end_date', ls.end_date, 'semester',
	    ls.semester, 'season_year', ls.season_year)
        FROM latest_season ls), JSON_BUILD_OBJECT()) AS season,
    JSON_BUILD_ARRAY(JSON_BUILD_OBJECT('form', 'field_plannings', 'count',
	COALESCE(c.field_plannings_count, 0)), JSON_BUILD_OBJECT('form', 'crop_establishments', 'count',
	COALESCE(c.crop_establishments_count, 0)), JSON_BUILD_OBJECT('form', 'fertilization_records', 'count',
	COALESCE(c.fertilization_records_count, 0)), JSON_BUILD_OBJECT('form', 'harvest_records',
	'count', COALESCE(c.harvest_records_count, 0)), JSON_BUILD_OBJECT('form', 'damage_assessments',
	'count', COALESCE(c.damage_assessments_count, 0)), JSON_BUILD_OBJECT('form', 'monitoring_visits',
	'count', COALESCE(c.monitoring_visits_count, 0))) AS data
FROM counts c;
