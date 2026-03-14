import { Validator } from '@/core/utils/validator';
import * as z from "zod/v4"

export const damageByCauseRankingItemSchema = z.object({
  cause: z.string(),
  damage_count: z.number(),
  total_affected_area: z.number(),
});

export const damageByCauseHighestSchema = z.object({
  value: z.number(),
  cause: z.string(),
});

export const damageByCauseDataSchema = z.object({
  total_damage_reports: z.number(),
  total_affected_area_ha: z.number(),
  highest_damage_count: damageByCauseHighestSchema.nullable(),
  highest_affected_area: damageByCauseHighestSchema.nullable(),
  ranking: z.array(damageByCauseRankingItemSchema),
});

export type DamageByCauseData = z.infer<typeof damageByCauseDataSchema>;

export const parseDamageByCauseData = Validator.create<DamageByCauseData>(
  damageByCauseDataSchema,
  'DamageByCauseData'
);
