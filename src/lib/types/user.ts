import type { infer as Infer } from "zod/v4-mini";
import type {
  userRoleSchema,
  userStatusSchema,
  userSchema,
  userCredentialsSchema,
} from "@/lib/schemas/user";

export type Role = Infer<typeof userRoleSchema>;
export type User = Infer<typeof userSchema>;
export type UserStatus = Infer<typeof userStatusSchema>;
export type UserCredentials = Infer<typeof userCredentialsSchema>;
