import { minLength, z } from "zod/v4-mini";

export const credentialsSchema = z.object({
  email: z.string().check(minLength(1, "Email is required")),
  password: z.string().check(minLength(1, "Password is required")),
})

export type Credentials = z.infer<typeof credentialsSchema>;
