create or replace view collection_details as
select
    ct.id,

    ct.season_id,
    s.start_date as season_start_date,
    s.end_date as season_end_date,

    ct.mfid_id,
    ct.activity_type,
    ct.collector_id,
    ct.start_date,
    ct.end_date,
    ct.status,
    ct.assigned_at,
    ct.created_at,
    ct.updated_at,
    ct.can_retake,
    ct.retake_of,

    m.mfid,
    concat(u.first_name, ' ', u.last_name) as collector_name,
    concat(f.first_name, ' ', f.last_name) as farmer_name,

    coalesce(loc.municipality, '') as city_municipality,
    coalesce(loc.province, '') as province,
    coalesce(a.barangay, '') as barangay,
    case
        when a.barangay is not null then concat(a.barangay, ', ', coalesce(loc.municipality, ''), ', ', coalesce(loc.province, ''))
        else concat(coalesce(loc.municipality, ''), ', ', coalesce(loc.province, ''))
    end as full_address,

    coalesce(fa.verification_status, 'pending') as verification_status,
    fa.id as activity_id,
    fa.collected_by,
    fa.collected_at,
    fa.verified_by,
    fa.verified_at,
    fa.remarks,
    fa.image_urls,

    case
        when ct.activity_type = 'field-data' then
            jsonb_build_object(
                'first_name', f.first_name,
                'last_name', f.last_name,
                'gender', f.gender,
                'date_of_birth', f.date_of_birth,
                'cellphone_no', f.cellphone_no
            )
        when ct.activity_type = 'cultural-management' then
            (select jsonb_build_object(
                'total_field_area_ha', fp.total_field_area_ha,
                'est_crop_establishment_date', fp.est_crop_establishment_date
            )
             from field_plannings fp
             join field_activities fa_prev on fp.id = fa_prev.id
             where fa_prev.field_id = fld.id
               and fa_prev.season_id = ct.season_id
               and fa_prev.activity_type = 'field-data'
               and fa_prev.verification_status = 'approved'
             limit 1)
        when ct.activity_type = 'nutrient-management' then
            (select jsonb_build_object(
                'monitoring_field_area_sqm', ce.monitoring_field_area_sqm
            )
             from crop_establishments ce
             join field_activities fa_prev on ce.id = fa_prev.id
             where fa_prev.field_id = fld.id
               and fa_prev.season_id = ct.season_id
               and fa_prev.activity_type = 'cultural-management'
               and fa_prev.verification_status = 'approved'
             limit 1)
        when ct.activity_type = 'production' then
            (select jsonb_build_object(
                'total_field_area_ha', fp.total_field_area_ha
             )
             from field_plannings fp
             join field_activities fa_fp on fp.id = fa_fp.id
             where fa_fp.field_id = fld.id
               and fa_fp.season_id = ct.season_id
               and fa_fp.activity_type = 'field-data'
               and fa_fp.verification_status = 'approved'
             limit 1)
        when ct.activity_type = 'damage-assessment' then
            (select jsonb_build_object(
                'total_field_area_ha', fp.total_field_area_ha
            )
             from field_plannings fp
             join field_activities fa_prev on fp.id = fa_prev.id
             where fa_prev.field_id = fld.id
               and fa_prev.season_id = ct.season_id
               and fa_prev.activity_type = 'field-data'
               and fa_prev.verification_status = 'approved'
             limit 1)
        else null
    end as dependency_data,

    case when ct.retake_of is not null then true else false end as is_retake,
    fa_original.id as original_activity_id,
    case
        when ct.status = 'pending' and ct.end_date < current_date then true
        else false
    end as is_overdue
from collection_tasks ct
join public.mfids m on ct.mfid_id = m.id
left join seasons s on s.id = ct.season_id
left join fields fld on fld.mfid_id = m.id
left join farmers f on fld.farmer_id = f.id
left join addresses a on fld.barangay_id = a.barangay_id
left join users u on ct.collector_id = u.id
left join field_activities fa on fa.collection_task_id = ct.id
left join collection_tasks ct_original on ct.retake_of = ct_original.id
left join field_activities fa_original on ct_original.id = fa_original.collection_task_id
left join lateral get_mfid_location(m.mfid) as loc on true;