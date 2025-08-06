
-- public.users + auth.users
CREATE OR REPLACE VIEW user_details AS
SELECT
  usr.*,
  auth_user.email,
  auth_user.last_sign_in_at
FROM users usr
JOIN auth.users auth_user ON usr.id = auth_user.id;

CREATE OR REPLACE VIEW current_season AS
SELECT * FROM seasons
WHERE now() BETWEEN start_date AND end_date;


CREATE OR REPLACE VIEW addresses AS
SELECT
  b.id AS barangay_id,
  b.name AS barangay,
  cm.id AS city_municipality_id,
  cm.name AS city_municipality,
  p.id AS province_id,
  p.name AS province
FROM barangays b
JOIN cities_municipalities cm ON b.city_municipality_id = cm.id
JOIN provinces p ON cm.province_id = p.id;


CREATE OR REPLACE VIEW field_details AS
SELECT
  fd.id             AS field_id,
  fd.mfid           AS mfid,
  f.first_name      AS farmer_first_name,
  f.last_name       AS farmer_last_name,
  b.name            AS barangay,
  cm.name           AS municipality,
  p.name            AS province,
  fd.created_at     AS created_at,
  fd.updated_at     AS updated_at
FROM fields fd
JOIN farmers f ON f.id = fd.farmer_id
JOIN barangays b ON b.id = fd.barangay_id
JOIN cities_municipalities cm ON cm.id = b.city_municipality_id
JOIN provinces p ON p.id = cm.province_id;

CREATE OR REPLACE VIEW field_data_details AS
SELECT
  fields.mfid                         AS mfid, -- text
  cs.season_year                      AS year, -- text
  cs.semester                         AS semester, -- text
  CONCAT(farmers.first_name, ' ', farmers.last_name) AS farmer_name, -- text
  addresses.barangay                  AS barangay, -- text
  addresses.city_municipality         AS municipality, -- text
  addresses.province                  AS province, -- text
  fa.verification_status              AS verification_status, -- enum["pending", "approved", "rejected"]
  fa.collected_by                     AS collected_by, -- text
  fa.collected_at                     AS collected_at, -- timestamptz
  fa.verified_at                      AS verified_at, -- timestamptz
  fa.synced_at                        AS synced_at, -- timestamptz
  fp.land_preparation_start_date      AS land_preparation_start_date, -- date
  fp.est_crop_establishment_date      AS est_crop_establishment_date, -- date
  fp.est_crop_establishment_method    AS est_crop_establishment_method, -- text
  fp.total_field_area_ha              AS total_field_area_ha, -- double precision
  fp.ecosystem                        AS ecosystem, -- text
  fp.soil_type                        AS soil_type, -- text
  fp.current_field_condition          AS current_field_condition, -- text
  fp.crop_planted                     AS crop_planted, -- text
  fp.crop_status                      AS crop_status -- text
FROM field_activities fa
JOIN field_plannings fp ON fa.id = fp.id
JOIN fields ON fa.field_id = fields.id
JOIN farmers ON fields.farmer_id = farmers.id
JOIN addresses ON fields.barangay_id = addresses.barangay_id
JOIN current_season cs ON cs.id = fa.season_id;


DROP MATERIALIZED VIEW IF EXISTS field_activity_details;
CREATE MATERIALIZED VIEW field_activity_details AS
SELECT
  f.mfid,
  cs.season_year,
  cs.semester,
  fa.id,
  fa.field_id,
  fa.season_id,
  fa.activity_type,
  fa.collected_by,
  fa.verified_by,
  fa.verification_status,
  fa.collected_at,
  fa.verified_at,
  fa.synced_at,

  CONCAT(fm.first_name, ' ', fm.last_name)    AS farmer_name,
  a.barangay,
  a.city_municipality AS municipality,
  a.province,

  CASE fa.activity_type
    WHEN 'field-data' THEN to_jsonb(fp) - 'id'
    WHEN 'cultural-management' THEN to_jsonb(ce) - 'id'
    WHEN 'nutrient-management' THEN to_jsonb(fr)   - 'id'
    WHEN 'production' THEN to_jsonb(hr)         - 'id'
    WHEN 'damage-assessment' THEN to_jsonb(da)      - 'id'
    WHEN 'monitoring-visit' THEN to_jsonb(mv)       - 'id'
    ELSE '{}'::jsonb
  END AS form_data

FROM public.field_activities fa

JOIN public.fields f       ON fa.field_id = f.id
JOIN public.farmers fm     ON f.farmer_id = fm.id
JOIN addresses a           ON f.barangay_id = a.barangay_id
JOIN current_season cs     ON fa.season_id = cs.id

LEFT JOIN public.field_plannings        fp ON fa.id = fp.id
LEFT JOIN public.crop_establishments    ce ON fa.id = ce.id
LEFT JOIN public.fertilization_records  fr ON fa.id = fr.id
LEFT JOIN public.harvest_records        hr ON fa.id = hr.id
LEFT JOIN public.damage_assessments     da ON fa.id = da.id
LEFT JOIN public.monitoring_visits      mv ON fa.id = mv.id
;
