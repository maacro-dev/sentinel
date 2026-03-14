import * as z from "zod/v4"
import { Validator } from '@/core/utils/validator';

export const fertilizerTypeRankingItemSchema = z.object({
  type: z.string(),
  count: z.number(),
});

export const fertilizerTypeMostSchema = z.object({
  type: z.string(),
  count: z.number(),
});

export const fertilizerBrandMostSchema = z.object({
  brand: z.string(),
  count: z.number(),
});

export const fertilizerTypeSummarySchema = z.object({
  total_applications: z.number(),
  most_common_type: fertilizerTypeMostSchema.nullable(),
  most_common_brand: fertilizerBrandMostSchema.nullable(),
  ranking: z.array(fertilizerTypeRankingItemSchema),
});

export type FertilizerTypeSummary = z.infer<typeof fertilizerTypeSummarySchema>;

export const parseFertilizerTypeSummary = Validator.create<FertilizerTypeSummary>(
  fertilizerTypeSummarySchema,
  'FertilizerTypeSummary'
);
