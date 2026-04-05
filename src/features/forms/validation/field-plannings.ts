import { isAtLeastAge, toIso } from "@/core/utils/date";
import { baseFields } from "./base";
import { strclean, strcleanOpt, zodNumberRange } from "../utils";
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


  crop_stage: z.string().optional()
    .transform(strcleanOpt)
    .refine(
      val => !val || ["Not Yet Planted", "Emerging", "Vegetative", "Flowering", "Harvest Ready"].includes(val),
      { message: "Invalid crop stage. Allowed: Not Yet Planted, Emerging, Vegetative, Flowering, Harvest Ready" }
    ),

  soil_moisture_status: z.string().optional()
    .transform(strcleanOpt)
    .refine(
      val => !val || ["Dry", "Moist", "Wet", "Flooded"].includes(val),
      { message: "Invalid soil moisture status. Allowed: Dry, Moist, Wet, Flooded" }
    ),

  avg_plant_height: z.string().optional()
    .transform(val => {
      if (!val) return "";
      const trimmed = val.trim();
      if (trimmed === "0" || trimmed === "0.0" || trimmed.toLowerCase() === "n/a") return "";
      return trimmed;
    })
    .transform(strcleanOpt)
    .refine(
      val => !val || /^\d+(\.\d+)?$/.test(val),
      { message: "Average plant height must be 'N/A' or a positive number" }
    ),

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

  if (data.crop_stage === "Not Yet Planted" && data.avg_plant_height !== "") {
    issues.push({
      code: "custom",
      path: ["avg_plant_height"],
      message: "When crop stage is 'Not Yet Planted', average plant height must be 'N/A'",
      input: data.avg_plant_height,
    });
  }
});
