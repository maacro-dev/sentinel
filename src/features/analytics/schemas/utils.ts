import { seasonsSchema } from '@/features/fields/schemas';
import * as z from 'zod/v4';


export const withSeasonTrend = <T extends z.ZodType>(dataSchema: T) => z.object({
  season: seasonsSchema,
  data: z.array(dataSchema),
});

export const withSeason = <T extends z.ZodType>(dataSchema: T) => z.object({
  season: seasonsSchema,
  data: dataSchema,
});

export const withSeasonComparison = <T extends z.ZodType>(dataSchema: T) => z.object({
  seasons: z.object({
    current: seasonsSchema,
    previous: seasonsSchema,
  }),
  data: z.array(dataSchema)
});
