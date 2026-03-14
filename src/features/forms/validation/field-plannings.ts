import { isAtLeastAge, toIso } from "@/core/utils/date";
import { baseFields } from "./base";
import { strclean, zodNumberRange } from "../utils";
import * as z from "zod/v4"

export const field_plannings_schema = baseFields.extend({

  gender: z.string().transform(strclean),

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
