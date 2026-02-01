import { Validator } from "@/core/utils/validator";
import * as z from "zod/v4";

export type BarangayYield = z.infer<typeof barangayYieldSchema>;
const barangayYieldSchema = z.object({
  barangay: z.string(),
  province: z.string(),
  municipality: z.string(),
  avg_yield_t_per_ha: z.number(),
  rank: z.number()
});

export type BarangayYieldRanking = z.infer<typeof barangayYieldRankingSchema>;
export const barangayYieldRankingSchema = z.object({
  top: z.array(barangayYieldSchema),
  bottom: z.array(barangayYieldSchema)
});

export const parseBarangayYieldRanking = Validator.create<BarangayYieldRanking>(barangayYieldRankingSchema, "BarangayYieldRanking")

