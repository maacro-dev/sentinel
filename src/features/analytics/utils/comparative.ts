
import {
  damageByCauseOptions,
  damageByLocationOptions,
  yieldByLocationOptions,
  yieldByMethodOptions,
  yieldByVarietyOptions,
} from '@/features/analytics/queries/options';
import { ComparativeDataParams, SeasonComparisonResult } from '@/features/analytics/types';
import { useQueryClient } from '@tanstack/react-query';

export async function fetchSeasonComparison(
  queryClient: ReturnType<typeof useQueryClient>,
  { seasonId, compareSeasonId, ...filters }: ComparativeDataParams & { compareSeasonId: number }
): Promise<SeasonComparisonResult> {
  const base = { ...filters };

  const [
    ylCurrent, ylCompare,
    ymCurrent, ymCompare,
    yvCurrent, yvCompare,
    dlCurrent, dlCompare,
    dcCurrent, dcCompare,
  ] = await Promise.all([
    queryClient.fetchQuery(yieldByLocationOptions({ ...base, seasonId })),
    queryClient.fetchQuery(yieldByLocationOptions({ ...base, seasonId: compareSeasonId })),
    queryClient.fetchQuery(yieldByMethodOptions({ ...base, seasonId })),
    queryClient.fetchQuery(yieldByMethodOptions({ ...base, seasonId: compareSeasonId })),
    queryClient.fetchQuery(yieldByVarietyOptions({ ...base, seasonId })),
    queryClient.fetchQuery(yieldByVarietyOptions({ ...base, seasonId: compareSeasonId })),
    queryClient.fetchQuery(damageByLocationOptions({ ...base, seasonId })),
    queryClient.fetchQuery(damageByLocationOptions({ ...base, seasonId: compareSeasonId })),
    queryClient.fetchQuery(damageByCauseOptions({ ...base, seasonId })),
    queryClient.fetchQuery(damageByCauseOptions({ ...base, seasonId: compareSeasonId })),
  ]);

  // -------- Yield by Location --------
  const ylLocations = new Set([
    ...ylCurrent.ranking.map((r: any) => r.location),
    ...ylCompare.ranking.map((r: any) => r.location),
  ]);
  const yieldLocationData = Array.from(ylLocations).map(loc => ({
    location: loc,
    current: ylCurrent.ranking.find((r: any) => r.location === loc)?.yield ?? 0,
    compare: ylCompare.ranking.find((r: any) => r.location === loc)?.yield ?? 0,
  }));
  const yieldLocationStats = {
    primary: {
      avg: ylCurrent.average_yield,
      highest: ylCurrent.highest_yield?.value,
      highestLocation: ylCurrent.highest_yield?.location,
      lowest: ylCurrent.lowest_yield?.value,
      lowestLocation: ylCurrent.lowest_yield?.location,
      gap: ylCurrent.gap_percentage,
    },
    compare: {
      avg: ylCompare.average_yield,
      highest: ylCompare.highest_yield?.value,
      highestLocation: ylCompare.highest_yield?.location,
      lowest: ylCompare.lowest_yield?.value,
      lowestLocation: ylCompare.lowest_yield?.location,
      gap: ylCompare.gap_percentage,
    },
  };

  // -------- Yield by Method (with adoption rates) --------
  const ALL_METHODS = ['direct-seeded', 'transplanted'];
  const yieldMethodData = ALL_METHODS.map(method => {
    const cr = ymCurrent.ranking?.find((r: any) => r.method === method);
    const er = ymCompare.ranking?.find((r: any) => r.method === method);
    return {
      method,
      current: cr?.yield ?? 0,
      compare: er?.yield ?? 0,
      adoption_rate_current: cr?.adoption_rate ?? 0,
      adoption_rate_compare: er?.adoption_rate ?? 0,
    };
  });

  const yieldMethodStats = {
    primary: {
      avg: ymCurrent.average_yield,
      highest: ymCurrent.highest_method?.value,
      highestMethod: ymCurrent.highest_method?.method,
      lowest: ymCurrent.lowest_method?.value,
      lowestMethod: ymCurrent.lowest_method?.method,
    },
    compare: {
      avg: ymCompare.average_yield,
      highest: ymCompare.highest_method?.value,
      highestMethod: ymCompare.highest_method?.method,
      lowest: ymCompare.lowest_method?.value,
      lowestMethod: ymCompare.lowest_method?.method,
    },
  };
  const yieldMethodCompareRanking = ymCompare.ranking; // keep original ranking if needed

  // -------- Yield by Variety --------
  const yvVarieties = new Set([
    ...yvCurrent.ranking.map((r: any) => r.variety),
    ...yvCompare.ranking.map((r: any) => r.variety),
  ]);
  const yieldVarietyData = Array.from(yvVarieties).map(variety => ({
    variety,
    current: yvCurrent.ranking.find((r: any) => r.variety === variety)?.yield ?? 0,
    compare: yvCompare.ranking.find((r: any) => r.variety === variety)?.yield ?? 0,
  }));
  const yieldVarietyStats = {
    primary: {
      avg: yvCurrent.average_yield,
      highest: yvCurrent.highest_variety?.value,
      highestVariety: yvCurrent.highest_variety?.variety,
      totalVarieties: yvCurrent.ranking.length,
    },
    compare: {
      avg: yvCompare.average_yield,
      highest: yvCompare.highest_variety?.value,
      highestVariety: yvCompare.highest_variety?.variety,
      totalVarieties: yvCompare.ranking.length,
    },
  };

  // -------- Damage by Location --------
  const dlLocations = new Set([
    ...dlCurrent.ranking.map((r: any) => r.location),
    ...dlCompare.ranking.map((r: any) => r.location),
  ]);
  const damageLocationData = Array.from(dlLocations).map(location => ({
    location,
    current: dlCurrent.ranking.find((r: any) => r.location === location)?.total_affected_area ?? 0,
    compare: dlCompare.ranking.find((r: any) => r.location === location)?.total_affected_area ?? 0,
  }));
  const damageLocationStats = {
    primary: {
      totalReports: dlCurrent.total_damage_reports,
      totalArea: dlCurrent.total_affected_area_ha,
      locationsCount: dlCurrent.ranking.length,
      avgArea: dlCurrent.total_affected_area_ha / (dlCurrent.ranking.length || 1),
    },
    compare: {
      totalReports: dlCompare.total_damage_reports,
      totalArea: dlCompare.total_affected_area_ha,
      locationsCount: dlCompare.ranking.length,
      avgArea: dlCompare.total_affected_area_ha / (dlCompare.ranking.length || 1),
    },
  };

  const dcCauses = new Set([
    ...dcCurrent.ranking.map((r: any) => r.cause),
    ...dcCompare.ranking.map((r: any) => r.cause),
  ]);
  const damageCauseData = Array.from(dcCauses).map(cause => ({
    cause,
    current: dcCurrent.ranking.find((r: any) => r.cause === cause)?.total_affected_area ?? 0,
    compare: dcCompare.ranking.find((r: any) => r.cause === cause)?.total_affected_area ?? 0,
  }));
  const damageCauseStats = {
    primary: {
      totalReports: dcCurrent.total_damage_reports,
      totalArea: dcCurrent.total_affected_area_ha,
      causesCount: dcCurrent.ranking.length,
      avgArea: dcCurrent.total_affected_area_ha / (dcCurrent.ranking.length || 1),
    },
    compare: {
      totalReports: dcCompare.total_damage_reports,
      totalArea: dcCompare.total_affected_area_ha,
      causesCount: dcCompare.ranking.length,
      avgArea: dcCompare.total_affected_area_ha / (dcCompare.ranking.length || 1),
    },
  };

  return {
    compareSeasonId,
    yieldLocation: { data: yieldLocationData, comparisonStats: yieldLocationStats },
    yieldMethod: {
      data: yieldMethodData,
      comparisonStats: yieldMethodStats,
      compareRanking: yieldMethodCompareRanking,
    },
    yieldVariety: { data: yieldVarietyData, comparisonStats: yieldVarietyStats },
    damageLocation: { data: damageLocationData, comparisonStats: damageLocationStats },
    damageCause: { data: damageCauseData, comparisonStats: damageCauseStats },
  };
}
