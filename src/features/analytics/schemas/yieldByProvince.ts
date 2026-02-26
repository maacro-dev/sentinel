import { Validator } from "@/core/utils/validator"
import * as z from "zod/v4"

export const provinceYield = z.object({
  province: z.string(),
  avg_yield_t_per_ha: z.number()
})

export interface ProvinceYield extends z.infer<typeof provinceYield> { }

export const parseProvinceYields = Validator.create<ProvinceYield[]>(z.array(provinceYield))
