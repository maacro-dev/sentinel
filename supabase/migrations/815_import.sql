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

create or replace function public.import_crop_establishments(
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

    -- crop establishment specific dates
    v_actual_date date;
    v_sowing_date date;
begin
    for v_row in
        select * from jsonb_to_recordset(p_data) as x(
            -- field_activities base
            province                        text,
            municity                        text,
            barangay                        text,
            mfid                            text,
            first_name                      text,
            last_name                       text,
            collected_by                    jsonb,
            collected_at                    text,

            -- farmer extra (optional)
            gender                          text,
            date_of_birth                   text,
            cellphone_no                    text,

            -- crop_establishments specific
            ecosystem                       text,
            monitoring_field_area_sqm       double precision,
            actual_crop_establishment_date  text,
            actual_crop_establishment_method text,
            sowing_date                     text,
            seedling_age_at_transplanting   int,
            distance_between_plant_row_1    double precision,
            distance_between_plant_row_2    double precision,
            distance_between_plant_row_3    double precision,
            distance_within_plant_row_1     double precision,
            distance_within_plant_row_2     double precision,
            distance_within_plant_row_3     double precision,
            seeding_rate_kg_ha              double precision,
            direct_seeding_method           text,
            num_plants_1                     int,
            num_plants_2                     int,
            num_plants_3                     int,
            rice_variety                     text,
            rice_variety_no                  text,
            rice_variety_maturity_duration   int,
            seed_class                       text,
            location                         spatial.geometry
        )
    loop
        begin
            -- parse dates & timestamptz
            v_actual_date := public.parse_date(v_row.actual_crop_establishment_date);
            v_sowing_date := public.parse_date(v_row.sowing_date);
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

            -- season derived from collected_at
            v_season_id := public.find_season_id_by_date(v_row.collected_at);

            -- field_activities
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
                'cultural-management',
                v_collector_id,
                v_collected_at,
                '[]'::jsonb,
                'unknown'
            ) returning id into v_activity_id;

            -- crop_establishments (actual_land_preparation_method removed)
            insert into public.crop_establishments (
                id,
                ecosystem,
                monitoring_field_area_sqm,
                actual_crop_establishment_date,
                actual_crop_establishment_method,
                sowing_date,
                seedling_age_at_transplanting,
                distance_between_plant_row_1,
                distance_between_plant_row_2,
                distance_between_plant_row_3,
                distance_within_plant_row_1,
                distance_within_plant_row_2,
                distance_within_plant_row_3,
                seeding_rate_kg_ha,
                direct_seeding_method,
                num_plants_1,
                num_plants_2,
                num_plants_3,
                rice_variety,
                rice_variety_no,
                rice_variety_maturity_duration,
                seed_class
            ) values (
                v_activity_id,
                v_row.ecosystem,
                v_row.monitoring_field_area_sqm,
                v_actual_date,
                v_row.actual_crop_establishment_method,
                v_sowing_date,
                v_row.seedling_age_at_transplanting,
                v_row.distance_between_plant_row_1,
                v_row.distance_between_plant_row_2,
                v_row.distance_between_plant_row_3,
                v_row.distance_within_plant_row_1,
                v_row.distance_within_plant_row_2,
                v_row.distance_within_plant_row_3,
                v_row.seeding_rate_kg_ha,
                v_row.direct_seeding_method,
                v_row.num_plants_1,
                v_row.num_plants_2,
                v_row.num_plants_3,
                v_row.rice_variety,
                v_row.rice_variety_no,
                v_row.rice_variety_maturity_duration,
                v_row.seed_class
            );

            v_imported := v_imported + 1;

        exception when others then
            v_errors := array_append(v_errors, format('Row with MFID %s: %s', v_row.mfid, SQLERRM));
        end;
    end loop;

    return jsonb_build_object('imported_count', v_imported, 'errors', v_errors);
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

create or replace function public.import_damage_assessments(
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

    -- damage assessment specific fields
    v_affected_area_ha double precision;
begin
    for v_row in
        select * from jsonb_to_recordset(p_data) as x(
            -- field_activities base
            province                        text,
            municity                        text,
            barangay                        text,
            mfid                            text,
            first_name                      text,
            last_name                       text,
            collected_by                    jsonb,
            collected_at                    text,

            -- farmer extra (optional)
            gender                          text,
            date_of_birth                   text,
            cellphone_no                    text,

            -- damage_assessments specific
            cause                           text,
            crop_stage                      text,
            soil_type                        text,
            severity                         text,
            affected_area_ha                 double precision,
            observed_pest                    text,
            location                         spatial.geometry  -- optional
        )
    loop
        begin
            -- parse timestamptz
            v_collected_at := public.parse_timestamptz(v_row.collected_at);
            v_affected_area_ha := v_row.affected_area_ha;

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

            -- field (with optional location)
            v_field_id := public.handle_mfid(
                v_row.mfid,
                v_farmer_id,
                v_barangay_id,
                v_row.location,
                p_auto_create_mfid
            );

            -- season derived from collected_at
            v_season_id := public.find_season_id_by_date(v_row.collected_at);

            -- field_activities
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
                'damage-assessment',
                v_collector_id,
                v_collected_at,
                '[]'::jsonb,
                'unknown'
            ) returning id into v_activity_id;

            -- damage_assessments
            insert into public.damage_assessments (
                id,
                cause,
                crop_stage,
                soil_type,
                severity,
                affected_area_ha,
                observed_pest
            ) values (
                v_activity_id,
                v_row.cause,
                v_row.crop_stage,
                v_row.soil_type,
                v_row.severity,
                v_affected_area_ha,
                nullif(v_row.observed_pest, '')  -- treat empty string as null
            );

            v_imported := v_imported + 1;

        exception when others then
            v_errors := array_append(v_errors, format('Row with MFID %s: %s', v_row.mfid, SQLERRM));
        end;
    end loop;

    return jsonb_build_object('imported_count', v_imported, 'errors', v_errors);
