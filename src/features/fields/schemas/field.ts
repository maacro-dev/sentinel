import * as z from "zod/v4-mini";

export type Field = z.infer<typeof fieldSchema>
export const fieldSchema = z.object({
  field_id: z.number(),
  mfid: z.string(),
  farmer_first_name: z.string(),
  farmer_last_name: z.string(),
  barangay: z.string(),
  municipality: z.string(),
  province: z.string(),
  created_at: z.iso.datetime({ offset: true }),
  updated_at: z.iso.datetime({ offset: true }),
})

export const fieldArraySchema = z.array(fieldSchema)

export function parseFieldArray(data: any) {
  const parsedData = fieldArraySchema.safeParse(data)
  if (!parsedData.success) {
    throw new Error(z.prettifyError(parsedData.error))
  }
  return parsedData.data
}
