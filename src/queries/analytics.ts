import {
  getBarangayYieldTopBottom,
  getFormSubmissionCount,
  getSeasonFieldCountComparisonStat,
  getSeasonHarvestedAreaComparisonStat,
  getSeasonIrrigationComparisonStat,
  getSeasonYieldComparisonStat,
  getSeasonYieldTimeSeries
} from "@/api/analytics";

import {
  BarangayYieldTopBottomRanked,
  FormSubmissionStat,
  SeasonFieldCountComparisonStat,
  SeasonHarvestedAreaComparisonStat,
  SeasonIrrigationComparisonStat,
  SeasonYieldComparisonStat,
  SeasonYieldTimeSeries
} from "@/lib/types";
import { unwrap } from "@/utils";

export async function querySeasonFieldCountComparisonStat(): Promise<SeasonFieldCountComparisonStat> {
  return unwrap(await getSeasonFieldCountComparisonStat());
}

export async function queryFormSubmissionCount(): Promise<FormSubmissionStat> {
  return unwrap(await getFormSubmissionCount());
}

export async function querySeasonYieldComparisonStat(): Promise<SeasonYieldComparisonStat> {
  return unwrap(await getSeasonYieldComparisonStat());
}

export async function querySeasonYieldTimeSeries(): Promise<SeasonYieldTimeSeries> {
  return unwrap(await getSeasonYieldTimeSeries());
}

export async function querySeasonIrrigationComparisonStat(): Promise<SeasonIrrigationComparisonStat> {
  return unwrap(await getSeasonIrrigationComparisonStat());
}

export async function querySeasonHarvestedAreaComparisonStat(): Promise<SeasonHarvestedAreaComparisonStat> {
  return unwrap(await getSeasonHarvestedAreaComparisonStat());
}

export async function queryBarangayYieldTopBottom(): Promise<BarangayYieldTopBottomRanked> {
  return unwrap(await getBarangayYieldTopBottom());
}
