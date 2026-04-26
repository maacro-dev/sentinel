create or replace function get_available_tasks_for_collector(
  p_collector_id uuid
)
returns setof collection_details
language sql
security definer
set search_path = 'public'
as $$
  with current_season as (
    select id as season_id from latest_season
  ),
  all_tasks as (
    select cd.*
    from collection_details cd
    cross join current_season cs
    where cd.collector_id = p_collector_id
      and cd.season_id = cs.season_id
  ),
  completed_tasks as (
    select * from all_tasks where status = 'completed'
  ),
  pending_tasks as (
    select *
    from all_tasks
    where status in ('pending', 'in_progress')
    -- no date filter here
  ),
  prereq_met as (
    select
      t.id,
      case
        when t.activity_type = 'field-data' then true
        when t.activity_type = 'cultural-management' then
          exists (
            select 1 from all_tasks p
            where p.mfid_id = t.mfid_id
              and p.activity_type = 'field-data'
              and p.status = 'completed'
              and p.verification_status = 'approved'
          )
        when t.activity_type in ('nutrient-management', 'production') then
          exists (
            select 1 from all_tasks p
            where p.mfid_id = t.mfid_id
              and p.activity_type = 'cultural-management'
              and p.status = 'completed'
              and p.verification_status = 'approved'
          )
        else false
      end as ok
    from pending_tasks t
  ),
  eligible_pending as (
    select t.*
    from pending_tasks t
    join prereq_met pm on pm.id = t.id
    where pm.ok
  ),
  per_mfid_earliest_date as (
    select mfid_id, min(start_date) as earliest_start
    from eligible_pending
    group by mfid_id
  ),
  filtered_pending as (
    select et.*
    from eligible_pending et
    join per_mfid_earliest_date ed
      on ed.mfid_id = et.mfid_id
      and et.start_date = ed.earliest_start
  )
  select * from completed_tasks
  union all
  select * from filtered_pending
  order by mfid, start_date;
$$;