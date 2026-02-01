
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
    has_previous boolean := false;
    result jsonb;
begin
    select * into curr from public.seasons order by start_date desc limit 1;
    if not found then
        return json_build_object();
    end if;

    select * into prev from public.seasons
    where start_date < curr.start_date
    order by start_date desc limit 1;

    has_previous := prev is not null;

    -- Only query data for seasons that exist
    if has_previous then
        select
            coalesce(count(distinct field_id) filter (where season_id = curr.id), 0),
            coalesce(count(distinct field_id) filter (where season_id = prev.id), 0),
            coalesce(count(*) filter (where season_id = curr.id), 0),
            coalesce(count(*) filter (where season_id = prev.id), 0)
        into current_field_count, previous_field_count, current_forms_submitted, previous_forms_submitted
        from public.field_activities
        where season_id in (curr.id, prev.id);
    else
        select
            coalesce(count(distinct field_id), 0),
            coalesce(count(*), 0)
        into current_field_count, current_forms_submitted
        from public.field_activities
        where season_id = curr.id;
    end if;

    if has_previous then
        select
            coalesce(count(*) filter (where fa.season_id = curr.id), 0),
            coalesce(count(*) filter (where fa.season_id = prev.id), 0),
            coalesce(count(*) filter (where da.observed_pest is not null and fa.season_id = curr.id), 0),
            coalesce(count(*) filter (where da.observed_pest is not null and fa.season_id = prev.id), 0)
        into current_damage_reports, previous_damage_reports, current_pest_reports, previous_pest_reports
        from public.field_activities fa
        join public.damage_assessments da on da.id = fa.id
        where fa.season_id in (curr.id, prev.id);
    else
        select
            coalesce(count(*), 0),
            coalesce(count(*) filter (where da.observed_pest is not null), 0)
        into current_damage_reports, current_pest_reports
        from public.field_activities fa
        join public.damage_assessments da on da.id = fa.id
        where fa.season_id = curr.id;
    end if;

    if has_previous then
        select
            coalesce(sum(hr.area_harvested_ha) filter (where fa.season_id = curr.id), 0),
            coalesce(sum(hr.area_harvested_ha) filter (where fa.season_id = prev.id), 0),
            coalesce(sum(hr.bags_harvested * hr.avg_bag_weight_kg) filter (where fa.season_id = curr.id), 0),
            coalesce(sum(hr.bags_harvested * hr.avg_bag_weight_kg) filter (where fa.season_id = prev.id), 0),
            coalesce(count(*) filter (where hr.irrigation_supply in ('Not Enough', 'Not Sufficient') and fa.season_id = curr.id), 0),
            coalesce(count(*) filter (where hr.irrigation_supply in ('Not Enough', 'Not Sufficient') and fa.season_id = prev.id), 0)
        into current_total_area, previous_total_area, current_total_yield, previous_total_yield, current_not_sufficient, previous_not_sufficient
        from public.field_activities fa
        join public.harvest_records hr on hr.id = fa.id
        where fa.season_id in (curr.id, prev.id);
    else
        select
            coalesce(sum(hr.area_harvested_ha), 0),
            coalesce(sum(hr.bags_harvested * hr.avg_bag_weight_kg), 0),
            coalesce(count(*) filter (where hr.irrigation_supply in ('Not Enough', 'Not Sufficient')), 0)
        into current_total_area, current_total_yield, current_not_sufficient
        from public.field_activities fa
        join public.harvest_records hr on hr.id = fa.id
        where fa.season_id = curr.id;
    end if;

    current_yield := case when current_total_area > 0 then round((current_total_yield / current_total_area) / 1000, 2) else 0 end;
    previous_yield := case when previous_total_area > 0 then round((previous_total_yield / previous_total_area) / 1000, 2) else 0 end;

    if has_previous then
        select
            coalesce(round(
                (sum(case when fa.season_id = curr.id and (
                    (fa.activity_type = 'field-data' and fp.id is not null) or
                    (fa.activity_type = 'cultural-management' and ce.id is not null) or
                    (fa.activity_type = 'nutrient-management' and fr.id is not null) or
                    (fa.activity_type = 'production' and hr.id is not null)
                ) and fa.verification_status = 'approved' then 1 else 0 end) * 100.0) /
                nullif(count(*) filter (where fa.season_id = curr.id), 0), 2), 0),
            coalesce(round(
                (sum(case when fa.season_id = prev.id and (
                    (fa.activity_type = 'field-data' and fp.id is not null) or
                    (fa.activity_type = 'cultural-management' and ce.id is not null) or
                    (fa.activity_type = 'nutrient-management' and fr.id is not null) or
                    (fa.activity_type = 'production' and hr.id is not null)
                ) and fa.verification_status = 'approved' then 1 else 0 end) * 100.0) /
                nullif(count(*) filter (where fa.season_id = prev.id), 0), 2), 0)
        into current_data_completeness, previous_data_completeness
        from public.field_activities fa
        left join public.field_plannings fp on fp.id = fa.id and fa.activity_type = 'field-data'
        left join public.crop_establishments ce on ce.id = fa.id and fa.activity_type = 'cultural-management'
        left join public.fertilization_records fr on fr.id = fa.id and fa.activity_type = 'nutrient-management'
        left join public.harvest_records hr on hr.id = fa.id and fa.activity_type = 'production'
        where fa.season_id in (curr.id, prev.id);
    else
        select
            coalesce(round(
                (sum(case when (
                    (fa.activity_type = 'field-data' and fp.id is not null) or
                    (fa.activity_type = 'cultural-management' and ce.id is not null) or
                    (fa.activity_type = 'nutrient-management' and fr.id is not null) or
                    (fa.activity_type = 'production' and hr.id is not null)
                ) and fa.verification_status = 'approved' then 1 else 0 end) * 100.0) /
                nullif(count(*), 0), 2), 0)
        into current_data_completeness
        from public.field_activities fa
        left join public.field_plannings fp on fp.id = fa.id and fa.activity_type = 'field-data'
        left join public.crop_establishments ce on ce.id = fa.id and fa.activity_type = 'cultural-management'
        left join public.fertilization_records fr on fr.id = fa.id and fa.activity_type = 'nutrient-management'
        left join public.harvest_records hr on hr.id = fa.id and fa.activity_type = 'production'
        where fa.season_id = curr.id;
    end if;

    result := json_build_object(
      'seasons', json_build_object(
        'current', json_build_object(
          'start_date', curr.start_date,
          'end_date', curr.end_date,
          'semester', curr.semester,
          'season_year', curr.season_year
        ),
        'previous', case when has_previous then json_build_object(
          'start_date', prev.start_date,
          'end_date', prev.end_date,
          'semester', prev.semester,
          'season_year', prev.season_year
        ) else null end
      ),
      'data', json_build_array(
        json_build_object(
          'name', 'field_count',
          'current_value', current_field_count,
          'previous_value', previous_field_count,
          'percent_change', case when previous_field_count = 0 then case when current_field_count = 0 then 0.00 else 100 end else round(
            (
              (
                current_field_count - previous_field_count
              ):: numeric / previous_field_count
            ) * 100,
            2
          ) end
        ),
        json_build_object(
          'name', 'form_submission',
          'current_value', current_forms_submitted,
          'previous_value', previous_forms_submitted,
          'percent_change', case when previous_forms_submitted = 0 then case when current_forms_submitted = 0 then 0.00 else 100 end else round(
            (
              (
                current_forms_submitted - previous_forms_submitted
              ):: numeric / previous_forms_submitted
            ) * 100,
            2
          ) end
        ),
        json_build_object(
          'name', 'yield',
          'current_value', current_yield,
          'previous_value', previous_yield,
          'percent_change', case when previous_yield = 0 then case when current_yield = 0 then 0.00 else 100 end else round(
            (
              (current_yield - previous_yield) / previous_yield
            ) * 100,
            2
          ) end
        ),
        json_build_object(
          'name', 'harvested_area',
          'current_value', round(current_total_area, 2),
          'previous_value', round(previous_total_area, 2),
          'percent_change', case when previous_total_area = 0 then case when current_total_area = 0 then 0.00 else 100 end else round(
            (
              (
                current_total_area - previous_total_area
              ) / previous_total_area
            ) * 100,
            2
          ) end
        ),
        json_build_object(
          'name', 'irrigation',
          'current_value', current_not_sufficient,
          'previous_value', previous_not_sufficient,
          'percent_change', case when previous_not_sufficient = 0 then case when current_not_sufficient = 0 then 0.00 else 100 end else round(
            (
              (
                current_not_sufficient - previous_not_sufficient
              ):: numeric / previous_not_sufficient
            ) * 100,
            2
          ) end
        ),
        json_build_object(
          'name', 'data_completeness',
          'current_value', current_data_completeness,
          'previous_value', previous_data_completeness,
          'percent_change', case when previous_data_completeness = 0 then case when current_data_completeness = 0 then 0.00 else 100 end else round(
            (
              (
                current_data_completeness - previous_data_completeness
              ) / previous_data_completeness
            ) * 100,
            2
          ) end
        ),
        json_build_object(
          'name', 'damage_report',
          'current_value', current_damage_reports,
          'previous_value', previous_damage_reports,
          'percent_change', case when previous_damage_reports = 0 then case when current_damage_reports = 0 then 0.00 else 100 end else round(
            (
              (
                current_damage_reports - previous_damage_reports
              ):: numeric / previous_damage_reports
            ) * 100,
            2
          ) end
        ),
        json_build_object(
          'name', 'pest_report',
          'current_value', current_pest_reports,
          'previous_value', previous_pest_reports,
          'percent_change',
            case when previous_pest_reports = 0 then case when current_pest_reports = 0 then 0.00 else 100 end else round(
            (
              (
                current_pest_reports - previous_pest_reports
              ):: numeric / previous_pest_reports
            ) * 100,
            2
          ) end
        )
      )
    );

    return result;
