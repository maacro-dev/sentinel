import { Validator } from "@/core/utils/validator";
import * as z from "zod/v4"

export const cropMethodSummarySchema = z.object({
  direct_seeded_count: z.number(),
  transplanted_count: z.number(),
  total: z.number(),
  percent_difference: z.number(),
});

export type CropMethodSummary = z.infer<typeof cropMethodSummarySchema>;

export const parseCropMethodSummary = Validator.create<CropMethodSummary>(
  cropMethodSummarySchema,
  'CropMethodSummary'
);
