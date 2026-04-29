import { Validator } from "@/core/utils/validator"
import * as z from "zod/v4"

export const provinceYield = z.object({
  province: z.string(),
  avg_yield_t_per_ha: z.number()
})

export const barangayYield = z.object({
  province: z.string(),
  municipality: z.string(),
  barangay: z.string(),
  avg_yield_t_per_ha: z.number()
})

export interface ProvinceYield extends z.infer<typeof provinceYield> { }

export interface BarangayYield extends z.infer<typeof barangayYield> { }

export const parseProvinceYields = Validator.create<ProvinceYield[]>(z.array(provinceYield))

export const parseBarangayYields = Validator.create<BarangayYield[]>(z.array(barangayYield))



export const barangayYieldNode = z.object({
  barangay: z.string(),
  avg_yield_t_per_ha: z.number(),
});

export const municipalityYieldNode = z.object({
  municipality: z.string(),
  avg_yield_t_per_ha: z.number(),
  barangays: z.array(barangayYieldNode),
});

export const provinceYieldNode = z.object({
  province: z.string(),
  avg_yield_t_per_ha: z.number(),
  municipalities: z.array(municipalityYieldNode),
});

export type BarangayYieldNode = z.infer<typeof barangayYieldNode>;
export type MunicipalityYieldNode = z.infer<typeof municipalityYieldNode>;
export type ProvinceYieldNode = z.infer<typeof provinceYieldNode>;

export const parseHierarchicalYields = Validator.create<ProvinceYieldNode[]>(
  z.array(provinceYieldNode)
);
