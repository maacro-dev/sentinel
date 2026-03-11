import * as z from 'zod/v4';
import { Validator } from '@/core/utils/validator';

export const yieldLocationRankingItemSchema = z.object({
  location: z.string(),
  yield: z.number(),
});

export const yieldLocationExtremeSchema = z.object({
  value: z.number(),
  location: z.string(),
});

export const yieldLocationDataSchema = z.object({
  average_yield: z.number(),
  highest_yield: yieldLocationExtremeSchema.nullable(),
  lowest_yield: yieldLocationExtremeSchema.nullable(),
  gap_percentage: z.number(),
  ranking: z.array(yieldLocationRankingItemSchema),
});

export type YieldByLocationData = z.infer<typeof yieldLocationDataSchema>;

export const parseYieldByLocationData = Validator.create<YieldByLocationData>(
  yieldLocationDataSchema,
  'YieldByLocationData'
);
