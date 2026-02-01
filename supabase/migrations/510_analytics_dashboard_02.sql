
create or replace view analytics.dashboard_barangay_yield_rankings as
with season_data as (
    select
        s.id as season_id,
        s.start_date,
        s.season_year
    from seasons s
    order by s.start_date desc
    limit 1
),
harvest_agg as (
    select
        f.barangay_id,
        sum(hr.bags_harvested * hr.avg_bag_weight_kg) as total_kg,
        sum(hr.area_harvested_ha) as total_area
    from season_data sd
    join field_activities fa on fa.season_id = sd.season_id
    join harvest_records hr on hr.id = fa.id
    join fields f on fa.field_id = f.id
    group by f.barangay_id
    having sum(hr.area_harvested_ha) > 0
),
barangay_ranking as (
    select
        b.name as barangay,
        cm.name as municipality,
        p.name as province,
        (ha.total_kg / ha.total_area / 1000)::numeric(10,2) as avg_yield_t_per_ha,
        rank() over (order by (ha.total_kg / ha.total_area) desc) as yield_rank
    from harvest_agg ha
    join barangays b on b.id = ha.barangay_id
    join cities_municipalities cm on cm.id = b.city_municipality_id
    join provinces p on p.id = cm.province_id
)
select
  (
    select coalesce(json_agg(json_build_object(
      'barangay',       barangay,
      'province',       province,
      'municipality',   municipality,
      'avg_yield_t_per_ha', avg_yield_t_per_ha,
      'rank',           yield_rank
    )), '[]'::json)
    from barangay_ranking
    where yield_rank <= 3
  ) as top,
  (
    select coalesce(json_agg(json_build_object(
      'barangay',       barangay,
      'province',       province,
      'municipality',   municipality,
      'avg_yield_t_per_ha', avg_yield_t_per_ha,
      'rank',           yield_rank
    )), '[]'::json)
    from (
      select *,
             rank() over (order by avg_yield_t_per_ha asc) as reverse_rank
      from barangay_ranking
    ) r
    where reverse_rank <= 3
  ) as bottom;



-- CREATE OR REPLACE VIEW analytics.trend_overall_yield AS
-- WITH latest_season AS (
--   SELECT
--     id,
--     start_date,
--     end_date,
--     semester,
--     season_year
--   FROM seasons
--   ORDER BY start_date DESC
--   LIMIT 1
-- ),
-- yield_by_month AS (
--   SELECT
--     date_trunc('month', hr.harvest_date)::date AS date,
--     round(avg((hr.bags_harvested * hr.avg_bag_weight_kg) / nullif(hr.area_harvested_ha, 0) / 1000.0)::numeric ,2) AS avg_yield_t_ha
--   FROM harvest_records hr
--   JOIN field_activities fa
--     ON hr.id = fa.id
--   JOIN latest_season ls
--     ON fa.season_id = ls.id
--   GROUP BY 1
--   ORDER BY 1
-- )
-- SELECT
--   coalesce(
--     (SELECT json_build_object(
--         'start_date',  ls.start_date,
--         'end_date',    ls.end_date,
--         'semester',    ls.semester,
--         'season_year', ls.season_year
--      )
--      FROM latest_season ls),
--     '{}'::json
--   ) AS season,
--   coalesce(
--     (SELECT json_agg(
--         json_build_object(
--           'date',           ym.date,
--           'avg_yield_t_ha', ym.avg_yield_t_ha
--         )
--         ORDER BY ym.date
--       )
--      FROM yield_by_month ym),
--     '[]'::json
--   ) AS data;



-- CREATE OR REPLACE VIEW analytics.trend_data_collection AS
-- WITH latest_season AS (
--   SELECT id, start_date, end_date, semester, season_year
--   FROM seasons
--   ORDER BY start_date DESC
--   LIMIT 1
-- ),
-- collection_rate AS (
--   SELECT
--     DATE(fa.collected_at) AS date,
--     COUNT(*) AS data_collected
--   FROM field_activities fa
--   JOIN latest_season ls ON fa.season_id = ls.id
--   GROUP BY DATE(fa.collected_at)
-- )
-- SELECT
--   ( SELECT
--       json_build_object(
--         'start_date',    ls.start_date,
--         'end_date',      ls.end_date,
--         'semester',      ls.semester,
--         'season_year',   ls.season_year
--       )
--     FROM latest_season ls
--   ) AS season,
--   COALESCE(
--     ( SELECT
--         json_agg(
--           json_build_object(
--             'date', cr.date,
--             'data_collected', cr.data_collected
--           )
--         )
--       FROM collection_rate cr
--     ),
--     '[]'::json
--   ) AS data;



-- CREATE OR REPLACE FUNCTION analytics.summary_form_progress()
--   RETURNS JSON
--   LANGUAGE plpgsql
--   SECURITY DEFINER
--   SET search_path = ''
-- AS $$
-- DECLARE
--   curr RECORD;
--   prev RECORD;
--   previous_total_forms NUMERIC := 0;
--   current_total_forms NUMERIC := 0;
--   previous_completed_forms NUMERIC := 0;
--   current_completed_forms NUMERIC := 0;
--   previous_pending_forms NUMERIC := 0;
--   current_pending_forms NUMERIC := 0;
--   previous_rejected_forms NUMERIC := 0;
--   current_rejected_forms NUMERIC := 0;
--   result JSONB;
-- BEGIN
--   SELECT * INTO curr FROM public.seasons ORDER BY start_date DESC LIMIT 1;
--   IF NOT FOUND THEN
--     RETURN json_build_object();
--   END IF;

