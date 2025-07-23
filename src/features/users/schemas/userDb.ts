import * as z from "zod/v4-mini"
import { roleSchema } from "./role";

export type UserDB = z.infer<typeof userDbSchema>;

export const userDbSchema = z.object({
  id: z.uuidv4(),
  aud: z.string(),
  role: z.string(),
  email: z.email(),
  email_confirmed_at: z.string(),
  phone: z.string(),
  confirmed_at: z.string(),
  last_sign_in_at: z.string(),
  app_metadata: z.object({
    provider: z.string(),
    providers: z.array(z.string()),
  }),
  user_metadata: z.object({
    role: roleSchema,
    first_name: z.string(),
    last_name: z.string(),
    date_of_birth: z.iso.date()
  }),
  identities: z.array(z.object({
    identity_id: z.string(),
    id: z.string(),
    user_id: z.string(),
    identity_data: z.object({
    email: z.string(),
    email_verified: z.boolean(),
    phone_verified: z.boolean(),
    sub: z.string(),
  }),
    provider: z.string(),
    last_sign_in_at: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    email: z.string(),
  })),
  created_at: z.string(),
  updated_at: z.string(),
  is_anonymous: z.boolean(),
});


export const userDbArraySchema = z.array(userDbSchema);