end;
$$;

create or replace function public.import_fertilization_records(
    p_data jsonb,
    p_auto_create_mfid boolean default true
)
    returns jsonb
    language plpgsql
as $$
declare
    v_imported int := 0;
    v_errors text[] := '{}';

    v_row jsonb;
    v_app jsonb;

    v_farmer_id int;
    v_barangay_id int;
    v_field_id int;
    v_season_id int;
    v_activity_id int;
    v_collector_id uuid;
    v_collected_at timestamptz;

    v_applied_area_sqm double precision;
begin
    for v_row in select jsonb_array_elements(p_data) loop
        begin
            -- extract base fields
            v_collected_at := public.parse_timestamptz(v_row->>'collected_at');
            v_applied_area_sqm := (v_row->>'applied_area_sqm')::double precision;

            -- collector
            v_collector_id := public.find_or_create_collector_id(v_row->'collected_by');

            -- farmer
            v_farmer_id := public.find_or_create_farmer(
                v_row->>'first_name',
                v_row->>'last_name',
                v_row->>'gender',      -- may be null
                v_row->>'date_of_birth',
                v_row->>'cellphone_no'
            );

            -- barangay
            v_barangay_id := public.find_barangay_id(
                v_row->>'province',
                v_row->>'municity',
                v_row->>'barangay'
            );

            -- field
            v_field_id := public.handle_mfid(
                v_row->>'mfid',
                v_farmer_id,
                v_barangay_id,
                null,  -- location not used here
                p_auto_create_mfid
            );

            -- season
            v_season_id := public.find_season_id_by_date(v_row->>'collected_at');

            -- field_activities
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
                'nutrient-management',
                v_collector_id,
                v_collected_at,
                '[]'::jsonb,
                'unknown'
            ) returning id into v_activity_id;

            -- fertilization_records
            insert into public.fertilization_records (
                id,
                applied_area_sqm
            ) values (
                v_activity_id,
                v_applied_area_sqm
            );

            -- loop through applications
            for v_app in select jsonb_array_elements(v_row->'fertilizer_applications') loop
                insert into public.fertilizer_applications (
                    fertilization_record_id,
                    fertilizer_type,
                    brand,
                    nitrogen_content_pct,
                    phosphorus_content_pct,
                    potassium_content_pct,
                    amount_applied,
                    amount_unit,
                    crop_stage_on_application
                ) values (
                    v_activity_id,
                    v_app->>'fertilizer_type',
                    v_app->>'brand',
                    (v_app->>'nitrogen_content_pct')::double precision,
                    (v_app->>'phosphorus_content_pct')::double precision,
                    (v_app->>'potassium_content_pct')::double precision,
                    (v_app->>'amount_applied')::double precision,
                    v_app->>'amount_unit',
                    v_app->>'crop_stage_on_application'
                );
            end loop;

            v_imported := v_imported + 1;

        exception when others then
            v_errors := array_append(v_errors, format('Row with MFID %s: %s', v_row->>'mfid', SQLERRM));
        end;
    end loop;

    return jsonb_build_object('imported_count', v_imported, 'errors', v_errors);
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
as $$
declare
    v_result jsonb;
    v_imported_count int;
begin
    perform set_config('app.import_mode', 'true', true);

    case p_dataset_type
        when 'field_plannings' then
            v_result := public.import_field_plannings(p_data, p_auto_create_mfid);
        when 'harvest_records' then
            v_result := public.import_harvest_records(p_data, p_auto_create_mfid);
        when 'crop_establishments' then
            v_result := public.import_crop_establishments(p_data, p_auto_create_mfid);
        when 'damage_assessments' then
            v_result := public.import_damage_assessments(p_data, p_auto_create_mfid);
        when 'fertilization_records' then
            v_result := public.import_fertilization_records(p_data, p_auto_create_mfid);
        else
            raise exception 'Unsupported dataset type: %', p_dataset_type;
    end case;

    v_imported_count := (v_result->>'imported_count')::int;

    if v_imported_count > 0 then
        insert into public.notifications (target_role, title, message, type, related_entity_id)
        values (
            'data_manager',
            'Data Import Completed',
            format('Successfully imported %s %s record(s).', v_imported_count, p_dataset_type),
            'import_completed',
            null
        );
    end if;

    perform set_config('app.import_mode', 'false', true);

    return v_result;

exception when others then
    perform set_config('app.import_mode', 'false', true);
    raise;
end;
$$;
