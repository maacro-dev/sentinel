import { FieldSchema } from "../schemas/import-schema";
import { baseFieldsValidation } from "./base";

export const cropEstablishmentsValidation: FieldSchema[] = [
  ...baseFieldsValidation,

  { name: 'ecosystem' },
  {
    name: 'monitoring_field_area_sqm',
    validate: (v) => {
      if (v === "N/A") return "warning: Review please. Daw ka imposible man nga wala monitoring field area? @everyone"
      return isNaN(parseFloat(v)) ? 'Must be a number' : null
    }
  },
  // { name: 'actual_land_preparation_method' },
  { name: 'actual_crop_establishment_date' },
  { name: 'actual_crop_establishment_method' },
  { name: 'sowing_date' },
  {
    name: 'seedling_age_at_transplanting',
    validate: (v) => {
      if (v == "N/A") return null;
      return isNaN(parseFloat(v)) ? 'Must be a number' : null
    },
    required: false
  },
  { name: 'distance_between_plant_row_1', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'distance_between_plant_row_2', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'distance_between_plant_row_3', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'distance_within_plant_row_1', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'distance_within_plant_row_2', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'distance_within_plant_row_3', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  {
    name: 'seeding_rate_kg_ha',
    validate: (v) => {
      if (v == "N/A") return null;
      return isNaN(parseFloat(v)) ? 'Must be a number' : null
    },
  },
  { name: 'direct_seeding_method' },
  { name: 'num_plants_1', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'num_plants_2', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'num_plants_3', validate: (v) => isNaN(parseFloat(v)) ? 'Must be a number' : null },
  { name: 'rice_variety' },
  { name: 'rice_variety_no' },
  { name: 'rice_variety_maturity_duration' },
  { name: 'seed_class' },
]
