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
    v_row_count int;

    v_farmer_id int;
    v_barangay_id int;
    v_field_id int;
    v_season_id int;
    v_activity_id int;
    v_collector_id uuid;
    v_collected_at timestamptz;
    v_monitoring_visit_id int;

    v_land_prep_start date;
    v_est_establish_date date;
begin
    v_row_count := jsonb_array_length(p_data);
    raise notice 'Input data contains % rows', v_row_count;

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
            location                        spatial.geometry,

            -- monitoring_visits (new columns)
            crop_stage                      text,
            soil_moisture_status            text,
            avg_plant_height                text      -- could be double precision, but read as text
        )
    loop
        begin
            -- parse dates & timestamptz (null if invalid)
            v_land_prep_start   := public.parse_date(v_row.land_preparation_start_date);
            v_est_establish_date := public.parse_date(v_row.est_crop_establishment_date);
            v_collected_at := public.parse_timestamptz(v_row.collected_at);

            -- resolve collector id
            v_collector_id := public.find_or_create_collector_id(v_row.collected_by);

            -- farmer
            v_farmer_id := public.find_or_create_farmer(
              v_row.first_name,
              v_row.last_name,
              v_row.gender,
              v_row.date_of_birth,
              v_row.cellphone_no
            );

            -- barangay
            v_barangay_id := public.find_barangay_id(v_row.province, v_row.municity, v_row.barangay);

            -- field
            v_field_id := public.handle_mfid(
              v_row.mfid,
              v_farmer_id,
              v_barangay_id,
              v_row.location,
              p_auto_create_mfid
            );

            -- season
            v_season_id := public.find_season_id_by_date(v_row.collected_at);

            -- Insert monitoring visit if any of the fields are provided
            v_monitoring_visit_id := null;
            if (v_row.crop_stage is not null and v_row.crop_stage != '') or
               (v_row.soil_moisture_status is not null and v_row.soil_moisture_status != '') or
               (v_row.avg_plant_height is not null and v_row.avg_plant_height != '') then

                insert into public.monitoring_visits (
                    date_monitored,
                    crop_stage,
                    soil_moisture_status,
                    avg_plant_height
                ) values (
                    v_collected_at::date,   -- date_monitored = collected_at date
                    coalesce(v_row.crop_stage, ''),
                    coalesce(v_row.soil_moisture_status, ''),
                    nullif(v_row.avg_plant_height, '')::double precision
                )
                returning id into v_monitoring_visit_id;
            end if;

            -- field_activities (parent)
            insert into public.field_activities (
                field_id,
                season_id,
                activity_type,
                collected_by,
                collected_at,
                image_urls,
                verification_status,
                monitoring_visit_id
            ) values (
                v_field_id,
                v_season_id,
                'field-data',
                v_collector_id,
                v_collected_at,
                '[]'::jsonb,
                'unknown',
                v_monitoring_visit_id
            ) returning id into v_activity_id;

            -- field_plannings
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

            exception when others then v_errors := array_append(v_errors, format('Row with MFID %s: %s', v_row.mfid, SQLERRM));
        end;
    end loop;

    return jsonb_build_object( 'imported_count', v_imported, 'errors', v_errors);
end;
$$;