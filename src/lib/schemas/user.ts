import z from "zod/v4";

export const userRoleSchema = z.enum([
  "data_collector",
  "data_manager",
  "admin",
  "*"
] as const);

export const userSchema = z
  .object({
    id: z.number(),
    email: z.email(),
    username: z.string().min(1),
    fname: z.string().min(1),
    lname: z.string().min(1),
    role: userRoleSchema
  })
  .transform((user) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.fname,
    lastName: user.lname,
    role: user.role
  }));

export const userCredentialsSchema = z.object({
  username: z.string().min(1, { message: "Username is required to log in" }),
  password: z.string().min(1, { message: "Password is required to log in" })
});
