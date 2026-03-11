
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

  seeding_rate_kg_ha: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
    .transform(val => val === undefined ? undefined : Number(val)),

  direct_seeding_method: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .transform(strcleanOpt),

  num_plants_1: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
    .transform(val => val === undefined ? undefined : Number(val)),

  num_plants_2: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
    .transform(val => val === undefined ? undefined : Number(val)),

  num_plants_3: z.string().optional()
    .transform(val => val === "N/A" ? undefined : val)
    .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
    .transform(val => val === undefined ? undefined : Number(val)),

  rice_variety: z.string().transform(strclean),
  rice_variety_no: z.string().transform(strclean),
  rice_variety_maturity_duration: z.string().refine(val => !isNaN(parseFloat(val)), "Must be a number").transform(Number),
  seed_class: z.string().transform(strclean),

}).superRefine((data, ctx) => {
  const method = data.actual_crop_establishment_method;
  const isTransplanted = method.includes('transplant');
  const isDirectSeeded = method.includes('direct') && method.includes('seeded'); // adjust as needed

  if (isTransplanted) {
    // Require transplanted-specific fields to be present (not undefined)
    if (data.sowing_date === undefined) {
      ctx.addIssue({ path: ['sowing_date'], message: 'Sowing date required for transplanted method' });
    }
    if (data.seedling_age_at_transplanting === undefined) {
      ctx.addIssue({ path: ['seedling_age_at_transplanting'], message: 'Seedling age required for transplanted method' });
    }
    // Check that distances are present? They might be optional? In DB they are nullable, but maybe they should be required for transplanted. We'll treat as required for transplanted.
    if (data.distance_between_plant_row_1 === undefined) {
      ctx.addIssue({ path: ['distance_between_plant_row_1'], message: 'Required for transplanted' });
    }
    // Similarly for other distances

    // Direct-seeded fields should be undefined
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
    // Require direct-seeded fields
    if (data.seeding_rate_kg_ha === undefined) {
      ctx.addIssue({ path: ['seeding_rate_kg_ha'], message: 'Seeding rate required for direct-seeded method' });
    }
    if (data.direct_seeding_method === undefined) {
      ctx.addIssue({ path: ['direct_seeding_method'], message: 'Direct seeding method required' });
    }
    if (data.num_plants_1 === undefined) {
      ctx.addIssue({ path: ['num_plants_1'], message: 'Number of plants required for direct-seeded' });
    }

    // Transplanted fields should be undefined
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
});
