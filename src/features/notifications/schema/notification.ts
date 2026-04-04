import * as z from "zod/v4";
import { Validator } from "@/core/utils/validator";

export const notificationSchema = z.object({
  id: z.number(),
  user_id: z.uuidv4().nullable(),
  title: z.string(),
  message: z.string(),
  type: z.string(),
  related_entity_id: z.string().nullable(),
  is_read: z.boolean().default(false),
  created_at: z.coerce.date(),
});

export type Notification = z.infer<typeof notificationSchema>;

export const notificationArraySchema = z.array(notificationSchema);

export const parseNotificationArray = Validator.create<Notification[]>(notificationArraySchema);
