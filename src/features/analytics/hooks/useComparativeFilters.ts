import { useCallback, useMemo, useState } from "react";
import { ComparativeDataParams, MoreFilters, MultiLocationFilters } from "../types";

export function useComparativeFilters(
  effectiveSeasonId: number | null | undefined,
  location: MultiLocationFilters
) {
  const [moreFilters, setMoreFilters] = useState<MoreFilters>({
    variety: [],
    method: [],
    soilType: []
  });

  const handleMoreFiltersChange = useCallback(
    (key: keyof MoreFilters, value: string[]) => {
      setMoreFilters(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const sharedFilters = useMemo<ComparativeDataParams>(() => ({
    seasonId: effectiveSeasonId,
    provinces: location.provinces.length > 0 ? location.provinces : undefined,
    municipalities: location.municipalities.length > 0 ? location.municipalities : undefined,
    barangays: location.barangays.length > 0 ? location.barangays : undefined,
    method: moreFilters.method.length === 1 ? moreFilters.method[0] : undefined,
    variety: moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined,
  }), [effectiveSeasonId, location, moreFilters]);

  return {
    moreFilters,
    handleMoreFiltersChange,
    sharedFilters,
    resetMoreFilters: () =>
      setMoreFilters({ variety: [], method: [], soilType: [] }),
  };
}
