import { Validator } from '@/core/utils/validator';
import * as z from "zod/v4"

export const forecastPointSchema = z.object({
  month: z.string(),
  total_yield: z.number(),
  field_count: z.number(),
  avg_yield_per_field: z.number(),
});

export const yieldForecastDataSchema = z.object({
  forecast: z.array(forecastPointSchema),
  total_predicted: z.number(),
  max_monthly: z.number(),
  min_monthly: z.number(),
  avg_monthly: z.number(),
  overall_avg_yield_per_field: z.number(),
});

export type YieldForecastData = z.infer<typeof yieldForecastDataSchema>;

export const parseYieldForecastData = Validator.create<YieldForecastData>(
  yieldForecastDataSchema,
  'YieldForecastData'
);
