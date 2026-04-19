create or replace function public.upload_field_data(data jsonb)
returns int
language plpgsql
as $$
declare
    v_farmer_id int;
    v_barangay_id int;
    v_mfid_id int;
    v_field_id int;
    v_parent_id int;
    v_monitoring_id int;

    v_payload jsonb := data->'payload';
begin

    insert into farmers (
        first_name,
        last_name,
        gender,
        date_of_birth,
        cellphone_no
    )
    values (
        v_payload->>'first_name',
        v_payload->>'last_name',
        (v_payload->>'gender')::gender,
        (v_payload->>'date_of_birth')::date,
        v_payload->>'cellphone_no'
    )
    on conflict (first_name, last_name)
    do update set first_name = excluded.first_name
    returning id into v_farmer_id;

    select id into v_barangay_id
    from barangays
    where name = v_payload->>'barangay'
    limit 1;


    insert into mfids (mfid, used_at)
    values (
        data->>'mfid',
        (data->>'synced_at')::timestamptz
    )
    on conflict (mfid)
    do update set used_at = excluded.used_at
    returning id into v_mfid_id;


    insert into fields (
        farmer_id,
        barangay_id,
        mfid_id,
        location
    )
    values (
        v_farmer_id,
        v_barangay_id,
        v_mfid_id,
        v_payload->>'location'
    )
    on conflict (mfid_id) do update set
        location = excluded.location,
        farmer_id = excluded.farmer_id,
        barangay_id = excluded.barangay_id
    returning id into v_field_id;

    v_monitoring_id := null;

    if v_payload->>'date_monitored' is not null then
        insert into monitoring_visits (
            date_monitored,
            crop_stage,
            soil_moisture_status,
            avg_plant_height
        )
        values (
            (v_payload->>'date_monitored')::date,
            coalesce(v_payload->>'crop_stage','unknown'),
            coalesce(v_payload->>'soil_moisture_status','unknown'),
            nullif(v_payload->>'avg_plant_height','')::double precision
        )
        returning id into v_monitoring_id;

        raise notice 'monitoring_id inserted: %', v_monitoring_id;
    end if;


    insert into field_activities (
        field_id,
        season_id,
        collection_task_id,
        activity_type,
        collected_by,
        collected_at,
        image_urls,
        synced_at,
        monitoring_visit_id
    )
    values (
        v_field_id,
        (data->>'season_id')::int,
        (data->>'collection_task_id')::int,
        (data->>'activity_type')::activity_type,
        (data->>'collected_by')::uuid,
        NULLIF(data->>'collected_at','null')::timestamptz,
        coalesce(data->'image_urls', '[]'::jsonb),
        NULLIF(data->>'synced_at','null')::timestamptz,
        v_monitoring_id
    )
    on conflict (collection_task_id)
    do update set
        image_urls = excluded.image_urls,
        synced_at = excluded.synced_at
    returning id into v_parent_id;


    insert into field_plannings (
        id,
        land_preparation_start_date,
        est_crop_establishment_date,
        est_crop_establishment_method,
        total_field_area_ha,
        soil_type,
        current_field_condition
    )
    values (
        v_parent_id,
        (v_payload->>'land_preparation_start_date')::date,
        (v_payload->>'est_crop_establishment_date')::date,
        v_payload->>'est_crop_establishment_method',
        (v_payload->>'total_field_area_ha')::double precision,
        v_payload->>'soil_type',
        v_payload->>'current_field_condition'
    )
    on conflict (id)
    do update set
        land_preparation_start_date = excluded.land_preparation_start_date,
        est_crop_establishment_date = excluded.est_crop_establishment_date,
        est_crop_establishment_method = excluded.est_crop_establishment_method,
        total_field_area_ha = excluded.total_field_area_ha,
        soil_type = excluded.soil_type,
        current_field_condition = excluded.current_field_condition;

    update collection_tasks
    set
        status = 'completed',
        updated_at = now()
    where
        mfid_id = v_mfid_id
        and season_id = (data->>'season_id')::int
        and activity_type = (data->>'activity_type')::activity_type
        and collector_id = (data->>'collected_by')::uuid
        and status = 'pending';

    update mfids
    set used_at = now()
    where id = v_mfid_id;

    return v_parent_id;

    EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error in upload_field_data: SQLSTATE=%, SQLERRM=%', SQLSTATE, SQLERRM;
    RAISE;
