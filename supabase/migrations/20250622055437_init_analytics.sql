create schema if not exists analytics;

create or replace view analytics.season_field_counts as
select
    s.year,
    s.sem,
    count(distinct fa.field_id) as field_count
from field_activities fa
join seasons s on fa.season_id = s.id
group by s.year, s.sem
order by s.year desc, s.sem desc;


create view analytics.season_submissions as
select
    s.year,
    s.sem,
    count(*) as forms_submitted
from field_activities fa
join seasons s on fa.season_id = s.id
group by s.year, s.sem;

create or replace view analytics.season_harvested_area as
select
    s.year,
    s.sem,
    sum(hr.area_harvested) as total_area_harvested
from harvest_records hr
join field_activities fa on hr.id = fa.id
join seasons s on fa.season_id = s.id
group by s.year, s.sem
order by s.year desc, s.sem desc;

create or replace view analytics.season_irrigation_counts as
select
    s.year,
    s.sem,
    count(*) filter (
      where hr.irrigation_supply in ('Not Enough', 'Not Sufficient')
    ) as not_sufficient_count,
    count(*) filter (
      where hr.irrigation_supply = 'Sufficient'
    ) as sufficient_count,
    count(*) filter (
      where hr.irrigation_supply = 'Excessive'
    ) as excessive_count
from harvest_records hr
join field_activities fa on hr.id = fa.id
join seasons s on fa.season_id = s.id
group by s.year, s.sem
order by s.year desc, s.sem desc;

create or replace view analytics.season_field_count_comparison as
with ranked_fields as (
    select
        year,
        sem,
        field_count,
        lag(year) over (order by year desc, sem desc) as previous_year,
        lag(sem) over (order by year desc, sem desc) as previous_semester,
        lag(field_count) over (order by year desc, sem desc) as previous_field_count
    from analytics.season_field_counts
)
select
    year as current_year,
    sem as current_semester,
    field_count as current_field_count,
    previous_year,
    previous_semester,
    previous_field_count,
    case
        when previous_field_count is not null and previous_field_count > 0 then
            round(
                ((field_count - previous_field_count)::numeric / previous_field_count) * 100,
                2
            )
        else null
    end as percent_change
from ranked_fields
where previous_field_count is not null
order by year desc, sem desc
limit 1;


create or replace view analytics.season_irrigation_comparison as
with ranked_irrigation as (
    select
        year,
        sem,
        not_sufficient_count,
        sufficient_count,
        excessive_count,
        lag(year)  over (order by year desc, sem desc) as previous_year,
        lag(sem)   over (order by year desc, sem desc) as previous_sem,
        lag(not_sufficient_count) over (order by year desc, sem desc) as previous_not_sufficient,
        lag(sufficient_count) over (order by year desc, sem desc) as previous_sufficient,
        lag(excessive_count)  over (order by year desc, sem desc) as previous_excessive
    from analytics.season_irrigation_counts
)
select
    year as current_year,
    sem as current_semester,
    not_sufficient_count as current_not_sufficient,
    sufficient_count as current_sufficient,
    excessive_count as current_excessive,
    previous_year,
    previous_sem as previous_semester,
    previous_not_sufficient,
    previous_sufficient,
    previous_excessive,
    round(
      ((not_sufficient_count - previous_not_sufficient)::numeric / nullif(previous_not_sufficient,0)) * 100,
      2
    ) as not_sufficient_change_pct,
    round(
      ((sufficient_count - previous_sufficient)::numeric / nullif(previous_sufficient,0)) * 100,
      2
    ) as sufficient_change_pct,
    round(
      ((excessive_count - previous_excessive)::numeric / nullif(previous_excessive,0)) * 100,
      2
    ) as excessive_change_pct
from ranked_irrigation
where previous_year is not null
order by year desc, sem desc
limit 1;


create view analytics.season_yields as
select s.year, s.sem,
       sum(hr.bags_harvested * hr.avg_bag_weight_kg) / nullif(sum(hr.area_harvested), 0) as avg_yield_kg_per_ha
from harvest_records hr
join field_activities fa on hr.id = fa.id
join seasons s on fa.season_id = s.id
group by s.year, s.sem;

create or replace view analytics.season_yield_comparison as
with ranked_yields as (
    select
        year,
        sem,
        avg_yield_kg_per_ha,
        lag(year) over (order by year desc, sem desc) as previous_year,
        lag(sem) over (order by year desc, sem desc) as previous_semester,
        lag(avg_yield_kg_per_ha) over (order by year desc, sem desc) as previous_yield_kg_per_ha
    from analytics.season_yields
)
select
    year as current_year,
    sem as current_semester,
    round((avg_yield_kg_per_ha / 1000.0)::numeric, 2) as current_yield_t_per_ha,
    round((previous_yield_kg_per_ha / 1000.0)::numeric, 2) as previous_yield_t_per_ha,
    previous_year,
    previous_semester,
    case
        when previous_yield_kg_per_ha is not null then
            round(
                ((avg_yield_kg_per_ha - previous_yield_kg_per_ha) / previous_yield_kg_per_ha * 100)::numeric,
                2
            )
        else null
    end as percent_change
