import { Validator } from "@/core/utils/validator";
import * as z from "zod/v4";


export const formDataEntryResponseSchema = z.object({
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

const collectionSchema = z.object({
  farmer: z.string(),
  collectedBy: z.string(),
  collectedAt: z.string(),
  verifiedBy: z.string().nullable()
});

const fieldSchema = z.object({
  mfid: z.string(),
  barangay: z.string(),
  municipality: z.string(),
  province: z.string()
});

const seasonSchema = z.object({
  semester: z.string(),
  year: z.string(),
  verifiedAt: z.string().nullable(),
  syncedAt: z.string().nullable()
});

const activitySchema = z.object({
  type: z.string(),
  verificationStatus: z.string(),
  formData: z.any()
});

export const formDataEntrySchema = formDataEntryResponseSchema.transform((data) => ({
  collection: {
    farmer: data.farmer_name,
    collectedBy: data.collected_by,
    collectedAt: data.collected_at,
    verifiedBy: data.verified_by
  } as Collection,
  field: {
    mfid: data.mfid,
    barangay: data.barangay,
    municipality: data.municipality,
    province: data.province
  } as Field,
  season: {
    semester: data.semester,
    year: data.season_year,
    verifiedAt: data.verified_at,
    syncedAt: data.synced_at
  } as Season,
  activity: {
    type: data.activity_type,
    verificationStatus: data.verification_status,
    formData: data.form_data
  } as Activity
}));

export type Collection = z.infer<typeof collectionSchema>;
export type Field = z.infer<typeof fieldSchema>;
export type Season = z.infer<typeof seasonSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type FormData = Activity["formData"];

export type FormDataGroup = Collection | Field | Season | Activity;

export type FormDataEntry = z.infer<typeof formDataEntrySchema>;
export const formDataSchema = z.array(formDataEntrySchema);

export const parseFormData = Validator.create<FormDataEntry[]>(formDataSchema);
export const parseFormDataEntry = Validator.create<FormDataEntry>(formDataEntrySchema);
