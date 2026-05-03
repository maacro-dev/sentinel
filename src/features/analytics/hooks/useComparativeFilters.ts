import { useCallback, useMemo, useState } from "react";
import { ComparativeDataParams, LocationFilters, MoreFilters } from "../types";

export function useComparativeFilters(
  effectiveSeasonId: number | null | undefined,
  location: LocationFilters
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
    province: location.province || undefined,
    municipality: location.municipality || undefined,
    barangay: location.barangay || undefined,
    method:
      moreFilters.method.length === 1
        ? moreFilters.method[0]
        : undefined,
    variety:
      moreFilters.variety.length === 1
        ? moreFilters.variety[0]
        : undefined,
  }), [effectiveSeasonId, location, moreFilters]);

  return {
    moreFilters,
    handleMoreFiltersChange,
    sharedFilters,
    resetMoreFilters: () =>
      setMoreFilters({ variety: [], method: [], soilType: [] }),
  };
}
