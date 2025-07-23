import * as z from "zod/v4-mini";

export const semesterSchema = z.enum(["first", "second"] as const);

export type Seasons = z.infer<typeof seasonsSchema>;
export const seasonsSchema = z.object({
  end_date: z.string(),
  semester: semesterSchema,
  start_date: z.string(),
  season_year: z.string(),
})
