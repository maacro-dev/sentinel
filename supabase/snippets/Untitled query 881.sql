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
