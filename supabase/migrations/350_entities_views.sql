
create or replace view latest_season as
    select *
    from seasons s
    where now() between s.start_date and s.end_date
    order by s.start_date desc
    limit 1;

create or replace view mfid_details as
    select
        case
            when m.used_at is null then
                'available'
            else
                'used'
        end                       as status,
        case
            when fa.id is not null then
                concat_ws(' ', fa.first_name, fa.last_name)
            else
                null
        end                       as farmer_name,
        m.mfid                    as mfid,
        a.barangay                as barangay,
        a.city_municipality       as city_municipality,
        a.province                as province,
        m.created_at              as created_at,
        m.used_at                 as used_at
    from mfids m
    left join fields f            on f.mfid = m.mfid
    left join addresses a         on f.barangay_id = a.barangay_id
    left join farmers fa          on f.farmer_id = fa.id
    order by m.mfid;

create or replace view field_details as
    select
        fd.id           as field_id,
        fd.mfid         as mfid,
        f.first_name    as farmer_first_name,
        f.last_name     as farmer_last_name,
        b.name          as barangay,
        cm.name         as municipality,
        p.name          as province,
        fd.created_at   as created_at,
        fd.updated_at   as updated_at
    from fields fd
        join farmers f                on f.id = fd.farmer_id
        join barangays b              on b.id = fd.barangay_id
        join cities_municipalities cm on cm.id = b.city_municipality_id
        join provinces p              on p.id = cm.province_id;
