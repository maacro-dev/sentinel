create or replace function public.generate_mfid(
    p_municity text,
    p_province text
)
    returns text
    language plpgsql
    security definer
    set search_path = ''
as $$
declare
    municipal_code text;
    last_suffix int;
    next_suffix text;
    new_mfid text;
begin
    select
        cm.code
    into municipal_code
    from public.cities_municipalities cm join public.provinces p on p.id = cm.province_id
    where cm.name = p_municity and p.name = p_province
    limit 1;

    if municipal_code is null then
        raise exception 'Municipality not found';
    end if;

    perform pg_advisory_xact_lock(hashtext(municipal_code));

    select coalesce(max(substring(mfid from 7 for 3)::int), 0)
    into last_suffix
    from public.mfids
    where mfid like municipal_code || '%';

    if last_suffix >= 999 then
        raise exception 'MFID overflow for %', municipal_code;
    end if;

    next_suffix := lpad((last_suffix + 1)::text, 3, '0');
    new_mfid := municipal_code || next_suffix;

    insert into public.mfids(mfid) values (new_mfid);

    return new_mfid;
END;
$$;


create or replace function check_duplicate_activities(
  p_activity_type text,
  p_rows jsonb
)
    returns jsonb
    language plpgsql
    security definer
as $$
declare
    v_result jsonb;
begin
    select jsonb_object_agg(key, value::boolean)
    into v_result
    from jsonb_each(
        (
            select jsonb_object_agg(
                (elem->>'mfid') || '|' || (elem->>'season_id')::text,  -- Fixed: use elem->>'mfid'
                exists (
                    select 1
                    from field_activities fa
                    join fields f on fa.field_id = f.id
                    where f.mfid = (elem->>'mfid')  -- Fixed: use elem->>'mfid'
                        and fa.season_id = (elem->>'season_id')::int
                        and fa.activity_type = p_activity_type::activity_type
                )
            )
            from jsonb_array_elements(p_rows) as elem  -- Added alias 'elem'
        )
    );

    return v_result;
end;
$$;
