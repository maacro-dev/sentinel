import { DamageByCauseData } from "../schemas/comparative/damage-cause";
import { DamageByLocationData } from "../schemas/comparative/damage-location";
import { YieldByLocationData } from "../schemas/comparative/yield-location";
import { YieldByMethodData } from "../schemas/comparative/yield-method";
import { YieldByVarietyData } from "../schemas/comparative/yield-variety";
import { ComparativeDataParams } from "../types";
import { useDamageAnalytics } from "./useDamageAnalytics";
import { useYieldComparativeData } from "./useYieldAnalytics";

export function useComparativeData(sharedFilters: ComparativeDataParams) {
  const yieldData = useYieldComparativeData(sharedFilters);
  const damageData = useDamageAnalytics(sharedFilters);

  const viewData = {
    'yield-location': yieldData.byLocation.data as YieldByLocationData,
    'yield-method': yieldData.byMethod.data as YieldByMethodData,
    'yield-variety': yieldData.byVariety.data as YieldByVarietyData,
    'damage-location': damageData.byLocation.data as DamageByLocationData,
    'damage-cause': damageData.byCause.data as DamageByCauseData,
  };

  const viewLoading = {
    'yield-location': yieldData.byLocation.isLoading,
    'yield-method': yieldData.byMethod.isLoading,
    'yield-variety': yieldData.byVariety.isLoading,
    'damage-location': damageData.byLocation.isLoading,
    'damage-cause': damageData.byCause.isLoading,
  };

  return { viewData, viewLoading };
}
