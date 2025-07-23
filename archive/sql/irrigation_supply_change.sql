
CREATE OR REPLACE VIEW analytics.seasonal_irrigation_supply_change AS
WITH irrigation_counts AS (
    SELECT
        s.start_date                                           AS start_date,
        s.end_date                                             AS end_date,
        s.semester                                             AS semester,
        s.season_year                                          AS season_year,
        COUNT(*) FILTER (WHERE hr.irrigation_supply IN ('Not Enough', 'Not Sufficient'))  AS current_not_sufficient,
        COUNT(*) FILTER (WHERE hr.irrigation_supply = 'Sufficient')                       AS current_sufficient,
        COUNT(*) FILTER (WHERE hr.irrigation_supply = 'Excessive')                       AS current_excessive,
        LAG(s.start_date)    OVER w                            AS previous_start_date,
        LAG(s.end_date)      OVER w                            AS previous_end_date,
        LAG(s.semester)      OVER w                            AS previous_semester,
        LAG(s.season_year)   OVER w                            AS previous_season_year,
        LAG(COUNT(*) FILTER (WHERE hr.irrigation_supply IN ('Not Enough', 'Not Sufficient'))) OVER w  AS previous_not_sufficient,
        LAG(COUNT(*) FILTER (WHERE hr.irrigation_supply = 'Sufficient'))            OVER w  AS previous_sufficient,
        LAG(COUNT(*) FILTER (WHERE hr.irrigation_supply = 'Excessive'))            OVER w  AS previous_excessive
    FROM harvest_records hr
    JOIN field_activities fa ON hr.id = fa.id
    JOIN seasons s         ON fa.season_id = s.id
    GROUP BY
        s.start_date,
        s.end_date,
        s.semester,
        s.season_year
    WINDOW w AS (ORDER BY s.start_date)
)
SELECT
    start_date                AS current_start_date,
    end_date                  AS current_end_date,
    semester                  AS current_semester,
    season_year               AS current_season_year,
    current_not_sufficient,
    current_sufficient,
    current_excessive,
    previous_start_date,
    previous_end_date,
    previous_semester,
    previous_season_year,
    previous_not_sufficient,
    previous_sufficient,
    previous_excessive,
    CASE
      WHEN previous_not_sufficient   > 0
      THEN ROUND(
             (
               (current_not_sufficient   - previous_not_sufficient  )::numeric
               / previous_not_sufficient
             ) * 100
           , 2)
      ELSE NULL
    END                         AS not_sufficient_change_pct,
    CASE
      WHEN previous_sufficient       > 0
      THEN ROUND(
             (
               (current_sufficient       - previous_sufficient      )::numeric
               / previous_sufficient
             ) * 100
           , 2)
      ELSE NULL
    END                         AS sufficient_change_pct,
    CASE
      WHEN previous_excessive       > 0
      THEN ROUND(
             (
               (current_excessive       - previous_excessive      )::numeric
               / previous_excessive
             ) * 100
           , 2)
      ELSE NULL
    END                         AS excessive_change_pct
FROM irrigation_counts
WHERE previous_start_date IS NOT NULL
ORDER BY start_date DESC
LIMIT 1;
