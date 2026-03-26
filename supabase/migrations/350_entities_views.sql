
create or replace view latest_season as
    select *
    from seasons s
    where now() between s.start_date and s.end_date
    order by s.start_date desc
    limit 1;



create or replace view public.field_details as
select
    fd.id as field_id,
    m.mfid,
    f.first_name as farmer_first_name,
    f.last_name as farmer_last_name,
    b.name as barangay,
    cm.name as municipality,
    p.name as province,
    fd.created_at,
    fd.updated_at
from public.fields fd
join public.mfids m on fd.mfid_id = m.id
join public.farmers f on f.id = fd.farmer_id
join public.barangays b on b.id = fd.barangay_id
join public.cities_municipalities cm on cm.id = b.city_municipality_id
join public.provinces p on p.id = cm.province_id;


create or replace view public.mfid_details as
select
    case when m.used_at is null then 'available' else 'used' end as status,
    case when fa.id is not null then concat_ws(' ', fa.first_name, fa.last_name) else null end as farmer_name,
    m.mfid,
    a.barangay,
    loc.municipality as city_municipality,
    loc.province,
    spatial.ST_X(f.location) || ',' || spatial.ST_Y(f.location) as coordinates,
    m.created_at,
    m.used_at
from public.mfids m
left join public.fields f on f.mfid_id = m.id
left join public.addresses a on f.barangay_id = a.barangay_id
left join public.farmers fa on f.farmer_id = fa.id
left join lateral get_mfid_location(m.mfid) loc on true
order by m.mfid;
