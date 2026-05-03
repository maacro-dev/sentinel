import * as z from "zod/v4"

import { Validator } from "@/core/utils/validator";

export const collectionDataPointSchema = z.object({
  date: z.coerce.date(),
  data_collected: z.number(),
});
export type CollectionDataPoint = z.infer<typeof collectionDataPointSchema>;
export const parseDataCollectionTrend = Validator.create<CollectionDataPoint[]>(z.array(collectionDataPointSchema), 'DataCollectionTrend');
