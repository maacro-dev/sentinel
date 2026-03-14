import { Validator } from '@/core/utils/validator';
import * as z from "zod/v4";

export const damageByLocationRankingItemSchema = z.object({
  location: z.string(),
  damage_count: z.number(),
  total_affected_area: z.number(),
});

export const damageByLocationHighestSchema = z.object({
  value: z.number(),
  location: z.string(),
});

export const damageByLocationDataSchema = z.object({
  total_damage_reports: z.number(),
  total_affected_area_ha: z.number(),
  highest_affected_area: damageByLocationHighestSchema.nullable(),
  highest_damage_count: damageByLocationHighestSchema.nullable(),
  ranking: z.array(damageByLocationRankingItemSchema),
});

export type DamageByLocationData = z.infer<typeof damageByLocationDataSchema>;

export const parseDamageByLocationData = Validator.create<DamageByLocationData>(
  damageByLocationDataSchema,
  'DamageByLocationData'
);
