import * as z from "zod/v4"

import { Validator } from "@/core/utils/validator";
import { withSeasonTrend } from "../utils";

export const dataCollectionPointSchema = z.object({
  date: z.coerce.date(),
  data_collected: z.number(),
});
export type DataCollectionPoint = z.infer<typeof dataCollectionPointSchema>;

const dataCollectionTrendSchema = withSeasonTrend(dataCollectionPointSchema);
export type DataCollectionTrend = z.infer<typeof dataCollectionTrendSchema>;

export const parseDataCollectionTrend =
  Validator.create<DataCollectionTrend>(dataCollectionTrendSchema);
