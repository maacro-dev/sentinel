SELECT COUNT(*) FROM harvest_records hr
JOIN field_activities fa ON hr.id = fa.id
WHERE fa.season_id = 23;