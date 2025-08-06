import * as z from "zod/v4";
import { roleSchema } from "./role";

export interface UserFormInput extends z.infer<typeof userFormInputSchema> {}

export const userFormInputSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email").min(1, "Email is required"),
  date_of_birth: z.iso.date(),
  role: roleSchema,
})
