import { userDbSchema } from "@/features/users";
import { sessionSchema } from "./session";
import * as z from "zod/v4";

export type AuthResult = z.infer<typeof authResultSchema>;

export const authResultSchema = z.object({
  user: userDbSchema,
  session: sessionSchema,
});
