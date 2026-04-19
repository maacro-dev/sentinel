
create or replace view public.field_activity_details
 as
select
    case fa.activity_type
        when 'field-data' then
            to_jsonb(fp) - 'id' ||
            jsonb_build_object('monitoring_visit', to_jsonb(mv_core) - 'id') ||
            jsonb_build_object(
                'first_name', fm.first_name,
                'last_name', fm.last_name,
                'gender', fm.gender,
                'date_of_birth', fm.date_of_birth,
                'cellphone_no', fm.cellphone_no,
                'province', a.province,
                'municipality_or_city', a.city_municipality,
                'barangay', a.barangay,
                'location', spatial.ST_Y(f.location) || ',' || spatial.ST_X(f.location)
            )
        when 'cultural-management' then
            to_jsonb(ce) - 'id' ||
            jsonb_build_object('monitoring_visit', to_jsonb(mv_core) - 'id')
        when 'nutrient-management' then
            jsonb_build_object(
                'applied_area_sqm', fr.applied_area_sqm,
                'monitoring_visit', to_jsonb(mv_core) - 'id',
                'applications', coalesce((
                    select jsonb_agg(
                        jsonb_build_object(
                            'fertilizer_type', fapp.fertilizer_type,
                            'brand', fapp.brand,
                            'nitrogen_content_pct', fapp.nitrogen_content_pct,
                            'phosphorus_content_pct', fapp.phosphorus_content_pct,
                            'potassium_content_pct', fapp.potassium_content_pct,
                            'amount_applied', fapp.amount_applied,
                            'amount_unit', fapp.amount_unit,
                            'crop_stage_on_application', fapp.crop_stage_on_application
                        )
                    )
                    from public.fertilizer_applications fapp
                    where fapp.fertilization_record_id = fr.id
                ), '[]'::jsonb)
            )
        when 'production' then
            to_jsonb(hr) - 'id' ||
            jsonb_build_object('monitoring_visit', to_jsonb(mv_core) - 'id')
        when 'damage-assessment' then
            to_jsonb(da) - 'id'
        else '{}'::jsonb
    end as form_data,
    m.mfid as mfid,
    s.season_year as season_year,
    s.semester as semester,
    fa.id as id,
    fa.field_id as field_id,
    fa.season_id as season_id,
    fa.activity_type as activity_type,
    row_to_json(u_collected) as collected_by,
    row_to_json(u_verified) as verified_by,
    fa.remarks as remarks,
    fa.verification_status as verification_status,
    fa.collected_at as collected_at,
    fa.verified_at as verified_at,
    fa.synced_at as synced_at,
    fa.image_urls as image_urls,
    fa.collection_task_id as collection_task_id,
    fa.updated_at as updated_at,
    concat(fm.first_name, ' ', fm.last_name) as farmer_name,
    a.barangay as barangay,
    a.city_municipality as municipality,
    a.province as province,
    case when ct.retake_of is not null then true else false end as is_retake,
    fa_original.id as original_activity_id
from public.field_activities fa
join public.seasons s on fa.season_id = s.id
left join public.fields f on fa.field_id = f.id
left join public.mfids m on f.mfid_id = m.id
left join public.farmers fm on f.farmer_id = fm.id
left join addresses a on f.barangay_id = a.barangay_id
left join public.field_plannings fp on fa.id = fp.id
left join public.crop_establishments ce on fa.id = ce.id
left join public.fertilization_records fr on fa.id = fr.id
left join public.harvest_records hr on fa.id = hr.id
left join public.damage_assessments da on fa.id = da.id
left join public.monitoring_visits mv on fa.monitoring_visit_id = mv.id
left join public.monitoring_visits mv_core on fa.monitoring_visit_id = mv_core.id
left join user_details u_collected on fa.collected_by = u_collected.id
left join user_details u_verified on fa.verified_by = u_verified.id
left join public.collection_tasks ct on fa.collection_task_id = ct.id
left join public.collection_tasks ct_original on ct.retake_of = ct_original.id
left join public.field_activities fa_original on ct_original.id = fa_original.collection_task_id;


create or replace view collection_details
 as
select
    s.start_date                            as season_start_date,
    s.end_date                              as season_end_date,

    ct.id,
    ct.season_id,
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

    concat(u.first_name, ' ', u.last_name)  as collector_name,
    concat(f.first_name, ' ', f.last_name)  as farmer_name,

    coalesce(a.city_municipality, '')       as city_municipality,
    coalesce(a.province, '')                as province,
    coalesce(a.barangay, '')                as barangay,

    case
        when a.barangay is not null then
            concat(a.barangay, ', ', coalesce(a.city_municipality, ''), ', ', coalesce(a.province, ''))
        else
            concat(coalesce(a.city_municipality, ''), ', ', coalesce(a.province, ''))
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
left join field_activities fa_original on ct_original.id = fa_original.collection_task_id;


create or replace function public.get_planting_season_for_harvest(p_field_id int, p_harvest_date date)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_season_id int;
begin
    select fa.season_id into v_season_id
    from public.field_activities fa
    join public.crop_establishments ce on fa.id = ce.id
    where fa.field_id = p_field_id
      and fa.activity_type = 'cultural-management'
      and ce.actual_crop_establishment_date <= p_harvest_date
    order by ce.actual_crop_establishment_date desc
    limit 1;

    return v_season_id;
end;
$$;




create or replace view seasons_with_data
 as
    select distinct s.*
    from seasons s
    join field_activities fa on fa.season_id = s.id;


create or replace function public.has_new_forms(
    p_user_id uuid,
    p_updated_after timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
    return exists (
        select 1
        from public.field_activity_details
        where collected_by->>'id' = p_user_id::text
          and (p_updated_after is null or updated_at > p_updated_after)
    );
end;
$$;

create or replace function public.has_new_tasks(
    p_user_id uuid,
    p_updated_after timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
    return exists (
        select 1
        from public.collection_details
        where collected_by = p_user_id
          and (p_updated_after is null or updated_at > p_updated_after)
    );
end;
$$;
