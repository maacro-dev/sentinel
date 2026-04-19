CREATE OR REPLACE PROCEDURE create_future_seasons()
LANGUAGE plpgsql
AS $$
DECLARE
    last_season seasons%rowtype;
    new_start date;
    new_end date;
    new_semester semester;
    start_year int;
BEGIN
    SELECT * INTO last_season
    FROM seasons
    ORDER BY end_date DESC
    LIMIT 1;
    while last_season.end_date < CURRENT_DATE LOOP
        IF last_season.semester = 'first' THEN
            new_semester := 'second';
            start_year := EXTRACT(year FROM last_season.start_date);
            new_start := MAKE_DATE(start_year, 9, 16);
            new_end := MAKE_DATE(start_year + 1, 3, 15);
        ELSE
            new_semester := 'first';
            start_year := EXTRACT(year FROM last_season.end_date);
            new_start := MAKE_DATE(start_year, 3, 16);
            new_end := MAKE_DATE(start_year, 9, 15);
        END IF;
        INSERT INTO seasons(start_date, end_date, semester, season_year)
            VALUES (new_start, new_end, new_semester, CASE WHEN new_semester = 'first' THEN
                    TO_CHAR(new_start, 'YYYY')
                ELSE
                    TO_CHAR(new_start, 'YYYY') || '-' || TO_CHAR(new_end, 'YYYY')
                END);
        SELECT * INTO last_season
        FROM seasons
        ORDER BY end_date DESC
        LIMIT 1;
    END LOOP;
END;
$$;

CALL create_future_seasons();

SELECT cron.schedule('create_future_seasons_daily', '0 0 * * *', $$ SELECT create_future_seasons(); $$);

