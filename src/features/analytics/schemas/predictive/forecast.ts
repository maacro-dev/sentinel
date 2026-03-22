import { Validator } from '@/core/utils/validator';
import * as z from "zod/v4"

export const forecastPointSchema = z.object({
  month: z.string(),
  yield: z.number(),
});

export const yieldForecastDataSchema = z.object({
  forecast: z.array(forecastPointSchema),
  total_predicted: z.number(),
  max_monthly: z.number(),
  min_monthly: z.number(),
  avg_monthly: z.number(),
});

export type YieldForecastData = z.infer<typeof yieldForecastDataSchema>;

export const parseYieldForecastData = Validator.create<YieldForecastData>(
  yieldForecastDataSchema,
  'YieldForecastData'
);
