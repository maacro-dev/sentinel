import type { infer as Infer } from "zod/v4-mini";
import type {
  userStatusSchema,
  userCredentialsSchema,
  userRoleSchema,
  userSchema,
  userCreateSchema,
  userDateOfBirthSchema,
} from "@/lib/schemas/user";

export type UserStatus = Infer<typeof userStatusSchema>;
export type UserCredentials = Infer<typeof userCredentialsSchema>;
export type UserDateOfBirth = Infer<typeof userDateOfBirthSchema>;

export type Role = Infer<typeof userRoleSchema>;
export type User = Infer<typeof userSchema>;

export type UserCreate = Infer<typeof userCreateSchema>;
