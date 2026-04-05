
create or replace function find_season_id_by_date(
    p_date text
)
    returns int
    language plpgsql
    set search_path = public
as $$
declare
    v_season_id int;
begin
    select id into v_season_id
    from public.seasons
    where public.parse_date(p_date) between start_date and end_date
    limit 1;

    if v_season_id is null then
        raise exception 'Season not found for date: %', p_date;
    end if;

    return v_season_id;
end;
$$;

create or replace function find_or_create_farmer(
    p_first_name text,
    p_last_name text,
    p_gender text default null,
    p_date_of_birth text default null,
    p_cellphone_no text default null
)
    returns int
    language plpgsql
as $$
declare
    v_farmer_id int;
begin

    -- search by first + last name (assuming these are unique enough for now)
    select id into v_farmer_id
    from public.farmers
    where first_name = p_first_name and last_name = p_last_name
    limit 1;

    if v_farmer_id is null then
        insert into public.farmers (
            first_name,
            last_name,
            gender,
            date_of_birth,
            cellphone_no,
            created_at,
            updated_at
        ) values (
            p_first_name,
            p_last_name,
            case when p_gender is not null then lower(p_gender)::public.gender else null end,
            case when p_date_of_birth is not null then public.parse_date(p_date_of_birth) else null end,
            p_cellphone_no,
            now(),
            now()
        ) on conflict (first_name, last_name) do update set updated_at = now()

        returning id into v_farmer_id;
    end if;

    return v_farmer_id;
end;
$$;


create or replace function find_barangay_id(
    p_province text,
    p_municity text,
    p_barangay text
)
    returns int
    language plpgsql
as $$
declare
    v_barangay_id int;
begin
    select a.barangay_id into v_barangay_id
    from public.addresses a
    where a.barangay = p_barangay
        and a.city_municipality = p_municity
        and a.province = p_province;

    if v_barangay_id is null then
        -- for error reporting
        raise exception 'Barangay not found for (province, city, barangay): (%, %, %)', p_province, p_municity, p_barangay;
    end if;

    return v_barangay_id;
end;
$$;

create or replace function public.handle_mfid(
    p_mfid text,
    p_farmer_id int,
    p_barangay_id int,
    p_location spatial.geometry default null,
    p_auto_create_mfid boolean default true
)
    returns int
    language plpgsql
    set search_path = public
as $$
declare
    v_field_id int;
    v_mfid_id int;
begin
    select id into v_mfid_id
    from public.mfids
    where mfid = p_mfid;

    if v_mfid_id is null then
        if p_auto_create_mfid then
            insert into public.mfids (mfid)
            values (p_mfid)
            returning id into v_mfid_id;
        else
            raise exception 'MFID % not found in mfids table and auto‑create is disabled', p_mfid;
        end if;
    else

        select id into v_field_id
        from public.fields
        where mfid_id = v_mfid_id;

        if v_field_id is not null then
            return v_field_id;
        end if;
    end if;

    insert into public.fields (farmer_id, barangay_id, mfid_id, location)
    values (p_farmer_id, p_barangay_id, v_mfid_id, p_location)
    returning id into v_field_id;

    update public.mfids
    set used_at = now()
    where id = v_mfid_id and used_at is null;

    return v_field_id;
end;
$$;


create or replace function parse_date(date_str text)
    returns date
    language sql immutable
    set search_path = public
as $$
    select case
        when date_str is null or trim(date_str) = '' or date_str = 'N/A' then null
        else date_str::date
    end;
$$;

create or replace function parse_timestamptz(timestamptz_str text)
    returns timestamptz
    language sql immutable
    set search_path = public
as $$
    select case
        when timestamptz_str is null or trim(timestamptz_str) = '' or timestamptz_str = 'N/A' then null
        else timestamptz_str::timestamptz
    end;
$$;

create or replace function find_season_id_by_date(p_date date)
    returns bigint
    language sql immutable
    set search_path = public
as $$
    select id
    from public.seasons
    where p_date between start_date and end_date
    limit 1;
$$;


create or replace function find_or_create_collector_id(p_collector_json jsonb)
    returns uuid
    language plpgsql
as $$
declare
    v_first_name text;
    v_last_name  text;
    v_user_id    uuid;
    v_email      text;
    v_password   text;
begin

    -- handle null or "n/a"
    if p_collector_json is null or p_collector_json = '"N/A"'::jsonb or p_collector_json = '"N/A"' then
      return null;
    end if;

    -- ensure we have an object with first and last names
    -- could remove if all dataset types work correctly now
    if jsonb_typeof(p_collector_json) != 'object' then
        -- for reporting
        raise exception 'collector must be a JSON object with "first" and "last" keys';
    end if;

    v_first_name := p_collector_json->>'first';
    v_last_name  := p_collector_json->>'last';

    -- assertion when developing
    if v_first_name is null or v_last_name is null then
        raise exception 'collector object missing "first" or "last"';
    end if;

    -- look for existing user with the same first+last name
    select id into v_user_id
    from public.users
    where first_name = v_first_name and last_name  = v_last_name
    limit 1;

    if not found then
      -- Create a new user with role 'data_collector'
      v_user_id := gen_random_uuid();
      v_email   := lower(v_first_name || '.' || v_last_name || '.' ||
                        substr(md5(random()::text), 1, 8) || '@humayapp.com');
      v_password := substr(md5(random()::text), 1, 16);

      perform public.create_seed_user(
        p_id           => v_user_id,
        p_email        => v_email,
        p_password     => v_password,
        p_first_name   => v_first_name,
        p_last_name    => v_last_name,
        p_date_of_birth => '1900-01-01'::date,
        p_role         => 'data_collector',
        p_created_at   => now(),
        p_is_active    => false
      );
    end if;

    return v_user_id;
end;
$$;