end;
$$;



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
        SUM(hr.area_harvested_ha) AS total_area
    FROM season_data sd
    JOIN field_activities fa ON fa.season_id = sd.season_id
    JOIN harvest_records hr ON hr.id = fa.id
    JOIN fields f ON fa.field_id = f.id
    GROUP BY f.barangay_id
    HAVING SUM(hr.area_harvested_ha) > 0
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
    SELECT COALESCE(json_agg(json_build_object(
      'barangay',       barangay,
      'province',       province,
      'municipality',   municipality,
      'avg_yield_t_per_ha', avg_yield_t_per_ha,
      'rank',           yield_rank
    )), '[]'::json)
    FROM barangay_ranking
    WHERE yield_rank <= 3
  ) AS top,
  (
    SELECT COALESCE(json_agg(json_build_object(
      'barangay',       barangay,
      'province',       province,
      'municipality',   municipality,
      'avg_yield_t_per_ha', avg_yield_t_per_ha,
      'rank',           yield_rank
    )), '[]'::json)
    FROM (
      SELECT *,
             RANK() OVER (ORDER BY avg_yield_t_per_ha ASC) AS reverse_rank
      FROM barangay_ranking
    ) r
    WHERE reverse_rank <= 3
  ) AS bottom;



CREATE OR REPLACE VIEW analytics.trend_overall_yield AS
WITH latest_season AS (
  SELECT
    id,
    start_date,
    end_date,
    semester,
    season_year
  FROM seasons
  ORDER BY start_date DESC
  LIMIT 1
),
yield_by_month AS (
  SELECT
    date_trunc('month', hr.harvest_date)::date AS date,
    round(avg((hr.bags_harvested * hr.avg_bag_weight_kg) / nullif(hr.area_harvested_ha, 0) / 1000.0)::numeric ,2) AS avg_yield_t_ha
  FROM harvest_records hr
  JOIN field_activities fa
    ON hr.id = fa.id
  JOIN latest_season ls
    ON fa.season_id = ls.id
  GROUP BY 1
  ORDER BY 1
)
SELECT
  coalesce(
    (SELECT json_build_object(
        'start_date',  ls.start_date,
        'end_date',    ls.end_date,
        'semester',    ls.semester,
        'season_year', ls.season_year
     )
     FROM latest_season ls),
    '{}'::json
  ) AS season,
  coalesce(
    (SELECT json_agg(
        json_build_object(
          'date',           ym.date,
          'avg_yield_t_ha', ym.avg_yield_t_ha
        )
        ORDER BY ym.date
      )
     FROM yield_by_month ym),
    '[]'::json
  ) AS data;



