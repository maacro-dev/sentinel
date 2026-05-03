import * as z from "zod/v4";
import { Validator } from "@/core/utils/validator";

export const overallYieldPointSchema = z.object({
  date: z.coerce.date(),
  avg_yield_t_ha: z.number(),
});
export type OverallYieldPoint = z.infer<typeof overallYieldPointSchema>;

export const overallYieldTrendSchema = z.array(overallYieldPointSchema);
export type OverallYieldTrend = z.infer<typeof overallYieldTrendSchema>;

export const parseOverallYieldTrend = Validator.create<OverallYieldTrend>(
  overallYieldTrendSchema,
  "OverallYieldTrend"
);
