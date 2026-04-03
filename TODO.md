
listen for verification changes and update the mobile app also.


## todo

- approve / reject forms

- images from storage


- import
    - kung mag add sa mobile app sang farmer kag field to an imported data, it must be updated
    - check if row (form type, mfid, season) is already present, ignore make a warning

- user management flow (create, update)

- nutrient management table detail no fertilizer applications

## fix

- barangay trend chart minimum height + no data ui

- user management column filters on role and last sign in


## considerations

- import logging?

- use batches/disabling on imports
    - each form has a `batch_id` which is null by default
    - for every import, each row will be assigned with a batch_id
    - analytics queries always filter `is_active`

    ### maybe
        - add a staging area to the imported file

- create notification based on all the toasts that are shown

- drill down on stat cards


```{sql}

begin;

insert into mfids (id, mfid, used_at)
values (1, '600616016', now());

insert into farmers (id, first_name, last_name, gender, date_of_birth, cellphone_no)
values (1, 'Juan', 'Dela Cruz', 'male', '1985-04-12', '09171234567');

insert into fields (farmer_id, barangay_id, mfid_id, location)
values (1, 1, 1, spatial.st_geomfromtext('POINT(122.5621 10.7202)', 4326));

commit;


do $$
declare
    visit_id int;
    planning_id int;
begin

    insert into field_activities (field_id, season_id, activity_type, collected_by)
    values (6, 1, 'monitoring-visit', 'c6079662-4714-4b49-b36e-34a052f06b1b')
    returning id into visit_id;

    insert into monitoring_visits (id, date_monitored, crop_stage, soil_moisture_status, avg_plant_height)
    values (visit_id, '2025-05-15', 'tillering', 'moist', 45.5);

    insert into field_activities (field_id, season_id, activity_type, collected_by, monitoring_visit_id)
    values (6, 1, 'field-data', 'c6079662-4714-4b49-b36e-34a052f06b1b', visit_id)
    returning id into planning_id;

    insert into field_plannings (id, land_preparation_start_date, est_crop_establishment_date,
                                 est_crop_establishment_method, total_field_area_ha, current_field_condition)
    values (planning_id, '2025-05-01', '2025-06-01', 'direct seeding', 2.5, 'good');

    raise notice 'success: visit_id=%, planning_id=%', visit_id, planning_id;

END $$;

```
