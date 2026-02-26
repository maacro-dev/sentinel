import { Validator } from "@/core/utils/validator";
import * as z from "zod/v4";

export type SemesterDateRange = {
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
};

export type Semester = z.infer<typeof semesterSchema>;
export const semesterSchema = z.enum(["first", "second"] as const);

export type Seasons = z.infer<typeof seasonsSchema>;
export const seasonsSchema = z.object({
  end_date: z.string(),
  semester: semesterSchema,
  start_date: z.string(),
  season_year: z.string(),
});

export type SeasonRow = z.infer<typeof seasonRowSchema>;
export const seasonRowSchema = z.object({
  id: z.number(),
  end_date: z.string(),
  semester: semesterSchema,
  start_date: z.string(),
  season_year: z.string(),
});

export type SeasonTable = z.infer<typeof seasonsTableSchema>
export const seasonsTableSchema = z.array(seasonRowSchema)

export const parseSeasonRow = Validator.create<SeasonRow>(seasonRowSchema)
export const parseSeasonsTable = Validator.create<SeasonTable>(seasonsTableSchema)
