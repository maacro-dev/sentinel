
create or replace function update_modified_column()
  returns trigger
  security definer
  set search_path = ''
as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger update_field_activities
  before update on public.field_activities for each row execute function update_modified_column();

create trigger update_farmers
  before update on public.farmers for each row execute function update_modified_column();

create trigger update_fields
  before update on public.fields for each row execute function update_modified_column();

create trigger update_users
  before update on public.users for each row execute function update_modified_column();



create or replace procedure create_future_seasons()
language plpgsql as
$$
declare
    last_season seasons%rowtype;
    new_start date;
    new_end date;
    new_semester semester;
    new_season_year text;
begin
    select * into last_season
    from seasons
    order by end_date desc
    limit 1;

    if last_season is null then
        new_start := date '2026-01-01';  -- first season start
        new_end := date '2026-06-30';    -- first season end
        new_semester := 'first';
        new_season_year := '2026';

        insert into seasons(start_date, end_date, semester, season_year)
        values (new_start, new_end, new_semester, new_season_year);

        select * into last_season
        from seasons
        order by end_date desc
        limit 1;
    end if;

    while last_season.end_date < current_date loop
        if last_season.semester = 'first' then
            new_semester := 'second';
            new_start := last_season.end_date + interval '1 day';
            new_end := make_date(extract(year from new_start)::int, 9, 15) + interval '6 months';
            new_season_year := to_char(new_start, 'YYYY');
        else
            new_semester := 'first';
            new_start := make_date(extract(year from last_season.start_date)::int, 9, 16);
            if new_start <= last_season.end_date then
                new_start := make_date(extract(year from last_season.start_date)::int + 1, 9, 16);
            end if;
            new_end := make_date(extract(year from new_start)::int + 1, 3, 15);
            new_season_year := to_char(new_start, 'YYYY') || '-' || to_char(new_end, 'YYYY');
        end if;

        insert into seasons(start_date, end_date, semester, season_year)
        values (new_start, new_end, new_semester, new_season_year);

        select * into last_season
        from seasons
        order by end_date desc
        limit 1;
    end loop;
end;
$$;

call create_future_seasons();
select cron.schedule( 'create_future_seasons_daily', '0 0 * * *', $$call create_future_seasons();$$);
