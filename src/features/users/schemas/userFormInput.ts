import * as z from "zod/v4";
import { roleSchema } from "./role";

export interface UserFormInput extends z.infer<typeof userFormInputSchema> {}

export const userFormInputSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email").min(1, "Email is required"),
  date_of_birth: z.iso.date().refine((dob) => {
    const birth = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 16;
  }, {
    message: "Must be at least 16 years old",
  }),
  role: roleSchema,
});
