import { Validator } from '@/core/utils/validator';
import * as z from "zod/v4"

export const predictedYieldLocationRankingItemSchema = z.object({
  location: z.string(),
  yield: z.number(),
});

export const predictedYieldLocationHighestSchema = z.object({
  value: z.number(),
  location: z.string(),
});

export const predictedYieldLocationDataSchema = z.object({
  average_yield: z.number(),
  highest_yield: predictedYieldLocationHighestSchema.nullable(),
  lowest_yield: predictedYieldLocationHighestSchema.nullable(),
  gap_percentage: z.number(),
  ranking: z.array(predictedYieldLocationRankingItemSchema),
});

export type PredictedYieldLocationData = z.infer<typeof predictedYieldLocationDataSchema>;

export const parsePredictedYieldLocationData = Validator.create<PredictedYieldLocationData>(
  predictedYieldLocationDataSchema,
  'PredictedYieldLocationData'
);
