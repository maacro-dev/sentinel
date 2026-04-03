import { Validator } from "@/core/utils/validator";
import { activityTypeSchema } from "@/features/forms/schemas/forms";
import * as z from "zod/v4"

export const collectionTaskStatusSchema = z.enum(["pending", "completed"]);
export type CollectionTaskStatus = z.infer<typeof collectionTaskStatusSchema>;

export const collectionTaskSchema = z.object({
  id: z.number(),
  season_id: z.number(),
  activity_type: activityTypeSchema,
  collector_id: z.uuid(),
  start_date: z.string(),
  end_date: z.string(),
  retake_of: z.number().optional().nullable(),
  status: collectionTaskStatusSchema,
  verification_status: z.string().nullable().optional(),
  assigned_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  farmer_name: z.string(),
  mfid: z.string(),
  collector_name: z.string().optional(),
  is_overdue: z.boolean().optional(),
  is_retake: z.boolean().optional(),
  original_activity_id: z.number().nullable().optional(),
  activity_id: z.number().nullable().optional(),
});

export type CollectionTask = z.infer<typeof collectionTaskSchema>;

export const collectionTaskInputSchema = z.object({
  mfid: z.string(),
  season_id: z.number(),
  activity_type: activityTypeSchema,
  collector_id: z.uuid(),
  start_date: z.string(),
  end_date: z.string(),
  retake_of: z.number().optional().nullable(),
  activity_id: z.number().nullable().optional(),
}).refine(data => new Date(data.end_date) > new Date(data.start_date), {
  message: "End date must be after start date",
  path: ["end_date"],
});

export type CollectionTaskInput = z.infer<typeof collectionTaskInputSchema>;

export const collectionTaskTransferSchema = z.object({
  task_id: z.uuid(),
  new_collector_id: z.uuid().nullable(),
});

export type CollectionTaskTransfer = z.infer<typeof collectionTaskTransferSchema>;

export const parseCollectionTasks = Validator.create<CollectionTask[]>(z.array(collectionTaskSchema), "collection tasks")

