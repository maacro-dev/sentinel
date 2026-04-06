
import * as z from "zod/v4"
import { baseFields } from "./base";
import { strclean, strcleanOpt } from "../utils";
import { toIso } from "@/core/utils/date";

export const crop_establishments_schema = baseFields.extend({
  ecosystem: z.string().transform(strclean),

  monitoring_field_area_sqm: z.string()
    .refine(val => val !== "N/A", "Monitoring field area cannot be N/A")
    .refine(val => !isNaN(parseFloat(val)), "Must be a number")
    .transform(Number),

  // actual_land_preparation_method: z.string().transform(strclean), // missing from provided schema, add

  actual_crop_establishment_date: z.string().transform(strclean).transform(toIso),

  actual_crop_establishment_method: z.string().transform(strclean).transform(val => val.toLowerCase()),

  sowing_date: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || !isNaN(Date.parse(val)), "Invalid date")
    .transform(val => val ? toIso(val) : undefined),

  seedling_age_at_transplanting: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
    .transform(val => val === undefined ? undefined : Number(val)),

  distance_between_plant_row_1: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
    .transform(val => val === undefined ? undefined : Number(val)),

  distance_between_plant_row_2: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
    .transform(val => val === undefined ? undefined : Number(val)),

  distance_between_plant_row_3: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
    .transform(val => val === undefined ? undefined : Number(val)),

  distance_within_plant_row_1: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
    .transform(val => val === undefined ? undefined : Number(val)),

  distance_within_plant_row_2: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
    .transform(val => val === undefined ? undefined : Number(val)),

  distance_within_plant_row_3: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
    .transform(val => val === undefined ? undefined : Number(val)),

  seeding_rate_kg_ha: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
    .transform(val => val === undefined ? undefined : Number(val)),

  direct_seeding_method: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .transform(strcleanOpt),

  num_plants_1: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || Number.isInteger(Number(val)), "Must be a whole number")
    .transform(val => val === undefined ? undefined : Number(val)),

  num_plants_2: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || Number.isInteger(Number(val)), "Must be a whole number")
    .transform(val => val === undefined ? undefined : Number(val)),

  num_plants_3: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || Number.isInteger(Number(val)), "Must be a whole number")
    .transform(val => val === undefined ? undefined : Number(val)),

  rice_variety: z.string().transform(strclean),
  rice_variety_no: z.string().transform(strclean),
  rice_variety_maturity_duration: z.string().refine(val => !isNaN(parseFloat(val)), "Must be a number").transform(Number),
  seed_class: z.string().transform(strclean),


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

}).superRefine((data, ctx) => {
  const method = data.actual_crop_establishment_method;
  const isTransplanted = method.includes('transplant');
  const isDirectSeeded = method.includes('direct') && method.includes('seeded'); // adjust as needed

  if (isTransplanted) {
    if (data.sowing_date === undefined) {
      ctx.addIssue({ path: ['sowing_date'], message: 'Sowing date required for transplanted method' });
    }
    if (data.seedling_age_at_transplanting === undefined) {
      ctx.addIssue({ path: ['seedling_age_at_transplanting'], message: 'Seedling age required for transplanted method' });
    }
    if (data.distance_between_plant_row_1 === undefined) {
      ctx.addIssue({ path: ['distance_between_plant_row_1'], message: 'Required for transplanted' });
    }
    if (data.distance_between_plant_row_2 === undefined) {
      ctx.addIssue({ path: ['distance_between_plant_row_2'], message: 'Required for transplanted' });
    }
    if (data.distance_between_plant_row_3 === undefined) {
      ctx.addIssue({ path: ['distance_between_plant_row_3'], message: 'Required for transplanted' });
    }

    if (data.distance_within_plant_row_1 === undefined) {
      ctx.addIssue({ path: ['distance_within_plant_row_1'], message: 'Required for transplanted' });
    }
    if (data.distance_within_plant_row_2 === undefined) {
      ctx.addIssue({ path: ['distance_within_plant_row_2'], message: 'Required for transplanted' });
    }
    if (data.distance_within_plant_row_3 === undefined) {
      ctx.addIssue({ path: ['distance_within_plant_row_3'], message: 'Required for transplanted' });
    }


    if (data.seeding_rate_kg_ha !== undefined) {
      ctx.addIssue({ path: ['seeding_rate_kg_ha'], message: 'Should be N/A for transplanted method' });
    }
    if (data.direct_seeding_method !== undefined) {
      ctx.addIssue({ path: ['direct_seeding_method'], message: 'Should be N/A for transplanted method' });
    }
    if (data.num_plants_1 !== undefined) {
      ctx.addIssue({ path: ['num_plants_1'], message: 'Should be N/A for transplanted method' });
    }
  } else if (isDirectSeeded) {

    if (data.seeding_rate_kg_ha === undefined) {
      ctx.addIssue({ path: ['seeding_rate_kg_ha'], message: 'Seeding rate required for direct-seeded method' });
    }
    if (data.direct_seeding_method === undefined) {
      ctx.addIssue({ path: ['direct_seeding_method'], message: 'Direct seeding method required' });
    }
    if (data.num_plants_1 === undefined) {
      ctx.addIssue({ path: ['num_plants_1'], message: 'Number of plants required for direct-seeded' });
    }

    if (data.sowing_date !== undefined) {
      ctx.addIssue({ path: ['sowing_date'], message: 'Should be N/A for direct-seeded method' });
    }
    if (data.seedling_age_at_transplanting !== undefined) {
      ctx.addIssue({ path: ['seedling_age_at_transplanting'], message: 'Should be N/A for direct-seeded method' });
    }
    if (data.distance_between_plant_row_1 !== undefined) {
      ctx.addIssue({ path: ['distance_between_plant_row_1'], message: 'Should be N/A for direct-seeded method' });
    }
  } else {
    ctx.addIssue({ path: ['actual_crop_establishment_method'], message: 'Method must be either transplanted or direct-seeded' });
  }

  if (data.crop_stage === "Not Yet Planted" && data.avg_plant_height !== "") {
    ctx.addIssue({
      code: "custom",
      path: ["avg_plant_height"],
      message: "When crop stage is 'Not Yet Planted', average plant height must be 'N/A'",
      input: data.avg_plant_height,
    });
  }
});
