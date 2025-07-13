import { QueryClient, useSuspenseQueries } from "@tanstack/react-query";
import {
  barangayYieldTopBottomQueryOptions,
  formSubmissionCountQueryOptions,
  seasonFieldCountComparisonStatQueryOptions,
  seasonHarvestedAreaComparisonStatQueryOptions,
  seasonIrrigationComparisonStatQueryOptions,
  seasonYieldComparisonStatQueryOptions,
  seasonYieldTimeSeriesQueryOptions
} from ".";


export const useManagerDashboardStatsSuspenseQueries = () => {

  const result = useSuspenseQueries({
    queries: [
      formSubmissionCountQueryOptions,
      seasonFieldCountComparisonStatQueryOptions,
      seasonYieldComparisonStatQueryOptions,
      seasonIrrigationComparisonStatQueryOptions,
      seasonHarvestedAreaComparisonStatQueryOptions,
    ],
  });

  const [
    { data: formSubmissionCount },
    { data: fieldCount },
    { data: yieldComparison },
    { data: irrigationComparison },
    { data: harvestedAreaComparison },
  ] = result;

  return {
    formSubmissionCount,
    fieldCount,
    yieldComparison,
    irrigationComparison,
    harvestedAreaComparison
  }
}

export const useManagerDashboardChartsSuspenseQueries = () => {

  const result =  useSuspenseQueries({
    queries: [
      seasonYieldTimeSeriesQueryOptions,
      barangayYieldTopBottomQueryOptions,
    ],
  });

  const [
    { data: yieldTimeSeries },
    { data: barangayYieldTopBottom }
  ] = result;

  return { yieldTimeSeries, barangayYieldTopBottom }
}

export const ensureManagerDashboardData = (queryClient: QueryClient) => {
  ensureManagerDashboardStatData(queryClient);
  ensureManagerDashboardChartData(queryClient);
}

const ensureManagerDashboardStatData = (queryClient: QueryClient) => {
  queryClient.ensureQueryData(formSubmissionCountQueryOptions);
  queryClient.ensureQueryData(seasonFieldCountComparisonStatQueryOptions);
  queryClient.ensureQueryData(seasonYieldComparisonStatQueryOptions);
  queryClient.ensureQueryData(seasonIrrigationComparisonStatQueryOptions);
  queryClient.ensureQueryData(seasonHarvestedAreaComparisonStatQueryOptions);
}

const ensureManagerDashboardChartData = (queryClient: QueryClient) => {
    queryClient.ensureQueryData(seasonYieldTimeSeriesQueryOptions);
    queryClient.ensureQueryData(barangayYieldTopBottomQueryOptions);
}

