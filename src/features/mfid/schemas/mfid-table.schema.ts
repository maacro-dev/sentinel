import { Validator } from "@/core/utils/validator";
import * as z from "zod/v4"

const mfidStatusSchema = z.enum(["available", "used"])
export const mfidRowSchema = z.object({
  mfid: z.string(),
  created_at: z.string(),
  used_at: z.string().nullable(),
  status: mfidStatusSchema,
  farmer_name: z.string().nullable(),
  barangay: z.string().nullable(),
  city_municipality: z.string().nullable(),
  province: z.string().nullable(),
})

export const mfidTableSchema = z.array(mfidRowSchema);

export type MfidTableRow = z.infer<typeof mfidRowSchema>
export type MfidDetail = Omit<MfidTableRow, "status" | "mfid">
export type MfidStatus = z.infer<typeof mfidStatusSchema>
export type MfidTable = z.infer<typeof mfidTableSchema>

export const parseMfidTable = Validator.create<MfidTableRow[]>(mfidTableSchema);
export const parseMfidTableRow = Validator.create<MfidTableRow>(mfidRowSchema);
