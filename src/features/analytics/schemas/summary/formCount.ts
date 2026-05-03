import * as z from "zod/v4";
import { Validator } from "@/core/utils/validator";

const formCountSummarySchema = z.record(
  z.string(),
  z.object({
    approved: z.number(),
    rejected: z.number(),
    pending: z.number(),
    unknown: z.number(),
  })
);
export type FormCountSummary = z.infer<typeof formCountSummarySchema>;
export const parseFormCountSummary = Validator.create<FormCountSummary>(
  formCountSummarySchema,
  'FormCountSummary'
);
