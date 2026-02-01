import * as z from "zod/v4";

export interface MfidFormInput extends z.infer<typeof mfidFormInputSchema> { }

// TODO: get from DB
export const mfidFormInputSchema = z.object({
  barangay: z.string({
    error: (issue) => issue.input === undefined
      ? "This field is required"
      : "Not a string"
  }).min(1, "Barangay is required"),

  city_municipality: z.string().min(1, "City / Municipality is required"),

  province: z.string().min(1, "Province is required"),
})
