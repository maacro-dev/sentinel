create or replace view public.mfid_details as
select
    case when m.used_at is null then 'available' else 'used' end as status,
    case when fa.id is not null then concat_ws(' ', fa.first_name, fa.last_name) else null end as farmer_name,
    m.mfid,
    a.barangay,
    loc.municipality as city_municipality,
    loc.province,
    spatial.ST_Y(f.location) || ',' || spatial.ST_X(f.location) as coordinates,
    m.created_at,
    m.used_at
from public.mfids m
left join public.fields f on f.mfid_id = m.id
left join public.addresses a on f.barangay_id = a.barangay_id
left join public.farmers fa on f.farmer_id = fa.id
left join lateral get_mfid_location(m.mfid) loc on true
order by m.mfid;
