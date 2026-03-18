
-- todo to clean

create or replace function public.dashboard_summary(p_season_id int default null)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
    as $$
declare
    curr record;
    prev record;
    current_field_count numeric := 0;
    previous_field_count numeric := 0;
    current_forms_submitted numeric := 0;
    previous_forms_submitted numeric := 0;
    current_total_area numeric := 0;
    previous_total_area numeric := 0;
    current_total_yield numeric := 0;
    previous_total_yield numeric := 0;
    current_yield numeric := 0;
    previous_yield numeric := 0;
    current_not_sufficient numeric := 0;
    previous_not_sufficient numeric := 0;
    current_data_completeness numeric := 0;
    previous_data_completeness numeric := 0;
    current_damage_reports numeric := 0;
    previous_damage_reports numeric := 0;
    current_pest_reports numeric := 0;
    previous_pest_reports numeric := 0;
    has_previous boolean := FALSE;
    result jsonb;
begin
    if p_season_id is null then
        select * into curr
        from public.seasons
        order by start_date desc
        limit 1;
    else
        select * into curr
        from public.seasons
        where id = p_season_id;
    end if;

    if not found then
        return jsonb_build_object();
    end if;

    select * into prev
    from public.seasons
    where start_date < curr.start_date
    order by start_date desc
    limit 1;

    has_previous := prev is not null;

    -- Field counts and form submissions
    if has_previous then
        select coalesce(count(distinct field_id) filter (where season_id = curr.id), 0),
               coalesce(count(distinct field_id) filter (where season_id = prev.id), 0),
               coalesce(count(*) filter (where season_id = curr.id), 0),
               coalesce(count(*) filter (where season_id = prev.id), 0)
        into current_field_count, previous_field_count,
             current_forms_submitted, previous_forms_submitted
        from public.field_activities
        where season_id in (curr.id, prev.id);
    else
        select coalesce(count(distinct field_id), 0),
               coalesce(count(*), 0)
        into current_field_count, current_forms_submitted
        from public.field_activities
        where season_id = curr.id;
    end if;

    -- Damage and pest reports (pest only when observed_pest is not null and not 'N/A' and not empty)
    if has_previous then
        select coalesce(count(*) filter (where fa.season_id = curr.id), 0),
               coalesce(count(*) filter (where fa.season_id = prev.id), 0),
               coalesce(count(*) filter (where da.observed_pest is not null and da.observed_pest != '' and da.observed_pest != 'N/A' and fa.season_id = curr.id), 0),
               coalesce(count(*) filter (where da.observed_pest is not null and da.observed_pest != '' and da.observed_pest != 'N/A' and fa.season_id = prev.id), 0)
        into current_damage_reports, previous_damage_reports,
             current_pest_reports, previous_pest_reports
        from public.field_activities fa
        join public.damage_assessments da on da.id = fa.id
        where fa.season_id in (curr.id, prev.id);
    else
        select coalesce(count(*), 0),
               coalesce(count(*) filter (where da.observed_pest is not null and da.observed_pest != '' and da.observed_pest != 'N/A'), 0)
        into current_damage_reports, current_pest_reports
        from public.field_activities fa
        join public.damage_assessments da on da.id = fa.id
        where fa.season_id = curr.id;
    end if;

    -- Harvest area, yield, irrigation issues (unchanged)
    if has_previous then
        select coalesce(sum(hr.area_harvested_ha) filter (where fa.season_id = curr.id), 0),
               coalesce(sum(hr.area_harvested_ha) filter (where fa.season_id = prev.id), 0),
               coalesce(sum(hr.bags_harvested * hr.avg_bag_weight_kg) filter (where fa.season_id = curr.id), 0),
               coalesce(sum(hr.bags_harvested * hr.avg_bag_weight_kg) filter (where fa.season_id = prev.id), 0),
               coalesce(count(*) filter (where hr.irrigation_supply in ('Not Enough', 'Not Sufficient')
                                         and fa.season_id = curr.id), 0),
               coalesce(count(*) filter (where hr.irrigation_supply in ('Not Enough', 'Not Sufficient')
                                         and fa.season_id = prev.id), 0)
        into current_total_area, previous_total_area,
             current_total_yield, previous_total_yield,
             current_not_sufficient, previous_not_sufficient
        from public.field_activities fa
        join public.harvest_records hr on hr.id = fa.id
        where fa.season_id in (curr.id, prev.id);
    else
        select coalesce(sum(hr.area_harvested_ha), 0),
               coalesce(sum(hr.bags_harvested * hr.avg_bag_weight_kg), 0),
               coalesce(count(*) filter (where hr.irrigation_supply in ('Not Enough', 'Not Sufficient')), 0)
        into current_total_area, current_total_yield, current_not_sufficient
        from public.field_activities fa
        join public.harvest_records hr on hr.id = fa.id
        where fa.season_id = curr.id;
    end if;

    -- Yield per hectare (tons/ha)
    current_yield := case when current_total_area > 0 then
        round((current_total_yield / current_total_area) / 1000, 2)
    else 0 end;
    previous_yield := case when previous_total_area > 0 then
        round((previous_total_yield / previous_total_area) / 1000, 2)
    else 0 end;

    -- Data completeness (unchanged)
    if has_previous then
        select coalesce(round((sum(
            case when fa.season_id = curr.id
                  and ((fa.activity_type = 'field-data' and fp.id is not null)
                    or (fa.activity_type = 'cultural-management' and ce.id is not null)
                    or (fa.activity_type = 'nutrient-management' and fr.id is not null)
                    or (fa.activity_type = 'production' and hr.id is not null))
                  and fa.verification_status = 'approved' then 1
                  else 0 end) * 100.0) / nullif(count(*) filter (where fa.season_id = curr.id), 0), 2), 0),
               coalesce(round((sum(
            case when fa.season_id = prev.id
                  and ((fa.activity_type = 'field-data' and fp.id is not null)
                    or (fa.activity_type = 'cultural-management' and ce.id is not null)
                    or (fa.activity_type = 'nutrient-management' and fr.id is not null)
                    or (fa.activity_type = 'production' and hr.id is not null))
                  and fa.verification_status = 'approved' then 1
                  else 0 end) * 100.0) / nullif(count(*) filter (where fa.season_id = prev.id), 0), 2), 0)
        into current_data_completeness, previous_data_completeness
        from public.field_activities fa
        left join public.field_plannings fp on fp.id = fa.id and fa.activity_type = 'field-data'
        left join public.crop_establishments ce on ce.id = fa.id and fa.activity_type = 'cultural-management'
        left join public.fertilization_records fr on fr.id = fa.id and fa.activity_type = 'nutrient-management'
        left join public.harvest_records hr on hr.id = fa.id and fa.activity_type = 'production'
        where fa.season_id in (curr.id, prev.id);
    else
        select coalesce(round((sum(
            case when ((fa.activity_type = 'field-data' and fp.id is not null)
                    or (fa.activity_type = 'cultural-management' and ce.id is not null)
                    or (fa.activity_type = 'nutrient-management' and fr.id is not null)
                    or (fa.activity_type = 'production' and hr.id is not null))
                  and fa.verification_status = 'approved' then 1
                  else 0 end) * 100.0) / nullif(count(*), 0), 2), 0)
        into current_data_completeness
        from public.field_activities fa
        left join public.field_plannings fp on fp.id = fa.id and fa.activity_type = 'field-data'
        left join public.crop_establishments ce on ce.id = fa.id and fa.activity_type = 'cultural-management'
        left join public.fertilization_records fr on fr.id = fa.id and fa.activity_type = 'nutrient-management'
        left join public.harvest_records hr on hr.id = fa.id and fa.activity_type = 'production'
        where fa.season_id = curr.id;
    end if;

    -- Build JSON result (unchanged)
    result := jsonb_build_object(
        'seasons', jsonb_build_object(
            'current', jsonb_build_object(
                'id', curr.id,
                'start_date', curr.start_date,
                'end_date', curr.end_date,
                'semester', curr.semester,
                'season_year', curr.season_year
            ),
            'previous', case when has_previous then
                jsonb_build_object(
                    'id', prev.id,
                    'start_date', prev.start_date,
                    'end_date', prev.end_date,
                    'semester', prev.semester,
                    'season_year', prev.season_year
                )
            else null end
        ),
        'data', jsonb_build_array(
            jsonb_build_object(
                'name', 'field_count',
                'current_value', current_field_count,
                'previous_value', previous_field_count,
                'percent_change', case
                    when previous_field_count = 0 then
                        case when current_field_count = 0 then 0.00 else 100 end
                    else round(((current_field_count - previous_field_count)::numeric / previous_field_count) * 100, 2)
                end
            ),
            jsonb_build_object(
                'name', 'form_submission',
                'current_value', current_forms_submitted,
                'previous_value', previous_forms_submitted,
                'percent_change', case
                    when previous_forms_submitted = 0 then
                        case when current_forms_submitted = 0 then 0.00 else 100 end
                    else round(((current_forms_submitted - previous_forms_submitted)::numeric / previous_forms_submitted) * 100, 2)
                end
            ),
            jsonb_build_object(
                'name', 'yield',
                'current_value', current_yield,
                'previous_value', previous_yield,
                'percent_change', case
                    when previous_yield = 0 then
                        case when current_yield = 0 then 0.00 else 100 end
                    else round(((current_yield - previous_yield) / previous_yield) * 100, 2)
                end
            ),
            jsonb_build_object(
                'name', 'harvested_area',
                'current_value', round(current_total_area, 2),
                'previous_value', round(previous_total_area, 2),
                'percent_change', case
                    when previous_total_area = 0 then
                        case when current_total_area = 0 then 0.00 else 100 end
                    else round(((current_total_area - previous_total_area) / previous_total_area) * 100, 2)
                end
            ),
            jsonb_build_object(
                'name', 'irrigation',
                'current_value', current_not_sufficient,
                'previous_value', previous_not_sufficient,
                'percent_change', case
                    when previous_not_sufficient = 0 then
                        case when current_not_sufficient = 0 then 0.00 else 100 end
                    else round(((current_not_sufficient - previous_not_sufficient)::numeric / previous_not_sufficient) * 100, 2)
                end
            ),
            jsonb_build_object(
                'name', 'data_completeness',
                'current_value', current_data_completeness,
                'previous_value', previous_data_completeness,
                'percent_change', case
                    when previous_data_completeness = 0 then
                        case when current_data_completeness = 0 then 0.00 else 100 end
                    else round(((current_data_completeness - previous_data_completeness) / previous_data_completeness) * 100, 2)
                end
            ),
            jsonb_build_object(
                'name', 'damage_report',
                'current_value', current_damage_reports,
                'previous_value', previous_damage_reports,
                'percent_change', case
                    when previous_damage_reports = 0 then
                        case when current_damage_reports = 0 then 0.00 else 100 end
                    else round(((current_damage_reports - previous_damage_reports)::numeric / previous_damage_reports) * 100, 2)
                end
            ),
            jsonb_build_object(
                'name', 'pest_report',
                'current_value', current_pest_reports,
                'previous_value', previous_pest_reports,
                'percent_change', case
                    when previous_pest_reports = 0 then
                        case when current_pest_reports = 0 then 0.00 else 100 end
                    else round(((current_pest_reports - previous_pest_reports)::numeric / previous_pest_reports) * 100, 2)
                end
            )
        )
    );

    return result;
end;
$$;
