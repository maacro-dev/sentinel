
DO $$
DECLARE
    visit_id INT;
    planning_id INT;
BEGIN
    -- Monitoring visit
    INSERT INTO field_activities (field_id, season_id, activity_type, collected_by)
    VALUES (6, 1, 'monitoring-visit', 'c6079662-4714-4b49-b36e-34a052f06b1b')
    RETURNING id INTO visit_id;

    INSERT INTO monitoring_visits (id, date_monitored, crop_stage, soil_moisture_status, avg_plant_height)
    VALUES (visit_id, '2025-05-15', 'tillering', 'moist', 45.5);

    INSERT INTO field_activities (field_id, season_id, activity_type, collected_by, monitoring_visit_id)
    VALUES (6, 1, 'field-data', 'c6079662-4714-4b49-b36e-34a052f06b1b', visit_id)
    RETURNING id INTO planning_id;

    INSERT INTO field_plannings (id, land_preparation_start_date, est_crop_establishment_date,
                                 est_crop_establishment_method, total_field_area_ha, current_field_condition)
    VALUES (planning_id, '2025-05-01', '2025-06-01', 'direct seeding', 2.5, 'good');

    RAISE NOTICE 'Success: visit_id=%, planning_id=%', visit_id, planning_id;
END $$;