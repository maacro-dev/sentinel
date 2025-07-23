import * as z from "zod/v4-mini";
import { userDbSchema } from "./userDb";
import { roleSchema } from "./role";

export type User = z.infer<typeof userSchema>;

export const userMappedSchema = z.pipe(userDbSchema, z.transform((user) => ({
  id: user.id,
  first_name: user.user_metadata.first_name,
  last_name: user.user_metadata.last_name,
  date_of_birth: new Date(user.user_metadata.date_of_birth),
  role: user.user_metadata.role,
  email: user.email,
  last_sign_in_at: new Date(user.last_sign_in_at),
  created_at: new Date(user.created_at),
  updated_at: new Date(user.updated_at),
})))

export const userSchema = z.object({
  id: z.uuidv4(),
  first_name: z.string(),
  last_name: z.string(),
  date_of_birth: z.coerce.date(),
  role: roleSchema,
  email: z.email(),
  last_sign_in_at: z.nullable(z.coerce.date()),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
})

export const userArraySchema = z.array(userSchema);

export function mapUser(user: unknown): User {
  const result = userMappedSchema.safeParse(user);
  if (!result.success) {
    throw new Error(z.prettifyError(result.error));
  }

  return result.data
}
