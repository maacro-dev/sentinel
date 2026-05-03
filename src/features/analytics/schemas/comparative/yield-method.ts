import * as z from "zod/v4";
import { Validator } from "@/core/utils/validator";

export const yieldMethodRankingItemSchema = z.object({
  method: z.string(),
  yield: z.number(),
  count: z.number(),
  adoption_rate: z.number(),
});

export const yieldMethodExtremeSchema = z.object({
  value: z.number(),
  method: z.string(),
});

export const yieldMethodDataSchema = z.object({
  average_yield: z.number(),
  highest_method: yieldMethodExtremeSchema.nullable(),
  lowest_method: yieldMethodExtremeSchema.nullable(),
  ranking: z.array(yieldMethodRankingItemSchema),
});

export type YieldByMethodData = z.infer<typeof yieldMethodDataSchema>;
export const parseYieldByMethodData = Validator.create<YieldByMethodData>(
  yieldMethodDataSchema,
  'YieldByMethodData'
);