end;
$$;


create or replace function public.upload_cultural_management(data jsonb)
returns int
language plpgsql
as $$
declare
    v_mfid_id int;
    v_field_id int;
    v_parent_id int;
    v_monitoring_id int;
    v_payload jsonb := data->'payload';
begin

    select id into v_mfid_id
    from mfids
    where mfid = data->>'mfid'
    limit 1;
    if v_mfid_id is null then
        raise exception 'MFID not found: %', data->>'mfid';
    end if;


    select id into v_field_id
    from fields
    where mfid_id = v_mfid_id
    limit 1;
    if v_field_id is null then
        raise exception 'Field not found for MFID: %', data->>'mfid';
    end if;


    v_monitoring_id := null;
    if v_payload->>'date_monitored' is not null then
        insert into monitoring_visits (
            date_monitored,
            crop_stage,
            soil_moisture_status,
            avg_plant_height
        )
        values (
            (v_payload->>'date_monitored')::date,
            coalesce(v_payload->>'crop_stage','unknown'),
            coalesce(v_payload->>'soil_moisture_status','unknown'),
            nullif(v_payload->>'avg_plant_height','')::double precision
        )
        returning id into v_monitoring_id;
    end if;


    insert into field_activities (
        field_id,
        season_id,
        collection_task_id,
        activity_type,
        collected_by,
        collected_at,
        image_urls,
        synced_at,
        monitoring_visit_id
    )
    values (
        v_field_id,
        (data->>'season_id')::int,
        (data->>'collection_task_id')::int,
        (data->>'activity_type')::activity_type,
        (data->>'collected_by')::uuid,
        NULLIF(data->>'collected_at','null')::timestamptz,
        coalesce(data->'image_urls', '[]'::jsonb),
        NULLIF(data->>'synced_at','null')::timestamptz,
        v_monitoring_id
    )
    on conflict (collection_task_id)
    do update set
        image_urls = excluded.image_urls,
        synced_at = excluded.synced_at,
        monitoring_visit_id = excluded.monitoring_visit_id
    returning id into v_parent_id;


    insert into crop_establishments (
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
    )
    values (
        v_parent_id,
        coalesce(v_payload->>'ecosystem', ''),
        (v_payload->>'monitoring_field_area_sqm')::double precision,
        (v_payload->>'actual_crop_establishment_date')::date,
        v_payload->>'actual_crop_establishment_method',
        nullif(v_payload->>'sowing_date','')::date,
        nullif(v_payload->>'seedling_age_at_transplanting','')::smallint,
        nullif(v_payload->>'distance_between_plant_row_1','')::double precision,
        nullif(v_payload->>'distance_between_plant_row_2','')::double precision,
        nullif(v_payload->>'distance_between_plant_row_3','')::double precision,
        nullif(v_payload->>'distance_within_plant_row_1','')::double precision,
        nullif(v_payload->>'distance_within_plant_row_2','')::double precision,
        nullif(v_payload->>'distance_within_plant_row_3','')::double precision,
        nullif(v_payload->>'seeding_rate_kg_ha','')::double precision,
        v_payload->>'direct_seeding_method',
        nullif(v_payload->>'num_plants_1','')::smallint,
        nullif(v_payload->>'num_plants_2','')::smallint,
        nullif(v_payload->>'num_plants_3','')::smallint,
        v_payload->>'rice_variety',
        v_payload->>'rice_variety_no',
        (v_payload->>'rice_variety_maturity_duration')::smallint,
        v_payload->>'seed_class'
    )
    on conflict (id)
    do update set
        ecosystem = excluded.ecosystem,
        monitoring_field_area_sqm = excluded.monitoring_field_area_sqm,
        actual_crop_establishment_date = excluded.actual_crop_establishment_date,
        actual_crop_establishment_method = excluded.actual_crop_establishment_method,
        sowing_date = excluded.sowing_date,
        seedling_age_at_transplanting = excluded.seedling_age_at_transplanting,
        distance_between_plant_row_1 = excluded.distance_between_plant_row_1,
        distance_between_plant_row_2 = excluded.distance_between_plant_row_2,
        distance_between_plant_row_3 = excluded.distance_between_plant_row_3,
        distance_within_plant_row_1 = excluded.distance_within_plant_row_1,
        distance_within_plant_row_2 = excluded.distance_within_plant_row_2,
        distance_within_plant_row_3 = excluded.distance_within_plant_row_3,
        seeding_rate_kg_ha = excluded.seeding_rate_kg_ha,
        direct_seeding_method = excluded.direct_seeding_method,
        num_plants_1 = excluded.num_plants_1,
        num_plants_2 = excluded.num_plants_2,
        num_plants_3 = excluded.num_plants_3,
        rice_variety = excluded.rice_variety,
        rice_variety_no = excluded.rice_variety_no,
        rice_variety_maturity_duration = excluded.rice_variety_maturity_duration,
        seed_class = excluded.seed_class;


    update collection_tasks
    set
        status = 'completed',
        updated_at = now()
    where
        mfid_id = v_mfid_id
        and season_id = (data->>'season_id')::int
        and activity_type = (data->>'activity_type')::activity_type
        and collector_id = (data->>'collected_by')::uuid
        and status = 'pending';

    update mfids
    set used_at = now()
    where id = v_mfid_id;

    return v_parent_id;