from ranked_yields
where previous_yield_kg_per_ha is not null
order by year desc, sem desc
limit 1;

create or replace view analytics.season_harvested_area_comparison as
with ranked_area as (
    select
        year,
        sem,
        total_area_harvested,
        lag(year) over (order by year desc, sem desc) as previous_year,
        lag(sem) over (order by year desc, sem desc) as previous_semester,
        lag(total_area_harvested) over (order by year desc, sem desc) as previous_area_harvested
    from analytics.season_harvested_area
)
select
    year as current_year,
    sem as current_semester,
    round(total_area_harvested::numeric, 2) as current_area_harvested,
    previous_year,
    previous_semester,
    round(previous_area_harvested::numeric, 2) as previous_area_harvested,
    case
      when previous_area_harvested is not null and previous_area_harvested > 0 then
          round(
              (((total_area_harvested - previous_area_harvested) / previous_area_harvested) * 100)::numeric,
              2
          )
      else null
    end as percent_change
from ranked_area
where previous_area_harvested is not null
order by year desc, sem desc
limit 1;



create or replace view analytics.form_submission_comparison as
with ranked_submissions as (
    select
        year,
        sem,
        forms_submitted,
        lag(year) over (order by year desc, sem desc) as previous_year,
        lag(sem) over (order by year desc, sem desc) as previous_semester,
        lag(forms_submitted) over (order by year desc, sem desc) as previous_forms_submitted
    from analytics.season_submissions
)
select
    year as current_year,
    sem as current_semester,
    forms_submitted as current_forms_submitted,
    previous_year,
    previous_semester,
    previous_forms_submitted,
    case
        when previous_forms_submitted is not null and previous_forms_submitted > 0 then
            round(
                ((forms_submitted - previous_forms_submitted)::numeric / previous_forms_submitted) * 100,
                2
            )
        else null
    end as percent_change
from ranked_submissions
where previous_forms_submitted is not null
order by year desc, sem desc
limit 1;


-- harvest yield time-series
create or replace view analytics.harvest_yield_timeseries as
select
  to_char(hr.harvest_date, 'mon yyyy') as month_year,
  round(
    avg((hr.bags_harvested * hr.avg_bag_weight_kg) / nullif(hr.area_harvested, 0) / 1000.0)::numeric,
    2
  ) as avg_yield_t_ha
from harvest_records hr
join field_activities fa on hr.id = fa.id
join seasons s on fa.season_id = s.id
group by to_char(hr.harvest_date, 'mon yyyy'), extract(year from hr.harvest_date), extract(month from hr.harvest_date)
order by extract(year from hr.harvest_date), extract(month from hr.harvest_date);


create or replace view analytics.barangay_yields_top_bottom as
with latest_season as (
    select id
    from seasons
    order by year desc, sem desc
    limit 1
),
yields_per_barangay as (
    select
        b.id as barangay_id,
        b.name as barangay_name,
        m.name as municipality_name,
        p.name as province_name,
        sum(hr.bags_harvested * hr.avg_bag_weight_kg) / nullif(sum(hr.area_harvested),0) as avg_yield_kg_per_ha
    from harvest_records hr
    join field_activities fa
      on hr.id = fa.id
    join fields f
      on fa.field_id = f.id
    join barangays b
      on f.barangay_id = b.id
    join cities_municipalities m
      on b.city_municipality_id = m.id
    join provinces p
      on m.province_id = p.id
    where fa.season_id = (select id from latest_season)
    group by b.id, b.name, m.name, p.name
),
ranked as (
    select
        barangay_id,
        barangay_name,
        province_name,
        municipality_name,
        round((avg_yield_kg_per_ha::numeric / 1000), 2) as avg_yield_t_per_ha,
        row_number() over (order by avg_yield_kg_per_ha desc) as rank_desc,
        row_number() over (order by avg_yield_kg_per_ha asc) as rank_asc
    from yields_per_barangay
)
select
    'Top' as category,
    barangay_name,
    province_name,
    municipality_name,
    avg_yield_t_per_ha
from ranked
where rank_desc <= 3

union all

select
    'Bottom' as category,
    barangay_name,
    province_name,
    municipality_name,
    avg_yield_t_per_ha
from ranked
where rank_asc <= 3

order by category, avg_yield_t_per_ha desc;
