
import * as z from "zod/v4"
import { baseFields } from "./base";
import { strclean } from "../utils";
import { toIso } from "@/core/utils/date";


export const crop_establishments_schema = baseFields.extend({
  ecosystem: z.string().transform(strclean),

  monitoring_field_area_sqm: z.string()
    .refine(val => val !== "N/A", "warning: Review please. Daw ka imposible man nga wala monitoring field area? @everyone")
    .refine(val => !isNaN(parseFloat(val)), "Must be a number")
    .transform(Number),

  actual_crop_establishment_date: z.string().transform(strclean).transform(toIso),
  actual_crop_establishment_method: z.string().transform(strclean),

  sowing_date: z.string()
    .transform(strclean)
    .refine(val => val === "N/A" || !isNaN(Date.parse(val)), "Invalid date")
    .transform(val => val === "N/A" ? undefined : toIso(val)),

  seedling_age_at_transplanting: z.string()
    .optional()
    .refine(val => val === undefined || val === "N/A" || !isNaN(parseFloat(val)), "Must be a number")
    .transform(val => val === undefined || val === "N/A" ? undefined : Number(val)),

  distance_between_plant_row_1: z.string().refine(val => !isNaN(parseFloat(val)), "Must be a number").transform(Number),
  distance_between_plant_row_2: z.string().refine(val => !isNaN(parseFloat(val)), "Must be a number").transform(Number),
  distance_between_plant_row_3: z.string().refine(val => !isNaN(parseFloat(val)), "Must be a number").transform(Number),

  distance_within_plant_row_1: z.string().refine(val => !isNaN(parseFloat(val)), "Must be a number").transform(Number),
  distance_within_plant_row_2: z.string().refine(val => !isNaN(parseFloat(val)), "Must be a number").transform(Number),
  distance_within_plant_row_3: z.string().refine(val => !isNaN(parseFloat(val)), "Must be a number").transform(Number),

  seeding_rate_kg_ha: z.string()
    .refine(val => val === "N/A" || !isNaN(parseFloat(val)), "Must be a number")
    .transform(val => val === "N/A" ? undefined : Number(val)),

  direct_seeding_method: z.string().transform(strclean),

  num_plants_1: z.string().refine(val => !isNaN(parseFloat(val)), "Must be a number").transform(Number),
  num_plants_2: z.string().refine(val => !isNaN(parseFloat(val)), "Must be a number").transform(Number),
  num_plants_3: z.string().refine(val => !isNaN(parseFloat(val)), "Must be a number").transform(Number),

  rice_variety: z.string().transform(strclean),
  rice_variety_no: z.string().transform(strclean),
  rice_variety_maturity_duration: z.string().transform(strclean),
  seed_class: z.string().transform(strclean),
});
