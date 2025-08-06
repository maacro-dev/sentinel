import * as z from "zod/v4"
import { withSeasonComparison } from "./utils"
import { Validator } from "@/core/utils/validator"

export const seasonSummaryEntry = z.object({
  name: z.string(),
  current_value: z.number(),
  percent_change: z.number(),
  previous_value: z.number(),
})

export type SeasonSummary = z.infer<typeof seasonSummarySchema>
export const seasonSummarySchema = withSeasonComparison(seasonSummaryEntry)

export const parseSeasonSummary =
  Validator.create<SeasonSummary>(seasonSummarySchema)
