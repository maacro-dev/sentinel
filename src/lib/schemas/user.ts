import * as z from "zod/v4-mini";

export const userRoleSchema = z.enum([
  "data_collector",
  "data_manager",
  "admin",
  "*",
] as const);

export const userStatusSchema = z.enum(["active", "inactive", "disabled"]);

export const userSchema = z.object({
  id: z.number(),
  email: z.email(),
  username: z.string().check(z.minLength(1)),
  first_name: z.string().check(z.minLength(1)),
  last_name: z.string().check(z.minLength(1)),
  status: userStatusSchema,
  role: userRoleSchema,
  last_active: z.nullable(z.iso.datetime({ offset: true })),
  created_at: z.iso.datetime({ offset: true }),
  updated_at: z.iso.datetime({ offset: true }),
});

export const userCredentialsSchema = z.object({
  username: z.string().check(z.minLength(1, "Username is required to log in")),
  password: z.string().check(z.minLength(1, "Password is required to log in")),
});

export type Role = z.infer<typeof userRoleSchema>;
export type User = z.infer<typeof userSchema>;
export type UserCredentials = z.infer<typeof userCredentialsSchema>;
