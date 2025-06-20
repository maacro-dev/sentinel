import { z } from "zod/v4";

const loginFormSchema = z.object({
  username: z.string().trim().min(1, { error: "Username is required to log in" }),
  password: z.string().trim().min(1, { error: "Password is required to log in" })
});

type UserCredentials = z.infer<typeof loginFormSchema>;

export { loginFormSchema };
export type { UserCredentials };
