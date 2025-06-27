import {
  enum as enum_,
  object,
  string,
  iso,
  minLength,
  email,
  uuidv4,
  nullable,
  array,
} from "zod/v4-mini";

export const userRoleSchema = enum_([
  "data_collector",
  "data_manager",
  "admin",
  "*",
] as const);

export const userStatusSchema = enum_(["active", "inactive", "disabled"]);

export const userDetailSchema = object({
  auth_id: uuidv4(),
  first_name: string().check(minLength(1)),
  last_name: string().check(minLength(1)),
  username: string().check(minLength(1)),
  status: userStatusSchema,
  role: userRoleSchema,
  email: email(),
  last_sign_in_at: nullable(iso.datetime({ offset: true })),
  created_at: iso.datetime({ offset: true }),
  updated_at: iso.datetime({ offset: true }),
});

export const userSummarySchema = object({
  auth_id: uuidv4(),
  full_name: string(),
  status: userStatusSchema,
  role: userRoleSchema,
  email: email(),
  last_sign_in_at: nullable(iso.datetime({ offset: true })),
});

export const userSummarySchemaArray = array(userSummarySchema);

export const userCredentialsSchema = object({
  username: string().check(minLength(1, "Username is required to log in")),
  password: string().check(minLength(1, "Password is required to log in")),
});

export const userCreateSchema = object({
  first_name: string().check(minLength(1)),
  last_name: string().check(minLength(1)),
  username: string().check(minLength(1)),
  status: userStatusSchema,
  role: userRoleSchema,
  email: email(),
});
