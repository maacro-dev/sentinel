import { Validator } from "@/core/utils/validator";
import * as z from "zod/v4";

export const formDataEntrySchema = z.object({
  mfid: z.string(),
  season_year: z.string(),
  semester: z.string(),
  id: z.number(),
  field_id: z.number(),
  season_id: z.number(),
  activity_type: z.enum([
    "field-data",
    "cultural-management",
    "nutrient-management",
    "production",
    "damage-assessment",
    "monitoring-visit",
  ]),
  verification_status: z.enum(['pending', 'approved', 'rejected']),
  collected_by: z.nullable(z.string()),
  verified_by: z.nullable(z.string()),
  collected_at: z.iso.datetime({ offset: true }),
  verified_at: z.nullable(z.iso.datetime({ offset: true })),
  synced_at: z.nullable(z.iso.datetime({ offset: true })),
  farmer_name: z.string(),
  barangay: z.string(),
  municipality: z.string(),
  province: z.string(),
  form_data: z.record(z.string(), z.any()),
});

export type FormDataEntry = z.infer<typeof formDataEntrySchema>;
export const formDataSchema = z.array(formDataEntrySchema);

export const parseFormData = Validator.create<FormDataEntry[]>(formDataSchema);
export const parseFormDataEntry = Validator.create<FormDataEntry>(formDataEntrySchema);
