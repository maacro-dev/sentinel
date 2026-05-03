import * as z from "zod/v4";
import { Validator } from "@/core/utils/validator";

export const seasonSummaryEntry = z.object({
  name: z.string(),
  current_value: z.number(),
  previous_value: z.number(),
  percent_change: z.number(),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
export const dashboardStatsSchema = z.array(seasonSummaryEntry);

export const parseDashboardStats = Validator.create<DashboardStats>(dashboardStatsSchema, "DashboardStats");
