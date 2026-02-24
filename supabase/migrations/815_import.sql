create or replace function import_field_plannings(
    p_data jsonb,
    p_auto_create_mfid boolean default true
)
    returns jsonb
    language plpgsql
as $$
declare
    v_imported int := 0;
    v_errors text[] := '{}';

    v_row record;

    v_farmer_id int;
    v_barangay_id int;
    v_field_id int;
    v_season_id int;
    v_activity_id int;
    v_collector_id uuid;
    v_collected_at timestamptz;

    v_land_prep_start date;
    v_est_establish_date date;
begin
    for v_row in
        select * from jsonb_to_recordset(p_data) as x(
            -- field_activities
            province                        text,
            municity                        text,
            barangay                        text,
            mfid                            text,
            first_name                      text,
            last_name                       text,
            collected_by                    jsonb,
            collected_at                    text,

            -- field_plannings
            gender                          text,
            date_of_birth                   text,
            cellphone_no                    text,
            land_preparation_start_date     text,
            est_crop_establishment_date     text,
            est_crop_establishment_method   text,
            total_field_area_ha             float,
            soil_type                       text,
            current_field_condition         text,
            location                        spatial.geometry
        )
    loop
        begin

            -- parse dates & timestamptz (null if invalid)
            v_land_prep_start   := public.parse_date(v_row.land_preparation_start_date);
            v_est_establish_date := public.parse_date(v_row.est_crop_establishment_date);
            v_collected_at := public.parse_timestamptz(v_row.collected_at);

            -- resolve collector id (creates user if not present, null if N/A)
            v_collector_id := public.find_or_create_collector_id(v_row.collected_by);

            -- public.farmer
            v_farmer_id := public.find_or_create_farmer(
              v_row.first_name,
              v_row.last_name,
              v_row.gender,
              v_row.date_of_birth,
              v_row.cellphone_no
            );

            -- public.barangay
            v_barangay_id := public.find_barangay_id(v_row.province, v_row.municity, v_row.barangay);

            -- public.field
            v_field_id := public.handle_mfid(
              v_row.mfid,
              v_farmer_id,
              v_barangay_id,
              v_row.location,
              p_auto_create_mfid
            );

            -- todo: should be derived from collected_at
            v_season_id := public.find_season_id_by_date(v_row.collected_at);

            -- public.field_activities
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
                'field-data',
                v_collector_id,
                v_collected_at,
                '[]'::jsonb,
                'unknown' -- review this.
            ) returning id into v_activity_id;

            -- public.field_plannings
            insert into public.field_plannings (
                id, land_preparation_start_date,
                est_crop_establishment_date,
                est_crop_establishment_method,
                total_field_area_ha,
                soil_type,
                current_field_condition
            ) values (
                v_activity_id,
                v_land_prep_start,
                v_est_establish_date,
                v_row.est_crop_establishment_method,
                v_row.total_field_area_ha,
                v_row.soil_type,
                v_row.current_field_condition
            );

            v_imported := v_imported + 1;

            exception when others then v_errors := array_append(v_errors,format('Row with MFID %s: %s', v_row.mfid, SQLERRM));
        end;
    end loop;

    return jsonb_build_object( 'imported_count', v_imported, 'errors', v_errors);
end;
$$;


create or replace function import_harvest_records(
    p_data jsonb,
    p_auto_create_mfid boolean default true
)
    returns jsonb
    language plpgsql
as $$
declare
    v_imported int := 0;
    v_errors text[] := '{}';

    v_row record;

    v_farmer_id int;
    v_barangay_id int;
    v_field_id int;
    v_season_id int;
    v_activity_id int;
    v_collector_id uuid;
    v_collected_at timestamptz;

    v_harvest_date date;
begin
    for v_row in
        select * from jsonb_to_recordset(p_data) as x(
            -- field_activities
            province            text,
            municity            text,
            barangay            text,
            mfid                text,
            first_name          text,
            last_name           text,
            collected_by        jsonb,
            collected_at        text,

            -- harvest_records
            harvest_date        text,
            harvesting_method   text,
            bags_harvested      int,
            avg_bag_weight_kg   double precision,
            area_harvested_ha   double precision,
            irrigation_supply   text
        )
    loop
        begin
            -- parse dates & timestamptz (null if invalid)
            v_harvest_date   := public.parse_date(v_row.harvest_date);
            v_collected_at := public.parse_timestamptz(v_row.collected_at);

            -- resolve collector id (creates user if not present, null if N/A)
            v_collector_id := public.find_or_create_collector_id(v_row.collected_by);

            -- public.farmer
            v_farmer_id := public.find_or_create_farmer(v_row.first_name, v_row.last_name);

            -- public.barangay
            v_barangay_id := public.find_barangay_id(v_row.province, v_row.municity, v_row.barangay);

            -- public.field
            v_field_id := public.handle_mfid(v_row.mfid, v_farmer_id, v_barangay_id, null, p_auto_create_mfid);

            -- todo: should be derived from collected_at
            v_season_id := public.find_season_id_by_date(v_row.collected_at);

            -- public.field_activities
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
                'production',
                v_collector_id,
                v_collected_at,
                '[]'::jsonb,
                'unknown' -- review this.
            ) returning id into v_activity_id;

            -- public.field_plannings
            insert into public.harvest_records (
                id,
                harvest_date,
                harvesting_method,
                bags_harvested,
                avg_bag_weight_kg,
                area_harvested_ha,
                irrigation_supply
            ) values (
                v_activity_id,
                v_harvest_date,
                v_row.harvesting_method::public.harvesting_method,
                v_row.bags_harvested,
                v_row.avg_bag_weight_kg,
                v_row.area_harvested_ha,
                v_row.irrigation_supply::public.irrigation_supply
            );

            v_imported := v_imported + 1;

            exception when others then v_errors := array_append(v_errors,format('Row with MFID %s: %s', v_row.mfid, SQLERRM));
        end;
    end loop;

    return jsonb_build_object( 'imported_count', v_imported, 'errors', v_errors);
end;
$$;


create or replace function import_data_transaction(
    p_dataset_type text,
    p_data jsonb,
    p_auto_create_mfid boolean default true
)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
begin
    case p_dataset_type
        when 'field_plannings' then
            return public.import_field_plannings(p_data, p_auto_create_mfid);

        when 'harvest_records' then
            return public.import_harvest_records(p_data, p_auto_create_mfid);


        else
          raise exception 'Unsupported dataset type: %', p_dataset_type;
    end case;
end;
$$;
