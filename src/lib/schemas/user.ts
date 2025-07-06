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

export const userDateOfBirthSchema = string().check(regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in the format YYYY-MM-DD"));

export const userSchema = object({
  // id: number(),
  // auth_id: uuidv4(),
  id: uuidv4(),
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
  email: string().check(minLength(1, "Email is required to log in")),
  password: string().check(minLength(1, "Password is required to log in")),
});

export const userCreateSchema = object({
  first_name: string().check(minLength(1, "First name is required")),
  last_name: string().check(minLength(1, "Last name is required")),
  role: userRoleSchema,
  date_of_birth: userDateOfBirthSchema,
  email: email("Please enter a valid email address"),
});
