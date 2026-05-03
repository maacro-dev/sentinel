import * as z from "zod/v4"

export const analyticsSeasonSearchSchema = z.object({
  seasonId: z
    .coerce.number()
    .or(z.literal("all"))
    .optional()
    .catch(undefined),
});

export interface AnalyticsSeasonSearch extends z.infer<typeof analyticsSeasonSearchSchema> { }
