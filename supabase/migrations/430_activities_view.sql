
-- for querying a form
create or replace view public.field_activity_details as
    select case fa.activity_type
            when 'field-data'                    then to_jsonb(fp) - 'id'
            when 'cultural-management'           then to_jsonb(ce) - 'id'
            when 'nutrient-management'           then
                jsonb_build_object(
                    'id', fr.id,
                    'applied_area_sqm', fr.applied_area_sqm,
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
            when 'production'                    then to_jsonb(hr) - 'id'
            when 'damage-assessment'             then to_jsonb(da) - 'id'
            when 'monitoring-visit'              then to_jsonb(mv) - 'id'
            else '{}'::jsonb
        end                                      as form_data,
        m.mfid                                   as mfid,
        s.season_year                            as season_year,
        s.semester                               as semester,
        fa.id                                    as id,
        fa.field_id                              as field_id,
        fa.season_id                             as season_id,
        fa.activity_type                         as activity_type,
        case when u_collected.id is not null then
            jsonb_build_object(
                'id', u_collected.id,
                'name', concat(u_collected.first_name, ' ', u_collected.last_name),
                'email', u_collected.email
            )
        else null end                            as collected_by,
        case when u_verified.id is not null then
            jsonb_build_object(
                'id', u_verified.id,
                'name', concat(u_verified.first_name, ' ', u_verified.last_name),
                'email', u_verified.email
            )
        else null end                            as verified_by,
        fa.remarks                               as remarks,
        fa.verification_status                   as verification_status,
        fa.collected_at                          as collected_at,
        fa.verified_at                           as verified_at,
        fa.synced_at                             as synced_at,
        fa.image_urls                            as image_urls,
        concat(fm.first_name, ' ', fm.last_name) as farmer_name,
        a.barangay                               as barangay,
        a.city_municipality                      as municipality,
        a.province                               as province
    from public.field_activities fa
    join public.seasons s                        on fa.season_id = s.id
    left join public.fields f                    on fa.field_id = f.id
    left join public.mfids m on f.mfid_id = m.id
    left join public.farmers fm                  on f.farmer_id = fm.id
    left join addresses a                        on f.barangay_id = a.barangay_id
    left join public.field_plannings fp          on fa.id = fp.id
    left join public.crop_establishments ce      on fa.id = ce.id
    left join public.fertilization_records fr    on fa.id = fr.id
    left join public.harvest_records hr          on fa.id = hr.id
    left join public.damage_assessments da       on fa.id = da.id
    left join public.monitoring_visits mv        on fa.id = mv.id
    left join user_details u_collected           on fa.collected_by = u_collected.id
    left join user_details u_verified            on fa.verified_by = u_verified.id;



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