--   SELECT * INTO prev FROM public.seasons
--   WHERE start_date < curr.start_date
--   ORDER BY start_date DESC LIMIT 1;
--   IF prev IS NULL THEN
--     RETURN json_build_object();
--   END IF;

--   SELECT
--     COALESCE(COUNT(*) FILTER (WHERE fa.season_id = curr.id), 0),
--     COALESCE(COUNT(*) FILTER (WHERE fa.season_id = prev.id), 0),
--     COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'approved' AND fa.season_id = curr.id), 0),
--     COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'approved' AND fa.season_id = prev.id), 0),
--     COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'pending' AND fa.season_id = curr.id), 0),
--     COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'pending' AND fa.season_id = prev.id), 0),
--     COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'rejected' AND fa.season_id = curr.id), 0),
--     COALESCE(COUNT(*) FILTER (WHERE fa.verification_status = 'rejected' AND fa.season_id = prev.id), 0)
--   INTO
--     current_total_forms,
--     previous_total_forms,
--     current_completed_forms,
--     previous_completed_forms,
--     current_pending_forms,
--     previous_pending_forms,
--     current_rejected_forms,
--     previous_rejected_forms
--   FROM public.field_activities fa
--   WHERE fa.season_id IN (curr.id, prev.id);

--   result := json_build_object(
--     'seasons', json_build_object(
--       'current', json_build_object(
--         'start_date', curr.start_date,
--         'end_date', curr.end_date,
--         'semester', curr.semester,
--         'season_year', curr.season_year
--       ),
--       'previous', json_build_object(
--         'start_date', prev.start_date,
--         'end_date', prev.end_date,
--         'semester', prev.semester,
--         'season_year', prev.season_year
--       )
--     ),
--     'data', json_build_array(
--       json_build_object(
--         'name', 'total_forms',
--         'current_value', current_total_forms,
--         'previous_value', previous_total_forms,
--         'percent_change', CASE
--           WHEN previous_total_forms = 0 THEN
--             CASE WHEN current_total_forms = 0 THEN 0.00 ELSE 100 END
--           ELSE ROUND(((current_total_forms - previous_total_forms)::NUMERIC / previous_total_forms) * 100, 2)
--         END
--       ),
--       json_build_object(
--         'name', 'completed_forms',
--         'current_value', current_completed_forms,
--         'previous_value', previous_completed_forms,
--         'percent_change', CASE
--           WHEN previous_completed_forms = 0 THEN
--             CASE WHEN current_completed_forms = 0 THEN 0.00 ELSE 100 END
--           ELSE ROUND(((current_completed_forms - previous_completed_forms)::NUMERIC / previous_completed_forms) * 100, 2)
--         END
--       ),
--       json_build_object(
--         'name', 'pending_forms',
--         'current_value', current_pending_forms,
--         'previous_value', previous_pending_forms,
--         'percent_change', CASE
--           WHEN previous_pending_forms = 0 THEN
--             CASE WHEN current_pending_forms = 0 THEN 0.00 ELSE 100 END
--           ELSE ROUND(((current_pending_forms - previous_pending_forms)::NUMERIC / previous_pending_forms) * 100, 2)
--         END
--       ),
--       json_build_object(
--         'name', 'rejected_forms',
--         'current_value', current_rejected_forms,
--         'previous_value', previous_rejected_forms,
--         'percent_change', CASE
--           WHEN previous_rejected_forms = 0 THEN
--             CASE WHEN current_rejected_forms = 0 THEN 0.00 ELSE 100 END
--           ELSE ROUND(((current_rejected_forms - previous_rejected_forms)::NUMERIC / previous_rejected_forms) * 100, 2)
--         END
--       )
--     )
--   );

--   RETURN result;
-- END
-- $$;


-- -- TODO: add comparisons when data is available
-- CREATE OR REPLACE VIEW analytics.summary_form_count AS
-- WITH counts AS (
--   SELECT
--     COUNT(*) FILTER (WHERE activity_type = 'field-data')           AS field_plannings_count,
--     COUNT(*) FILTER (WHERE activity_type = 'cultural-management')  AS crop_establishments_count,
--     COUNT(*) FILTER (WHERE activity_type = 'nutrient-management')  AS fertilization_records_count,
--     COUNT(*) FILTER (WHERE activity_type = 'production')           AS harvest_records_count,
--     COUNT(*) FILTER (WHERE activity_type = 'damage-assessment')    AS damage_assessments_count,
--     COUNT(*) FILTER (WHERE activity_type = 'monitoring-visit')     AS monitoring_visits_count
--   FROM field_activity_details
-- )
-- SELECT
--   json_build_object(
--     'start_date', ls.start_date,
--     'end_date',   ls.end_date,
--     'semester',   ls.semester,
--     'season_year',ls.season_year
--   ) AS season,
--   json_build_array(
--     json_build_object('form','field_plannings','count',c.field_plannings_count),
--     json_build_object('form','crop_establishments','count',c.crop_establishments_count),
--     json_build_object('form','fertilization_records','count',c.fertilization_records_count),
--     json_build_object('form','harvest_records','count',c.harvest_records_count),
--     json_build_object('form','damage_assessments','count',c.damage_assessments_count),
--     json_build_object('form','monitoring_visits','count',c.monitoring_visits_count)
--   ) AS data
-- FROM latest_season ls
-- CROSS JOIN counts c;
