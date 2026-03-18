CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER
    SECURITY DEFINER
    SET search_path = ''
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN new;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER update_field_activities
    BEFORE UPDATE ON public.field_activities FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_farmers
    BEFORE UPDATE ON public.farmers FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_fields
    BEFORE UPDATE ON public.fields FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_users
    BEFORE UPDATE ON public.users FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- CREATE OR REPLACE PROCEDURE create_future_seasons()
-- LANGUAGE plpgsql
-- AS $$
-- DECLARE
--     last_season seasons%rowtype;
--     new_start date;
--     new_end date;
--     new_semester semester;
--     new_season_year text;
-- BEGIN
--     SELECT * INTO last_season
--     FROM seasons
--     ORDER BY end_date DESC
--     LIMIT 1;
--     IF last_season IS NULL THEN
--         new_start := date '2026-01-01';
--         -- first season start
--         new_end := date '2026-06-30';
--         -- first season end
--         new_semester := 'first';
--         new_season_year := '2026';
--         INSERT INTO seasons(start_date, end_date, semester, season_year)
--             VALUES (new_start, new_end, new_semester, new_season_year);
--         SELECT * INTO last_season
--         FROM seasons
--         ORDER BY end_date DESC
--         LIMIT 1;
--     END IF;
--     while last_season.end_date < CURRENT_DATE LOOP
--         IF last_season.semester = 'first' THEN
--             new_semester := 'second';
--             new_start := last_season.end_date + interval '1 day';
--             new_end := MAKE_DATE(EXTRACT(year FROM new_start)::int, 9, 15) + interval '6 months';
--             new_season_year := TO_CHAR(new_start, 'YYYY');
--         ELSE
--             new_semester := 'first';
--             new_start := MAKE_DATE(EXTRACT(year FROM last_season.start_date)::int, 9, 16);
--             IF new_start <= last_season.end_date THEN
--                 new_start := MAKE_DATE(EXTRACT(year FROM last_season.start_date)::int + 1, 9, 16);
--             END IF;
--             new_end := MAKE_DATE(EXTRACT(year FROM new_start)::int + 1, 3, 15);
--             new_season_year := TO_CHAR(new_start, 'YYYY') || '-' || TO_CHAR(new_end, 'YYYY');
--         END IF;
--         INSERT INTO seasons(start_date, end_date, semester, season_year)
--             VALUES (new_start, new_end, new_semester, new_season_year);
--         SELECT * INTO last_season
--         FROM seasons
--         ORDER BY end_date DESC
--         LIMIT 1;
--     END LOOP;
-- END;
-- $$;

-- CALL create_future_seasons();

-- SELECT cron.schedule('create_future_seasons_daily', '0 0 * * *', $$ CALL create_future_seasons();

-- $$);
