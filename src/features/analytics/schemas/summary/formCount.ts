import * as z from "zod/v4";
import { Validator } from "@/core/utils/validator";
import { formsSchema } from "@/features/forms/schemas/forms";
import { withSeasonTrend } from "../utils";

export const formCountEntry = z.object({
  form: z.enum([...formsSchema.options, "total" as const]),
  count: z.number(),
});
export type FormCount = z.infer<typeof formCountEntry>;

export const formCountSummarySchema = withSeasonTrend(formCountEntry);
export type FormCountSummary = z.infer<typeof formCountSummarySchema>;

export const parseFormCountSummary =
    Validator.create<FormCountSummary>(formCountSummarySchema);
