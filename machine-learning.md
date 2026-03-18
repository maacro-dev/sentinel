these are all columns in the csv training dataset, data structure in database could be different (e.g. gps_lat & gps_long could be just one field in a table)

common fields among all datasets:

- province
- municity
- barangay
- mfid
- first_name
- last_name
- collected_at
- collected_by

dataset #1 (farmer & field profile)

- date_of_birth
- gender
- cellphone_no
- land_preparation_start_date
- est_crop_establishment_date
- est_crop_establishment_method
- total_field_area_ha
- soil_problem
- soil_type
- current_field_condition
- crop_planted
- crop_status
- gps_latitude
- gps_longitude

dataset #2 (cultural management)

- actual_crop_establishment_date
- actual_crop_establishment_method
- sowing_date
- seedling_age_at_transplanting
- distance_between_plant_row_1
- distance_between_plant_row_2
- distance_between_plant_row_3
- distance_within_plant_row_1
- distance_within_plant_row_2
- distance_within_plant_row_3
- seeding_rate_kg_ha
- direct_seeding_method
- num_plants_1
- num_plants_2
- num_plants_3
- average_number_of_plants
- monitoring_field_area_sqm
- rice_variety
- rice_variety_no
- rice_variety_maturity_duration
- seed_class
- source_of_good_seeds
- ecosystem
- source_of_irrigation
- type_of_irrigation

dataset #3 (nutrient management) -- the suffixed fields are repeatable groups, minimum 1

-  applied_area_sqm
-  brand_1
-  nitrogen_content_pct_1
-  phosphorus_content_pct_1
-  potassium_content_pct_1
-  amount_applied_1
-  amount_unit_1
-  crop_stage_on_application_1
-  fertilizer_type_1
-  brand_2
-  nitrogen_content_pct_2
-  phosphorus_content_pct_2
-  potassium_content_pct_2
-  amount_applied_2
-  amount_unit_2
-  crop_stage_on_application_2
-  fertilizer_type_2
-  brand_3
-  nitrogen_content_pct_3
-  phosphorus_content_pct_3
-  potassium_content_pct_3
-  amount_applied_3
-  amount_unit_3
-  crop_stage_on_application_3
-  fertilizer_type_3

dataset #4 (production)

- harvest_date
- harvesting_method
- avg_bag_weight_kg
- bags_harvested
- irrigation_supply
- area_harvested_ha
- production_t

dataset #6 (damage assessments)

- cause
- crop_stage
- soil_type
- severity
- affected_area_ha
- observed_pest
