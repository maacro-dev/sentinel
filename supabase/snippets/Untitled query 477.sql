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

    -- =========================
    -- 1. Farmer
    -- =========================
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

    -- =========================
    -- 2. Barangay
    -- =========================
    select id into v_barangay_id
    from barangays
    where name = v_payload->>'barangay'
    limit 1;

    -- =========================
    -- 3. MFID
    -- =========================
    insert into mfids (mfid, used_at)
    values (
        data->>'mfid',
        (data->>'synced_at')::timestamptz
    )
    on conflict (mfid)
    do update set used_at = excluded.used_at
    returning id into v_mfid_id;

    -- =========================
    -- 4. Field
    -- =========================
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
    on conflict (mfid_id)
    do update set location = excluded.location
    returning id into v_field_id;

    -- =========================
    -- 5. Monitoring Visit FIRST
    -- =========================
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

    -- =========================
    -- 6. Field Activity (parent)
    -- =========================
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
        data->>'collection_task_id',
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

    -- =========================
    -- 7. Field Planning
    -- =========================
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

    return v_parent_id;
end;
$$;