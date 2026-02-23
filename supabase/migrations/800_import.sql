
create or replace function find_or_create_farmer(
  p_first_name text,
  p_last_name text,
  p_gender text,
  p_date_of_birth text,
  p_cellphone_no text
) returns int as $$
declare
  v_farmer_id int;
begin
  select id into v_farmer_id
  from public.farmers
  where first_name = p_first_name and last_name = p_last_name
  limit 1;

  if v_farmer_id is null then
    insert into public.farmers (first_name, last_name, gender, date_of_birth, cellphone_no, created_at, updated_at)
    values (
      p_first_name,
      p_last_name,
      lower(p_gender)::public.gender,
      nullif(p_date_of_birth, '')::date,
      p_cellphone_no,
      now(),
      now()
    )
    returning id into v_farmer_id;
  end if;

  return v_farmer_id;
end;
$$ language plpgsql;


create or replace function find_barangay_id(
  p_province text,
  p_municity text,
  p_barangay text
) returns int as $$
declare
  v_barangay_id int;
begin
  select a.barangay_id into v_barangay_id
  from public.addresses a
  where a.barangay = p_barangay
    and a.city_municipality = p_municity
    and a.province = p_province;

  if v_barangay_id is null then
    raise exception 'barangay not found: %, %, %', p_province, p_municity, p_barangay;
  end if;

  return v_barangay_id;
end;
$$ language plpgsql;

create or replace function handle_mfid(
  p_mfid text,
  p_farmer_id int,
  p_barangay_id int,
  p_location spatial.geometry,
  p_auto_create_mfid boolean default true
) returns int as $$
declare
  v_field_id int;
  v_mfid_id int;
begin
  select id into v_field_id from public.fields where mfid = p_mfid;
  if v_field_id is not null then
    return v_field_id;
  end if;

  select id into v_mfid_id from public.mfids where mfid = p_mfid;
  if v_mfid_id is null then
    if p_auto_create_mfid then
      insert into public.mfids (mfid, created_at) values (p_mfid, now()) returning id into v_mfid_id;
    else
      raise exception 'mfid % not found in mfids table and auto-create is disabled', p_mfid;
    end if;
  end if;

  -- create new field
  insert into public.fields (farmer_id, barangay_id, mfid, location, created_at, updated_at)
  values (p_farmer_id, p_barangay_id, p_mfid, p_location, now(), now())
  returning id into v_field_id;

  -- mark mfid as used
  update public.mfids set used_at = now() where id = v_mfid_id;

  return v_field_id;
end;
$$ language plpgsql;


create or replace function parse_flexible_date(date_str text) returns date as $$
begin
  if date_str is null or date_str = '' OR date_str = 'N/A' THEN
    return null;
  end if;

  BEGIN
    RETURN (date_str::timestamp)::date;
  EXCEPTION WHEN OTHERS THEN
  END;

  date_str := trim(replace(date_str, '.', ''));
  begin
    return to_date(date_str, 'Mon DD YYYY');
  exception when others then
    begin
      return to_date(date_str, 'MM/DD/YYYY');
    exception when others then
      begin
        return to_date(date_str, 'DD-MM-YYYY');
      exception when others then
        raise exception 'cannot parse date: %', date_str;
      end;
    end;
  end;
end;
$$ language plpgsql immutable;


create or replace function import_field_plannings(
  p_data jsonb,
  p_auto_create_mfid boolean default true
) returns jsonb as $$
declare
  v_row record;
  v_farmer_id int;
  v_barangay_id int;
  v_field_id int;
  v_season_id int;
  v_activity_id int;
  v_imported int := 0;
  v_errors text[] := '{}';
  v_land_prep_start date;
  v_est_establish_date date;
  v_collected_at timestamptz;
  v_collected_by text;
begin
  for v_row in select * from jsonb_to_recordset(p_data) as x(
    mfid text,
    first_name text,
    last_name text,
    gender text,
    date_of_birth text,
    cellphone_no text,
    province text,
    municity text,
    barangay text,
    collected_by text,
    collected_at text,
    land_preparation_start_date text,
    est_crop_establishment_date text,
    est_crop_establishment_method text,
    total_field_area_ha float,
    soil_type text,
    current_field_condition text,
    location spatial.geometry
  )
  LOOP
    BEGIN
      BEGIN
        v_land_prep_start := public.parse_flexible_date(v_row.land_preparation_start_date);
      EXCEPTION WHEN OTHERS THEN
        v_land_prep_start := NULL;
      END;

      BEGIN
        v_est_establish_date := public.parse_flexible_date(v_row.est_crop_establishment_date);
      EXCEPTION WHEN OTHERS THEN
        v_est_establish_date := NULL;
      END;

      BEGIN
        IF v_row.collected_at IS NOT NULL AND v_row.collected_at != 'N/A' THEN
          v_collected_at := v_row.collected_at::timestamptz;
        ELSE
          v_collected_at := NULL;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        v_collected_at := NULL;
      END;

      v_farmer_id := public.find_or_create_farmer(
        v_row.first_name,
        v_row.last_name,
        v_row.gender,
        v_row.date_of_birth,
        v_row.cellphone_no
      );

      v_barangay_id := public.find_barangay_id(v_row.province, v_row.municity, v_row.barangay);

      v_field_id := public.handle_mfid(
        v_row.mfid,
        v_farmer_id,
        v_barangay_id,
        v_row.location,
        p_auto_create_mfid
      );

      select id into v_season_id
      from public.seasons
      where start_date <= v_land_prep_start
        and end_date >= v_land_prep_start;

      if v_season_id is null then
        raise exception 'no season found for land preparation start date %', v_land_prep_start;
      end if;

      insert into public.field_activities (
        field_id,
        season_id,
        activity_type,
        collected_by,
        collected_at,
        image_urls,
        verification_status
      ) values (
        v_field_id,
        v_season_id,
        'field_plannings',
        v_row.collected_by,
        coalesce(v_collected_at, now()),
        '[]'::jsonb,
        'pending'
      ) returning id into v_activity_id;

      insert into public.field_plannings (
        id, land_preparation_start_date, est_crop_establishment_date,
        est_crop_establishment_method, total_field_area_ha, soil_type, current_field_condition
      ) values (
        v_activity_id, v_land_prep_start, v_est_establish_date,
        v_row.est_crop_establishment_method, v_row.total_field_area_ha, v_row.soil_type, v_row.current_field_condition
      );

      v_imported := v_imported + 1;

    EXCEPTION WHEN OTHERS THEN
      v_errors := array_append(v_errors, format('row with mfid %s: %s', v_row.mfid, SQLERRM));
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'imported_count', v_imported,
    'errors', v_errors
  );
end;
$$ language plpgsql security definer set search_path = '';


create or replace function import_data_transaction(
  p_dataset_type text,
  p_data jsonb,
  p_auto_create_mfid boolean default true
) returns jsonb as $$
begin
  case p_dataset_type
    when 'field_plannings' then
      return import_field_plannings(p_data, p_auto_create_mfid);

    -- add other when clauses for other dataset types

    else
      raise exception 'unsupported dataset type: %', p_dataset_type;
  end case;
end;
$$ language plpgsql;
