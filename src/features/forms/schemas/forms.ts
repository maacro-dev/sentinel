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

export const getFormTypeFromForm = (form: Form | null | undefined): string | null => {
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
