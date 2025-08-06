import { userDbSchema } from '@/features/users';
import * as z from 'zod/v4';

export const sessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  user: userDbSchema,
  token_type: z.string(),
  expires_in: z.number(),
  expires_at: z.number(),
});

export type Session = z.infer<typeof sessionSchema>;
