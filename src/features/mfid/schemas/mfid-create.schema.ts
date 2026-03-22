import * as z from "zod/v4";

export interface MfidFormInput extends z.infer<typeof mfidFormInputSchema> { }

export const mfidFormInputSchema = z.object({
  city_municipality: z.string().min(1, "City / Municipality is required"),
  province: z.string().min(1, "Province is required"),
})
