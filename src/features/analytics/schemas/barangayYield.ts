import { Validator } from "@/core/utils/validator";
import * as z from "zod/v4";

export const barangayYieldSchema = z.object({
  barangay: z.string(),
  municipality: z.string(),
  province: z.string(),
  avg_yield_t_per_ha: z.number(),
});

export const barangayYieldRankingResponseSchema = z.object({
  ranking: z.array(barangayYieldSchema),
  overallAverage: z.number(),
});

export type BarangayYield = z.infer<typeof barangayYieldSchema>;
export type BarangayYieldRankingResponse = z.infer<typeof barangayYieldRankingResponseSchema>;

export type BarangayYieldRanking = z.infer<typeof barangayYieldRankingResponseSchema>

export const parseBarangayYieldRanking = Validator.create<BarangayYieldRankingResponse>(
  barangayYieldRankingResponseSchema,
  'BarangayYieldRanking'
);
