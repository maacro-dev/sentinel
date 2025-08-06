import * as z from "zod/v4";

export const formsSchema = z.enum([
  "field_plannings",
  "crop_establishments",
  "fertilization_records",
  "harvest_records",
  "damage_assessments",
  "monitoring_visits",
]  as const)
export type Form = z.infer<typeof formsSchema>;
