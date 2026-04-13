




metadata 1 (field_data)
    - province
    - municity
    - barangay
    - land_preparation_start_date
    - est_crop_establishment_date
    - est_crop_establishment_method
    - total_field_area_ha
    <!-- - soil_problem -->
    - soil_type
    - current_field_condition
    - crop_planted
    - crop_status


metadata 2 (cultural management)
    - ecosystem
    - actual_crop_establishment_date
    - actual_crop_establishment_method # direct-seeded or transplanted
    - monitoring_field_area_sqm
    - rice_variety
    - rice_variety_no
    - rice_variety_maturity_duration
    - seed_class
    - source_of_irrigation

    # transplanted fields (automatically N/A if method is direct-seeded)
    - sowing_date
    - seedling_age_at_transplanting
    - distance_between_plant_row_1
    - distance_between_plant_row_2
    - distance_between_plant_row_3
    - distance_within_plant_row_1
    - distance_within_plant_row_2
    - distance_within_plant_row_3

    # direct-seeded fields (automatically N/A if method is transplanted)
    - seeding_rate_kg_ha
    - direct_seeding_method
    - num_plants_1
    - num_plants_2
    - num_plants_3

metadata 3 (nutrient management)
    - applied_area_sqm

    # These are the fertilizer_application fields
    # These fields are repeatable. This metadata must have a minimum of 1 set
    # If suffix `_2` or `_3` set is all N/A or empty, then it must have only 1 application of fertilizer
    #
    # - brand,
    # - nitrogen_content_pct,
    # - phosphorus_content_pct,
    # - potassium_content_pct,
    # - amount_applied,
    # - amount_unit,
    # - crop_stage_on_application,
    # - fertilizer_type

    - brand_1
    - nitrogen_content_pct_1
    - phosphorus_content_pct_1
    - potassium_content_pct_1
    - amount_applied_1
    - amount_unit_1
    - crop_stage_on_application_1
    - fertilizer_type_1

    - brand_2
    - nitrogen_content_pct_2
    - phosphorus_content_pct_2
    - potassium_content_pct_2
    - amount_applied_2
    - amount_unit_2
    - crop_stage_on_application_2
    - fertilizer_type_2

    - brand_3
    - nitrogen_content_pct_3
    - phosphorus_content_pct_3
    - potassium_content_pct_3
    - amount_applied_3
    - amount_unit_3
    - crop_stage_on_application_3
    - fertilizer_type_3


metadata 4 (production)
    - harvest_date
    - harvesting_method
    - avg_bag_weight_kg
    - bags_harvested
    - irrigation_supply
    - area_harvested_ha

metadata 6 (damage_assessments) # this metadata is optional, full N/A must mean no damage
    - cause
    - crop_stage
    - m6_soil_type
    - severity
    - affected_area_ha
    - observed_pest


take note that metadata 1 to 4 is sequentially taken in a span of few months. meaning, metadata 1 could be taken,
then metadata 2 would be a month after metadata 1 then metadata 3 could be just a visit and metadata 4 would be on harvesting


whole csv dataset columns:
                              column           dtype
0                           province             str
1                           municity             str
2                           barangay             str
3        land_preparation_start_date  datetime64[us]
4        est_crop_establishment_date  datetime64[us]
5      est_crop_establishment_method             str
6                total_field_area_ha         float64
7                       soil_problem             str
8                          soil_type             str
9            current_field_condition             str
10                      crop_planted             str
11                       crop_status             str
12    actual_crop_establishment_date  datetime64[us]
13  actual_crop_establishment_method             str
14                       sowing_date  datetime64[us]
15     seedling_age_at_transplanting         float64
16      distance_between_plant_row_1         float64
17      distance_between_plant_row_2         float64
18      distance_between_plant_row_3         float64
19       distance_within_plant_row_1         float64
20       distance_within_plant_row_2         float64
21       distance_within_plant_row_3         float64
22                seeding_rate_kg_ha             str
23             direct_seeding_method             str
24                      num_plants_1         float64
25                      num_plants_2         float64
26                      num_plants_3         float64
27          average_number_of_plants         float64
28         monitoring_field_area_sqm             str
29                      rice_variety             str
30                   rice_variety_no         float64
31    rice_variety_maturity_duration             str
32                        seed_class             str
33              source_of_good_seeds             str
34                         ecosystem             str
35              source_of_irrigation             str
36                type_of_irrigation             str
37                  applied_area_sqm         float64
38                           brand_1             str
39            nitrogen_content_pct_1         float64
40          phosphorus_content_pct_1         float64
41           potassium_content_pct_1         float64
42                  amount_applied_1         float64
43                     amount_unit_1             str
44       crop_stage_on_application_1             str
45                 fertilizer_type_1             str
46                           brand_2             str
47            nitrogen_content_pct_2         float64
48          phosphorus_content_pct_2         float64
49           potassium_content_pct_2         float64
50                  amount_applied_2         float64
51                     amount_unit_2             str
52       crop_stage_on_application_2             str
53                 fertilizer_type_2             str
54                           brand_3             str
55            nitrogen_content_pct_3         float64
56          phosphorus_content_pct_3         float64
57           potassium_content_pct_3         float64
58                  amount_applied_3         float64
59                     amount_unit_3             str
60       crop_stage_on_application_3             str
61                 fertilizer_type_3             str
62                      harvest_date  datetime64[us]
63                 harvesting_method             str
64                 avg_bag_weight_kg         float64
65                    bags_harvested             str
66                 irrigation_supply             str
67                 area_harvested_ha         float64
68                             cause             str
69                        crop_stage             str
70                      m6_soil_type             str
71                          severity             str
72                  affected_area_ha         float64
73                     observed_pest             str





123456 -
    season 1 metadata 1
    season 1 metadata 2
    season 2 metadata 1
    season 2 metadata e

123456 - merged metadata -> model -> prediction







isNotValid = monitoring field area (sqm) > total field area (ha)

if (isNotValid)
    set it as 80% to 90% of its total field area


isNotValid = area_harvested (ha) > monitoring field area (sqm)

if (isNotValid)
    set it as 70% to 90%



---


1. + optional
metadata 1

2. + optional
metadata 1
metadata 2

3. + optional
metadata 1
metadata 2
metadata 3

4. + optional
previous season metadata 1-4
metadata 1












































