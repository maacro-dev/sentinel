CREATE EXTENSION IF NOT EXISTS pg_cron;


CREATE OR REPLACE PROCEDURE create_future_seasons()
LANGUAGE plpgsql AS
$$
DECLARE
    last_season seasons%ROWTYPE;
    new_start date;
    new_end date;
    new_semester semester;
    new_season_year text;
BEGIN
    SELECT * INTO last_season
    FROM seasons
    ORDER BY end_date DESC
    LIMIT 1;

    WHILE last_season.end_date < current_date LOOP
        IF last_season.semester = 'first' THEN
            new_semester := 'second';
            new_start := last_season.end_date + interval '1 day';
            new_end := make_date(extract(year from new_start)::int, 9, 15) + interval '6 months';
            new_season_year := to_char(new_start, 'YYYY');
        ELSE
            new_semester := 'first';
            new_start := make_date(extract(year from last_season.start_date)::int, 9, 16);
            IF new_start <= last_season.end_date THEN
                new_start := make_date(extract(year from last_season.start_date)::int + 1, 9, 16);
            END IF;
            new_end := make_date(extract(year from new_start)::int + 1, 3, 15);
            new_season_year := to_char(new_start, 'YYYY') || '-' || to_char(new_end, 'YYYY');
        END IF;

        INSERT INTO seasons(start_date, end_date, semester, season_year)
        VALUES (new_start, new_end, new_semester, new_season_year);

        SELECT * INTO last_season
        FROM seasons
        ORDER BY end_date DESC
        LIMIT 1;
    END LOOP;
END;
$$;

CALL create_future_seasons();

SELECT cron.schedule(
    'create_future_seasons_daily',
    '0 0 * * *',
    $$CALL create_future_seasons();$$
);
