
create or replace view latest_season
 as
    select *
    from seasons s
    where now() between s.start_date and s.end_date
    order by s.start_date desc
    limit 1;


create or replace view public.field_details
 as
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


create or replace view public.mfid_details
 as
select
    case
        when m.used_at is null
            then 'available'
        else 'assigned'
    end                 as status,
    case
        when fa.id is not null
            then concat_ws(' ', fa.first_name, fa.last_name)
        else null
    end                 as farmer_name,
    fa.gender           as farmer_gender,
    fa.date_of_birth    as farmer_date_of_birth,
    fa.cellphone_no     as farmer_cellphone_no,
    m.mfid,
    a.barangay,
    a.city_municipality,
    a.province,
    spatial.ST_Y(f.location) || ',' || spatial.ST_X(f.location) as coordinates,
    m.created_at,
    m.used_at
from public.mfids m
left join public.fields f on f.mfid_id = m.id
left join public.addresses a on f.barangay_id = a.barangay_id
left join public.farmers fa on f.farmer_id = fa.id
order by m.mfid;



create or replace function public.create_field_with_new_mfid(
    p_municity text,
    p_province text,
    p_barangay_id int,
    p_farmer_id int,
    p_location spatial.geometry(Point, 4326) default null
)
    returns int
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    new_mfid text;
    new_mfid_id int;
    new_field_id int;
begin
    new_mfid := public.generate_mfid(p_municity, p_province);

    select id into new_mfid_id from public.mfids where mfid = new_mfid;

    update public.mfids set used_at = now() where id = new_mfid_id;

    insert into public.fields (mfid_id, barangay_id, farmer_id, location)
    values (new_mfid_id, p_barangay_id, p_farmer_id, p_location)
    returning id into new_field_id;

    return new_field_id;
end;
$$;
