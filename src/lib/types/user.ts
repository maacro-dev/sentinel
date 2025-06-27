import type { infer as Infer } from "zod/v4-mini";
import type {
  userRoleSchema,
  userStatusSchema,
  userDetailSchema,
  userSummarySchema,
  userCredentialsSchema,
  userCreateSchema,
  userSummarySchemaArray,
} from "@/lib/schemas/user";

export type Role = Infer<typeof userRoleSchema>;
export type User = Infer<typeof userDetailSchema>;
export type UserSummary = Infer<typeof userSummarySchema>;
export type UserSummaryArray = Infer<typeof userSummarySchemaArray>;
export type UserStatus = Infer<typeof userStatusSchema>;
export type UserCredentials = Infer<typeof userCredentialsSchema>;
export type UserCreate = Infer<typeof userCreateSchema>;
