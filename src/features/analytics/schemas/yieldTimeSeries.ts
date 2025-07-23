import * as z from "zod/v4-mini"

export type YieldTimeSeries = z.infer<typeof yieldTimeSeriesSchema>
export const yieldTimeSeriesSchema = z.array(
  z.object({
    month_year: z.string(),
    avg_yield_t_ha: z.number(),
  })
)

export function parseYieldTimeSeries(stats: unknown): YieldTimeSeries {
  const result = yieldTimeSeriesSchema.safeParse(stats);
  if (!result.success) {
    throw new Error(z.prettifyError(result.error));
  }
  return result.data
}
