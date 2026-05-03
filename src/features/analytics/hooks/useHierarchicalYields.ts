import { queryOptions } from "@tanstack/react-query";
import { Analytics } from "../services/Analytics";
import { CropAttributes } from "../types";

export const hierarchicalYieldsOptions = (seasonId: number | undefined, attr: CropAttributes) => queryOptions({
  queryKey: ["hierarchical-yields", seasonId, attr.variety, attr.fertilizer, attr.method] as const,
  queryFn: () => Analytics.getHierarchicalYields(seasonId, attr.variety, attr.fertilizer, attr.method),
  enabled: !!seasonId,
});
