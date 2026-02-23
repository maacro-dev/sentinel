import { isAtLeastAge, isValidDate, toIso } from "@/core/utils/date";
import { FieldSchema } from "../schemas/import-schema";
import { baseFieldsValidation, baseFields } from "./base";
import { field, strclean, zodNumberRange } from "../utils";
import * as z from "zod/v4"


export const fieldPlanningsValidation: FieldSchema[] = [
  ...baseFieldsValidation,

  field({ name: 'gender' }),

  {
    name: 'date_of_birth',
    validate: (v) => {
      if (!v) return null;
      const age = Math.floor((new Date().getTime() - new Date(v).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return age >= 16 ? null : 'Must be at least 16 years old';
    }
  },
  {
    name: 'cellphone_no', validate: (v) => {
      if (!v) return null;
      return /^(09|\+639)\d{9}$/.test(v.replace(/\s/g, '')) ? null : 'Must be a valid PH number (09... or +639...)';
    }
  },
  { name: 'land_preparation_start_date' },
  {
    name: 'est_crop_establishment_date', validate: (v, row) => {
      if (!v || !row.land_preparation_start_date) return null;
      if (!isValidDate(v)) return "Must be a valid date";
      return new Date(v) >= new Date(row.land_preparation_start_date) ? null : 'Must be after land preparation start date';
    }
  },
  { name: 'est_crop_establishment_method' },
  {
    name: 'total_field_area_ha', validate: (v) => {
      if (!v) return null;
      if (v == "N/A") return "warning: @arjay - makwa ka data nga wala man sa gali area?"
      const num = parseFloat(v);
      if (isNaN(num)) return 'Must be a number';
      if (num < 0.04) return 'Must be at least 0.04 hectares';
      if (num > 20) return 'warning: Exceeds 20 hectares'; // we can handle warnings separately
      return null;
    }
  },
  { name: 'soil_type' },
  { name: 'current_field_condition' },
]



export const field_plannings_schema = baseFields.extend({

  gender: z.string().transform(strclean), // todo

  cellphone_no: z.string()
    .regex(/^(09|\+639)\d{9}$/, 'Must be a valid PH number (09... or +639...)')
    .transform(strclean),

  est_crop_establishment_method: z.string().transform(strclean),

  soil_type: z.string().transform(strclean),

  current_field_condition: z.string().transform(strclean),

  date_of_birth: z
    .string()
    .refine(val => isAtLeastAge(val, 16), "Must be at least 16 years old")
    .transform(toIso),

  land_preparation_start_date: z.string().transform(strclean).transform(toIso),

  est_crop_establishment_date: z.string().transform(strclean).transform(toIso),

  total_field_area_ha: zodNumberRange(0.04, 20),

}).check(({ value: data, issues }) => {
  if (
    data.est_crop_establishment_date && data.land_preparation_start_date &&
    new Date(data.est_crop_establishment_date) < new Date(data.land_preparation_start_date)
  ) {
    issues.push({
      code: "custom",
      path: ["est_crop_establishment_date"],
      message: "Must be after land preparation start date",
      input: data.est_crop_establishment_date,
    });
  }
});
