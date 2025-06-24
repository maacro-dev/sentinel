import {
  enum as enum_,
  object,
  number,
  string,
  iso,
  nullable,
  minLength,
  email,
} from "zod/v4-mini";

export const userRoleSchema = enum_([
  "data_collector",
  "data_manager",
  "admin",
  "*",
] as const);

export const userStatusSchema = enum_(["active", "inactive", "disabled"]);

export const userSchema = object({
  id: number(),
  email: email(),
  username: string().check(minLength(1)),
  first_name: string().check(minLength(1)),
  last_name: string().check(minLength(1)),
  status: userStatusSchema,
  role: userRoleSchema,
  last_active: nullable(iso.datetime({ offset: true })),
  created_at: iso.datetime({ offset: true }),
  updated_at: iso.datetime({ offset: true }),
});

export const userCredentialsSchema = object({
  username: string().check(minLength(1, "Username is required to log in")),
  password: string().check(minLength(1, "Password is required to log in")),
});
