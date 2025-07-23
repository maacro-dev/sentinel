import * as z from "zod/v4-mini"
import { seasonsSchema } from "@/features/fields/schemas"

export const statEntrySchema = z.object({
  name: z.string(),
  current_value: z.number(),
  percent_change: z.number(),
  previous_value: z.number(),
})

export type SeasonalStats = z.infer<typeof seasonalStatsSchema>
export const seasonalStatsSchema = z.object({
  periods: z.object({
    current: seasonsSchema,
    previous: seasonsSchema,
  }),
  stats: z.array(statEntrySchema)
})

export function parseSeasonalStats(stats: unknown): SeasonalStats {
  const result = seasonalStatsSchema.safeParse(stats);
  if (!result.success) {
    throw new Error(z.prettifyError(result.error));
  }
  return result.data
}
