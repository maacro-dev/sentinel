import { FieldSchema } from "../schemas/import-schema";
import { baseFieldsValidation } from "./base";

export const harvestRecordsValidation: FieldSchema[] = [

  ...baseFieldsValidation,

  { name: 'harvest_date' },
  { name: 'harvesting_method' },
  { name: 'bags_harvested', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'avg_bag_weight_kg', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'area_harvested_ha', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'irrigation_supply' },
]
