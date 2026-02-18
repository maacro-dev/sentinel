import { FieldSchema } from "../schemas/import-schema";
import { baseFieldsValidation } from "./base";

export const monitoringVisitsValidation: FieldSchema[] = [

  ...baseFieldsValidation,

  { name: 'cause' },
  { name: 'crop_stage' },
  { name: 'soil_type' },
  { name: 'severity' },
  { name: 'affected_area_ha', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'observed_pest' },
]
