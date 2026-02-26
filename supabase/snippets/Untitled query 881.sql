create or replace view public.field_activity_details as
    select f.mfid,
        case fa.activity_type
            when 'field-data'                    then to_jsonb(fp) - 'id'
            when 'cultural-management'           then to_jsonb(ce) - 'id'
            when 'nutrient-management'           then to_jsonb(fr) - 'id'
            when 'production'                    then to_jsonb(hr) - 'id'
            when 'damage-assessment'             then to_jsonb(da) - 'id'
            when 'monitoring-visit'              then to_jsonb(mv) - 'id'
            else '{}'::jsonb
        end                                      as form_data,
        s.season_year                             as season_year,
        s.semester                                as semester,
        fa.id                                    as id,
        fa.field_id                              as field_id,
        fa.season_id                             as season_id,
        fa.activity_type                         as activity_type,
        fa.collected_by                          as collected_by,
        fa.verified_by                           as verified_by,
        fa.remarks                               as remarks,
        fa.verification_status                   as verification_st2atus,
        fa.collected_at                          as collected_at,
        fa.verified_at                           as verified_at,
        fa.synced_at                             as synced_at,
        concat(fm.first_name, ' ', fm.last_name) as farmer_name,
        a.barangay                               as barangay,
        a.city_municipality                      as municipality,
        a.province                               as province
    from public.field_activities fa
    join public.seasons s                        on fa.season_id = s.id
    left join public.fields f                    on fa.field_id = f.id
    left join public.farmers fm                  on f.farmer_id = fm.id
    left join addresses a                        on f.barangay_id = a.barangay_id
    left join public.field_plannings fp          on fa.id = fp.id
    left join public.crop_establishments ce      on fa.id = ce.id
    left join public.fertilization_records fr    on fa.id = fr.id
    left join public.harvest_records hr          on fa.id = hr.id
    left join public.damage_assessments da       on fa.id = da.id
    left join public.monitoring_visits mv        on fa.id = mv.id;
