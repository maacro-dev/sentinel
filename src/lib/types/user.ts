import type { infer as Infer } from "zod/v4-mini";
import type {
  userRoleSchema,
  userStatusSchema,
  userSchema,
  userSchemaArray,
  userCredentialsSchema,
  userCreateSchema,
} from "@/lib/schemas/user";

export type Role = Infer<typeof userRoleSchema>;
export type User = Infer<typeof userSchema>;
export type UserArray = Infer<typeof userSchemaArray>;
export type UserStatus = Infer<typeof userStatusSchema>;
export type UserCredentials = Infer<typeof userCredentialsSchema>;
export type UserCreate = Infer<typeof userCreateSchema>;
