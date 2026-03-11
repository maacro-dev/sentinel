import { Validator } from '@/core/utils/validator';
import * as z from "zod/v4"

export const yieldVarietyRankingItemSchema = z.object({
  variety: z.string(),
  yield: z.number(),
});

export const yieldVarietyHighestSchema = z.object({
  value: z.number(),
  variety: z.string(),
});

export const yieldVarietyDataSchema = z.object({
  average_yield: z.number(),
  highest_variety: yieldVarietyHighestSchema.nullable(),
  ranking: z.array(yieldVarietyRankingItemSchema),
});

export type YieldVarietyData = z.infer<typeof yieldVarietyDataSchema>;

export const parseYieldVarietyData = Validator.create<YieldVarietyData>(
  yieldVarietyDataSchema,
  'YieldVarietyData'
);
