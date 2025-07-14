import { GetAllUsersParams } from "@/api/users";
import { queryOptions } from "@tanstack/react-query";
import { queryUsers } from "./users";
import { queryAllFields } from "./fields";
import {
  queryBarangayYieldTopBottom,
  queryFormSubmissionCount,
  querySeasonFieldCountComparisonStat,
  querySeasonHarvestedAreaComparisonStat,
  querySeasonIrrigationComparisonStat,
  querySeasonYieldComparisonStat,
  querySeasonYieldTimeSeries
} from "./analytics";

const createQueryOptions = <TQueryFnData>(
  queryKey: readonly string[],
  queryFn: () => Promise<TQueryFnData>,
  options: { staleTime?: number; gcTime?: number } = {},
) =>
  queryOptions({
    queryKey,
    queryFn,
    staleTime: options.staleTime ?? 1000 * 60 * 5, // 5 minutes
    gcTime: options.gcTime ?? 1000 * 60 * 15, // 15 minutes
  });


export const usersQueryOptions = (params: GetAllUsersParams) =>
  queryOptions({
    queryKey: ["users"] as const,
    queryFn: () => queryUsers(params),
    staleTime: 1000 * 60 * 5,
  })

// fields
export const fieldsQueryOptions = createQueryOptions(
  ["fields"] as const,
  queryAllFields
);

// analytics
export const seasonFieldCountComparisonStatQueryOptions = createQueryOptions(
  ["season-field-count"] as const,
  querySeasonFieldCountComparisonStat
);

export const formSubmissionCountQueryOptions = createQueryOptions(
  ["form-submission-count"] as const,
  queryFormSubmissionCount
);

export const seasonYieldComparisonStatQueryOptions = createQueryOptions(
  ["season-yield-comparison"] as const,
  querySeasonYieldComparisonStat
);

export const seasonYieldTimeSeriesQueryOptions = createQueryOptions(
  ["season-yield-time-series"] as const,
  querySeasonYieldTimeSeries
);

export const seasonIrrigationComparisonStatQueryOptions = createQueryOptions(
  ["season-irrigation-comparison"] as const,
  querySeasonIrrigationComparisonStat
);

export const seasonHarvestedAreaComparisonStatQueryOptions = createQueryOptions(
  ["season-harvested-area-comparison"] as const,
  querySeasonHarvestedAreaComparisonStat
);

export const barangayYieldTopBottomQueryOptions = createQueryOptions(
  ["barangay-yield-top-bottom"] as const,
  queryBarangayYieldTopBottom
);
