import type { infer as Infer } from "zod/v4-mini";
import type {
  userStatusSchema,
  userSummarySchema,
  userCredentialsSchema,
  userCreateSchema,
  userSummarySchemaArray,
  userRoleSchema,
} from "@/lib/schemas/user";

export type UserSummary = Infer<typeof userSummarySchema>;
export type UserSummaryArray = Infer<typeof userSummarySchemaArray>;
export type UserStatus = Infer<typeof userStatusSchema>;
export type UserCredentials = Infer<typeof userCredentialsSchema>;
export type UserCreate = Infer<typeof userCreateSchema>;


export type Role = Infer<typeof userRoleSchema>;
export type User = {
  auth_id: string
  created_at: string
  date_of_birth: string
  email: string
  first_name: string
  last_name: string
  last_sign_in_at: string
  user_id: string
  role: Role
  status: UserStatus
  updated_at: string
}