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
  regex,
} from "zod/v4-mini";

export const userRoleSchema = enum_(["data_collector", "data_manager", "admin", "*"] as const);

export const userStatusSchema = enum_(["active", "inactive", "disabled"]);

export const userIdSchema = string().check(regex(/^DA\d{5}$/));

export const userSchema = object({
  auth_id: uuidv4(),
  user_id: userIdSchema,
  first_name: string().check(minLength(1)),
  last_name: string().check(minLength(1)),
  status: userStatusSchema,
  role: userRoleSchema,
  email: email(),
  last_sign_in_at: nullable(iso.datetime({ offset: true })),
  created_at: iso.datetime({ offset: true }),
  updated_at: iso.datetime({ offset: true }),
});

export const usersSchema = array(userSchema);

export const userCredentialsSchema = object({
  user_id: string().check(minLength(1, "User ID is required to log in")),
  password: string().check(minLength(1, "Password is required to log in")),
});

export const userCreateSchema = object({
  first_name: string().check(minLength(1)),
  last_name: string().check(minLength(1)),
  role: userRoleSchema,
  date_of_birth: iso.date(),
  email: email(),
});