CREATE OR REPLACE VIEW analytics.trend_data_collection AS
WITH latest_season AS (
  SELECT id, start_date, end_date, semester, season_year
  FROM seasons
  ORDER BY start_date DESC
  LIMIT 1
),
collection_rate AS (
  SELECT
    DATE(fa.collected_at) AS date,
    COUNT(*) AS data_collected
  FROM field_activities fa
  JOIN latest_season ls ON fa.season_id = ls.id
  GROUP BY DATE(fa.collected_at)
)
SELECT
  ( SELECT
      json_build_object(
        'start_date',    ls.start_date,
        'end_date',      ls.end_date,
        'semester',      ls.semester,
        'season_year',   ls.season_year
      )
    FROM latest_season ls
  ) AS season,
  COALESCE(
    ( SELECT
        json_agg(
          json_build_object(
            'date', cr.date,
            'data_collected', cr.data_collected
          )
        )
      FROM collection_rate cr
    ),
    '[]'::json
  ) AS data;



CREATE OR REPLACE FUNCTION analytics.summary_form_progress()
  RETURNS JSON
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $$
DECLARE
  curr RECORD;
  prev RECORD;
  previous_total_forms NUMERIC := 0;
  current_total_forms NUMERIC := 0;
  previous_completed_forms NUMERIC := 0;
  current_completed_forms NUMERIC := 0;
  previous_pending_forms NUMERIC := 0;
  current_pending_forms NUMERIC := 0;
  previous_rejected_forms NUMERIC := 0;
  current_rejected_forms NUMERIC := 0;
  result JSONB;
