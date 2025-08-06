import * as z from "zod/v4";

export const credentialsSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
})

export type Credentials = z.infer<typeof credentialsSchema>;
