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

export const activityTypeSchema = z.enum([
  "field-data",
  "cultural-management",
  "nutrient-management",
  "production",
  "damage-assessment",
  "monitoring-visit",
]  as const)

export type ActivityType = z.infer<typeof activityTypeSchema>;

export const getActivityTypeFromForm = (form: Form | null | undefined): string | null => {
  if (!form) return null;
  const mapping: Record<Form, string> = {
    field_plannings: 'field-data',
    crop_establishments: 'cultural-management',
    fertilization_records: 'nutrient-management',
    harvest_records: 'production',
    damage_assessments: 'damage-assessment',
    monitoring_visits: 'monitoring-visit',
  };
  return mapping[form];
};

export const CORE_METADATA_TYPES = [
  "field-data",
  "cultural-management",
  "nutrient-management",
  "production",
  "damage-assessment",
] as const;

export type CoreMetadataType = typeof CORE_METADATA_TYPES[number];
