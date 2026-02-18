import { FieldSchema } from "../schemas/import-schema";
import { baseFieldsValidation } from "./base";

export const damageAssessmentsValidation: FieldSchema[] = [

  ...baseFieldsValidation,

  { name: 'date_monitored' },
  { name: 'crop_stage' },
  { name: 'soil_moisture_status' },
  { name: 'avg_plant_height', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
]
