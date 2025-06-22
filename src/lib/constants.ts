import { RouteGroup } from "./types";

export const groupOrderMap: Record<RouteGroup, number> = {
  // manager
  Core: 1,
  Forms: 2,

  // admin
  Overview: 1,
  "Access Control": 2,
  Operations: 3,
  Configuration: 4,
} as const;