BEGIN
  SELECT * INTO curr FROM public.seasons ORDER BY start_date DESC LIMIT 1;
  IF NOT FOUND THEN
    RETURN json_build_object();
  END IF;

  SELECT * INTO prev FROM public.seasons
  WHERE start_date < curr.start_date
  ORDER BY start_date DESC LIMIT 1;
  IF prev IS NULL THEN
    RETURN json_build_object();
  END IF;

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

  result := json_build_object(
    'seasons', json_build_object(
      'current', json_build_object(
        'start_date', curr.start_date,
        'end_date', curr.end_date,
        'semester', curr.semester,
        'season_year', curr.season_year
      ),
      'previous', json_build_object(
        'start_date', prev.start_date,
        'end_date', prev.end_date,
        'semester', prev.semester,
        'season_year', prev.season_year
      )
    ),
    'data', json_build_array(
      json_build_object(
        'name', 'total_forms',
        'current_value', current_total_forms,
        'previous_value', previous_total_forms,
        'percent_change', CASE
          WHEN previous_total_forms = 0 THEN
            CASE WHEN current_total_forms = 0 THEN 0.00 ELSE 100 END
          ELSE ROUND(((current_total_forms - previous_total_forms)::NUMERIC / previous_total_forms) * 100, 2)
        END
      ),
      json_build_object(
        'name', 'completed_forms',
        'current_value', current_completed_forms,
        'previous_value', previous_completed_forms,
        'percent_change', CASE
          WHEN previous_completed_forms = 0 THEN
            CASE WHEN current_completed_forms = 0 THEN 0.00 ELSE 100 END
          ELSE ROUND(((current_completed_forms - previous_completed_forms)::NUMERIC / previous_completed_forms) * 100, 2)
        END
      ),
      json_build_object(
        'name', 'pending_forms',
        'current_value', current_pending_forms,
        'previous_value', previous_pending_forms,
        'percent_change', CASE
          WHEN previous_pending_forms = 0 THEN
            CASE WHEN current_pending_forms = 0 THEN 0.00 ELSE 100 END
          ELSE ROUND(((current_pending_forms - previous_pending_forms)::NUMERIC / previous_pending_forms) * 100, 2)
        END
      ),
      json_build_object(
        'name', 'rejected_forms',
        'current_value', current_rejected_forms,
        'previous_value', previous_rejected_forms,
        'percent_change', CASE
          WHEN previous_rejected_forms = 0 THEN
            CASE WHEN current_rejected_forms = 0 THEN 0.00 ELSE 100 END
          ELSE ROUND(((current_rejected_forms - previous_rejected_forms)::NUMERIC / previous_rejected_forms) * 100, 2)
        END
      )
    )
  );

  RETURN result;
END
$$;


-- TODO: add comparisons when data is available
CREATE OR REPLACE VIEW analytics.summary_form_count AS
WITH counts AS (
  SELECT
    COUNT(*) FILTER (WHERE activity_type = 'field-data')           AS field_plannings_count,
    COUNT(*) FILTER (WHERE activity_type = 'cultural-management')  AS crop_establishments_count,
    COUNT(*) FILTER (WHERE activity_type = 'nutrient-management')  AS fertilization_records_count,
    COUNT(*) FILTER (WHERE activity_type = 'production')           AS harvest_records_count,
    COUNT(*) FILTER (WHERE activity_type = 'damage-assessment')    AS damage_assessments_count,
    COUNT(*) FILTER (WHERE activity_type = 'monitoring-visit')     AS monitoring_visits_count
  FROM field_activity_details
)
SELECT
  json_build_object(
    'start_date', ls.start_date,
    'end_date',   ls.end_date,
    'semester',   ls.semester,
    'season_year',ls.season_year
  ) AS season,
  json_build_array(
    json_build_object('form','field_plannings','count',c.field_plannings_count),
    json_build_object('form','crop_establishments','count',c.crop_establishments_count),
    json_build_object('form','fertilization_records','count',c.fertilization_records_count),
    json_build_object('form','harvest_records','count',c.harvest_records_count),
    json_build_object('form','damage_assessments','count',c.damage_assessments_count),
    json_build_object('form','monitoring_visits','count',c.monitoring_visits_count)
  ) AS data
FROM latest_season ls
CROSS JOIN counts c;
