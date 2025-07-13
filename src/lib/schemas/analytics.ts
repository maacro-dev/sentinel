import { number, object, enum as enum_, extend, string, array } from "zod/v4-mini";


const semesterSchema = enum_(['first', 'second']);

const comparisonSchema = object({
  current_year: number(),
  current_semester: semesterSchema,
  previous_year: number(),
  previous_semester: semesterSchema,
})

export const SeasonFieldCountComparisonStatSchema = extend(comparisonSchema, {
  previous_field_count: number(),
  current_field_count: number(),
  percent_change: number(),
})

export const formSubmissionSchema = extend(comparisonSchema, {
  previous_forms_submitted: number(),
  current_forms_submitted: number(),
  percent_change: number(),
})

export const seasonYieldComparisonStatSchema = extend(comparisonSchema, {
  previous_yield_t_per_ha: number(),
  current_yield_t_per_ha: number(),
  percent_change: number(),
})

export const SeasonHarvestedAreaComparisonStatSchema = extend(comparisonSchema, {
  previous_area_harvested: number(),
  current_area_harvested: number(),
  percent_change: number(),
})

export const SeasonIrrigationComparisonStatSchema = extend(comparisonSchema, {
  current_not_sufficient: number(),
  current_sufficient: number(),
  current_excessive: number(),
  previous_not_sufficient: number(),
  previous_sufficient: number(),
  previous_excessive: number(),
  not_sufficient_change_pct: number(),
  sufficient_change_pct: number(),
  excessive_change_pct: number(),
})

export const seasonYieldTimeSeriesSchema = array(object({
  month_year: string(),
  avg_yield_t_ha: number(),
}))

export const barangayYieldTopBottomSchema = array(object({
  category: string(),
  barangay_name: string(),
  province_name: string(),
  municipality_name: string(),
  avg_yield_t_per_ha: number(),
}))

