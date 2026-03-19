import * as z from "zod/v4";
import { Validator } from "@/core/utils/validator";

// Schema for the status counts inside each form
const statusCountsSchema = z.object({
  approved: z.number(),
  rejected: z.number(),
  pending: z.number(),
  unknown: z.number(),
});

const formCountsSchema = z.record(z.string(), statusCountsSchema)

export const formCountSummarySchema = z.object({
  season: z.object({
    start_date: z.string(),
    end_date: z.string(),
    semester: z.string(),
    season_year: z.string(),
  }),
  data: formCountsSchema,
});


export type FormCountSummary = z.infer<typeof formCountSummarySchema>;

export type FormCounts = z.infer<typeof formCountsSchema>;


export const parseFormCountSummary = Validator.create<FormCountSummary>(formCountSummarySchema);
