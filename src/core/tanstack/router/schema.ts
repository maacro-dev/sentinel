import * as z from "zod/v4";

export const routeRedirectSchema = z.object({
  redirect: z.optional(z.string()),
})
