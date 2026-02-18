import { FieldSchema } from "../schemas/import-schema";
import { baseFieldsValidation } from "./base";

export const fertilizationRecordsValidation: FieldSchema[] = [


  ...baseFieldsValidation,

  { name: 'fertilizer_type' },
  { name: 'brand' },
  { name: 'nitrogen_content_pct', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'phosphorus_content_pct', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'potassium_content_pct', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'amount_applied', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'amount_unit' },
  { name: 'crop_stage_on_application' },
  { name: 'applied_area_sqm', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'collected_by' },
  { name: 'collected_at' },
]
