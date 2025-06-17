import { z } from "zod";

const loginFormSchema = z.object({
  username: z.string().trim().min(1, "Username is required to log in"),
  password: z.string().trim().min(1, "Password is required to log in"),
});

type LoginFields = z.infer<typeof loginFormSchema>;

export { loginFormSchema };
export type { LoginFields };
