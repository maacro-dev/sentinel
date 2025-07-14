import type { infer as Infer } from "zod/v4-mini";
import { fieldSchema, fieldsSchema } from "../schemas/field";


export type Field = Infer<typeof fieldSchema>
export type Fields = Infer<typeof fieldsSchema>
