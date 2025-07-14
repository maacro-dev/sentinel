import { array, iso, number, object, string } from "zod/v4-mini";

export const fieldSchema = object({
  field_id: number(),
  mfid: string(),
  farmer_first_name: string(),
  farmer_last_name: string(),
  barangay: string(),
  municipality: string(),
  province: string(),
  created_at: iso.datetime({ offset: true }),
  updated_at: iso.datetime({ offset: true }),
})

export const fieldsSchema = array(fieldSchema)
