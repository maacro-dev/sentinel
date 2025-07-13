import type { infer as Infer } from "zod/v4-mini";
import type { barangayYieldTopBottomSchema, formSubmissionSchema, SeasonFieldCountComparisonStatSchema, SeasonHarvestedAreaComparisonStatSchema, SeasonIrrigationComparisonStatSchema, seasonYieldComparisonStatSchema, seasonYieldTimeSeriesSchema } from "@/lib/schemas/analytics";

export type StatData = {
  title: string;
  subtitle: string;
  value: number;
  unit: string;
  percentChange: number | null;
}

export type FormSubmissionStat = Infer<typeof formSubmissionSchema>;
export type SeasonYieldComparisonStat = Infer<typeof seasonYieldComparisonStatSchema>;
export type SeasonIrrigationComparisonStat = Infer<typeof SeasonIrrigationComparisonStatSchema>;
export type SeasonHarvestedAreaComparisonStat = Infer<typeof SeasonHarvestedAreaComparisonStatSchema>;
export type SeasonFieldCountComparisonStat = Infer<typeof SeasonFieldCountComparisonStatSchema>;
export type SeasonYieldTimeSeries = Infer<typeof seasonYieldTimeSeriesSchema>;
export type BarangayYieldTopBottomRanked = Infer<typeof barangayYieldTopBottomSchema>;
