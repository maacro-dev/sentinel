import { z } from "zod/v4";
import { baseFields } from "./base";
import { strcleanOpt } from "../utils";

export const damage_assessments_schema = baseFields.extend({
  cause: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .transform(strcleanOpt),

  crop_stage: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .transform(strcleanOpt),

  soil_type: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .transform(strcleanOpt),

  severity: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .transform(strcleanOpt),

  affected_area_ha: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
    .transform(val => val === undefined ? undefined : Number(val))
    .refine(val => val === undefined || (val >= 0.01 && val <= 100), { message: "Affected area must be between 0.01 and 100 hectares" }),

  observed_pest: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .transform(strcleanOpt),
});
