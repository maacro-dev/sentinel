import { z } from "zod/v4";
import { Validator } from "@/core/utils/validator";

export const riceVarietySummarySchema = z.object({
  nsic_count: z.number(),
  psb_count: z.number(),
  other_count: z.number(),
  total: z.number(),
  dominant: z.enum(['NSIC', 'PSB', 'Others', 'None']),
  percent_difference: z.number(),
});

export type RiceVarietySummary = z.infer<typeof riceVarietySummarySchema>;

export const parseRiceVarietySummary = Validator.create<RiceVarietySummary>(
  riceVarietySummarySchema,
  'RiceVarietySummary'
);