end;
$$;


create or replace function public.upload_nutrient_management(data jsonb)
returns int
language plpgsql
as $$
declare
    v_mfid_id int;
    v_field_id int;
    v_parent_id int;
    v_monitoring_id int;
    v_rec_id int;
    v_payload jsonb := data->'payload';
    v_fertilizer_apps jsonb := v_payload->'applications';
    v_app jsonb;
begin

    select id into v_mfid_id
    from mfids
    where mfid = data->>'mfid'
    limit 1;
    if v_mfid_id is null then
        raise exception 'MFID not found: %', data->>'mfid';
    end if;

    select id into v_field_id
    from fields
    where mfid_id = v_mfid_id
    limit 1;
    if v_field_id is null then
        raise exception 'Field not found for MFID: %', data->>'mfid';
    end if;

    v_monitoring_id := null;
    if v_payload->>'date_monitored' is not null then
        insert into monitoring_visits (
            date_monitored,
            crop_stage,
            soil_moisture_status,
            avg_plant_height
        )
        values (
            (v_payload->>'date_monitored')::date,
            coalesce(v_payload->>'crop_stage','unknown'),
            coalesce(v_payload->>'soil_moisture_status','unknown'),
            nullif(v_payload->>'avg_plant_height','')::double precision
        )
        returning id into v_monitoring_id;
    end if;

    insert into field_activities (
        field_id,
        season_id,
        collection_task_id,
        activity_type,
        collected_by,
        collected_at,
        image_urls,
        synced_at,
        monitoring_visit_id
    )
    values (
        v_field_id,
        (data->>'season_id')::int,
        (data->>'collection_task_id')::int,
        (data->>'activity_type')::activity_type,
        (data->>'collected_by')::uuid,
        NULLIF(data->>'collected_at','null')::timestamptz,
        coalesce(data->'image_urls', '[]'::jsonb),
        NULLIF(data->>'synced_at','null')::timestamptz,
        v_monitoring_id
    )
    on conflict (collection_task_id)
    do update set
        image_urls = excluded.image_urls,
        synced_at = excluded.synced_at,
        monitoring_visit_id = excluded.monitoring_visit_id
    returning id into v_parent_id;

    insert into fertilization_records (
        id,
        applied_area_sqm
    )
    values (
        v_parent_id,
        (v_payload->>'applied_area_sqm')::double precision
    )
    on conflict (id)
    do update set
        applied_area_sqm = excluded.applied_area_sqm
    returning id into v_rec_id;

    if v_fertilizer_apps is not null then
        for v_app in select * from jsonb_array_elements(v_fertilizer_apps) as t(app)
        where (t.app->>'fertilizer_type') is not null
        loop
            insert into fertilizer_applications (
                fertilization_record_id,
                fertilizer_type,
                brand,
                nitrogen_content_pct,
                phosphorus_content_pct,
                potassium_content_pct,
                amount_applied,
                amount_unit,
                crop_stage_on_application
            )
            values (
                v_rec_id,
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
    end if;

    update collection_tasks
    set
        status = 'completed',
        updated_at = now()
    where
        mfid_id = v_mfid_id
        and season_id = (data->>'season_id')::int
        and activity_type = (data->>'activity_type')::activity_type
        and collector_id = (data->>'collected_by')::uuid
        and status = 'pending';

    update mfids
    set used_at = now()
    where id = v_mfid_id;

    return v_parent_id;
end;
$$;


create or replace function public.upload_production(data jsonb)
returns int
language plpgsql
as $$
declare
    v_mfid_id int;
    v_field_id int;
    v_parent_id int;
    v_monitoring_id int;
    v_payload jsonb := data->'payload';
begin
    select id into v_mfid_id
    from mfids
    where mfid = data->>'mfid'
    limit 1;
    if v_mfid_id is null then
        raise exception 'MFID not found: %', data->>'mfid';
    end if;

    select id into v_field_id
    from fields
    where mfid_id = v_mfid_id
    limit 1;
    if v_field_id is null then
        raise exception 'Field not found for MFID: %', data->>'mfid';
    end if;

    v_monitoring_id := null;
    if v_payload->>'date_monitored' is not null then
        insert into monitoring_visits (
            date_monitored,
            crop_stage,
            soil_moisture_status,
            avg_plant_height
        )
        values (
            (v_payload->>'date_monitored')::date,
            coalesce(v_payload->>'crop_stage','unknown'),
            coalesce(v_payload->>'soil_moisture_status','unknown'),
            nullif(v_payload->>'avg_plant_height','')::double precision
        )
        returning id into v_monitoring_id;
    end if;

    insert into field_activities (
        field_id,
        season_id,
        collection_task_id,
        activity_type,
        collected_by,
        collected_at,
        image_urls,
        synced_at,
        monitoring_visit_id
    )
    values (
        v_field_id,
        (data->>'season_id')::int,
        (data->>'collection_task_id')::int,
        (data->>'activity_type')::activity_type,
        (data->>'collected_by')::uuid,
        NULLIF(data->>'collected_at','null')::timestamptz,
        coalesce(data->'image_urls', '[]'::jsonb),
        NULLIF(data->>'synced_at','null')::timestamptz,
        v_monitoring_id
    )
    on conflict (collection_task_id)
    do update set
        image_urls = excluded.image_urls,
        synced_at = excluded.synced_at,
        monitoring_visit_id = excluded.monitoring_visit_id
    returning id into v_parent_id;

    insert into harvest_records (
        id,
        harvest_date,
        harvesting_method,
        bags_harvested,
        avg_bag_weight_kg,
        area_harvested_ha,
        irrigation_supply
    )
    values (
        v_parent_id,
        (v_payload->>'harvest_date')::date,
        (v_payload->>'harvesting_method')::harvesting_method,
        (v_payload->>'bags_harvested')::int,
        (v_payload->>'avg_bag_weight_kg')::double precision,
        (v_payload->>'area_harvested_ha')::double precision,
        (v_payload->>'irrigation_supply')::irrigation_supply
    )
    on conflict (id)
    do update set
        harvest_date = excluded.harvest_date,
        harvesting_method = excluded.harvesting_method,
        bags_harvested = excluded.bags_harvested,
        avg_bag_weight_kg = excluded.avg_bag_weight_kg,
        area_harvested_ha = excluded.area_harvested_ha,
        irrigation_supply = excluded.irrigation_supply;

    update collection_tasks
    set
        status = 'completed',
        updated_at = now()
    where
        mfid_id = v_mfid_id
        and season_id = (data->>'season_id')::int
        and activity_type = (data->>'activity_type')::activity_type
        and collector_id = (data->>'collected_by')::uuid
        and status = 'pending';

    update mfids
    set used_at = now()
    where id = v_mfid_id;

    return v_parent_id;
end;
$$;

create or replace function public.upload_damage_assessment(data jsonb)
returns int
language plpgsql
as $$
declare
    v_mfid_id int;
    v_field_id int;
    v_parent_id int;
    v_payload jsonb := data->'payload';
begin
    select id into v_mfid_id
    from mfids
    where mfid = data->>'mfid'
    limit 1;
    if v_mfid_id is null then
        raise exception 'MFID not found: %', data->>'mfid';
    end if;

    select id into v_field_id
    from fields
    where mfid_id = v_mfid_id
    limit 1;
    if v_field_id is null then
        raise exception 'Field not found for MFID: %', data->>'mfid';
    end if;

    insert into field_activities (
        field_id,
        season_id,
        collection_task_id,
        activity_type,
        collected_by,
        collected_at,
        image_urls,
        synced_at
    )
    values (
        v_field_id,
        (data->>'season_id')::int,
        (data->>'collection_task_id')::int,
        (data->>'activity_type')::activity_type,
        (data->>'collected_by')::uuid,
        NULLIF(data->>'collected_at','null')::timestamptz,
        coalesce(data->'image_urls', '[]'::jsonb),
        NULLIF(data->>'synced_at','null')::timestamptz
    )
    on conflict (collection_task_id)
    do update set
        image_urls = excluded.image_urls,
        synced_at = excluded.synced_at
    returning id into v_parent_id;

    insert into damage_assessments (
        id,
        cause,
        crop_stage,
        soil_type,
        severity,
        affected_area_ha,
        observed_pest
    )
    values (
        v_parent_id,
        v_payload->>'cause',
        v_payload->>'crop_stage',
        v_payload->>'soil_type',
        v_payload->>'severity',
        (v_payload->>'affected_area_ha')::double precision,
        NULLIF(v_payload->>'observed_pest', '')
    )
    on conflict (id)
    do update set
        cause = excluded.cause,
        crop_stage = excluded.crop_stage,
        soil_type = excluded.soil_type,
        severity = excluded.severity,
        affected_area_ha = excluded.affected_area_ha,
        observed_pest = excluded.observed_pest;

    update collection_tasks
    set
        status = 'completed',
        updated_at = now()
    where
        mfid_id = v_mfid_id
        and season_id = (data->>'season_id')::int
        and activity_type = (data->>'activity_type')::activity_type
        and collector_id = (data->>'collected_by')::uuid
        and status = 'pending';


    update mfids
    set used_at = now()
    where id = v_mfid_id;

    return v_parent_id;
end;
$$;


create or replace function public.upload_form_data(data jsonb)
returns int
language plpgsql
security definer
as $$
declare
    v_activity_type text;
    v_result int;
    v_mfid text;
    v_season_label text;
    v_collector_name text;
    v_user_id uuid;
    v_field_id int;
    v_season_id int;
    v_collected_by uuid;
begin
    v_activity_type := data->>'activity_type';

    case v_activity_type
        when 'field-data' then
            v_result := public.upload_field_data(data);
        when 'cultural-management' then
            v_result := public.upload_cultural_management(data);
        when 'nutrient-management' then
            v_result := public.upload_nutrient_management(data);
        when 'production' then
            v_result := public.upload_production(data);
        when 'damage-assessment' then
            v_result := public.upload_damage_assessment(data);
        else
            raise exception 'Unsupported activity_type: %', v_activity_type;
    end case;

    begin
        v_user_id := nullif(current_setting('app.current_user_id', true), '')::uuid;
        if v_user_id is null then
            v_user_id := auth.uid();
        end if;
    exception when others then
        v_user_id := auth.uid();
    end;

    v_field_id := (data->>'field_id')::int;
    v_season_id := (data->>'season_id')::int;
    v_collected_by := (data->>'collected_by')::uuid;
    v_mfid := data->>'mfid';

    select semester::text || ' ' || season_year
    into v_season_label
    from public.seasons
    where id = v_season_id;

    select coalesce(raw_user_meta_data->>'full_name', email)
    into v_collector_name
    from auth.users
    where id = v_collected_by;

    insert into public.activity_logs (
        occurred_at,
        user_id,
        event_type,
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        details
    ) values (
        now(),
        v_user_id,
        'form_data_collected',
        v_activity_type,
        v_result::text,
        'insert',
        null,
        jsonb_build_object('id', v_result, 'activity_type', v_activity_type),
        jsonb_build_object(
            'mfid', v_mfid,
            'season', v_season_label,
            'collector_name', v_collector_name,
            'submitted_at', data->>'collected_at'
        )
    );

    return v_result;
exception
    when others then
        raise exception 'upload_form_data failed: %', sqlerrm;
end;
$$;
