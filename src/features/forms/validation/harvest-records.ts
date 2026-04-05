import * as z from "zod/v4";
import { baseFields } from "./base";
import { strclean, strcleanOpt } from "../utils";
import { toIso } from "@/core/utils/date";
import leven from "leven";

const VALID_METHODS = ["Mechanical", "Manual"];

export const harvest_records_schema = baseFields.extend({
  harvest_date: z.string().transform(strclean).transform(toIso),

  harvesting_method: z.string()
    .transform(str => {
      const cleaned = strclean(str);
      let closest = VALID_METHODS[0];
      let minDistance = Infinity;

      for (const method of VALID_METHODS) {
        const dist = leven(cleaned.toLowerCase(), method.toLowerCase());
        if (dist < minDistance) {
          minDistance = dist;
          closest = method;
        }
      }

      return closest;
    }),

  bags_harvested: z.string()
    .refine(val => !isNaN(parseFloat(val)), "Must be a number")
    .transform(Number),

  avg_bag_weight_kg: z.string()
    .refine(val => !isNaN(parseFloat(val)), "Must be a number")
    .transform(Number),

  area_harvested_ha: z.string()
    .refine(val => !isNaN(parseFloat(val)), "Must be a number")
    .transform(Number),

  irrigation_supply: z.string().transform(strclean),

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
  if (data.crop_stage === "Not Yet Planted" && data.avg_plant_height !== "") {
    issues.push({
      code: "custom",
      path: ["avg_plant_height"],
      message: "When crop stage is 'Not Yet Planted', average plant height must be 'N/A'",
      input: data.avg_plant_height,
    });
  }
});
