import * as z from "zod/v4"

export const analyticsSeasonSearchSchema = z.object({
  seasonId: z.coerce.number().optional()
})

export interface AnalyticsSeasonSearch extends z.infer<typeof analyticsSeasonSearchSchema> { }
