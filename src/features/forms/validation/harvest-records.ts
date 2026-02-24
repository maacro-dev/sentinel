import * as z from "zod/v4";
import { baseFields } from "./base";
import { strclean } from "../utils";
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
});
