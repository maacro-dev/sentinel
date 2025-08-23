import { createRouter, parseSearchWith, stringifySearchWith } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";
import { QueryClient } from "@tanstack/react-query";
import { queryClient } from "@/core/tanstack/query/client";
import { Role } from "@/features/users";
import { routeTree } from "./routeTree.gen";
import { NotFound } from "@/core/components/NotFound";
import { searchParser } from "./utils";

export type RouterContext = {
  queryClient: QueryClient;
};

export type SentinelRouter = typeof router;
export const router = createRouter({
  routeTree: routeTree,
  defaultPreload: "intent",
  defaultPreloadDelay: 30,
  defaultPreloadStaleTime: 0,
  parseSearch: parseSearchWith(searchParser),
  stringifySearch: stringifySearchWith(JSON.stringify),
  context: {
    queryClient: queryClient,
  },
  defaultNotFoundComponent: NotFound
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    isGroup?: boolean;
    label?: string;
    role?: Role;
    sidebar?: {
      icon?: LucideIcon | undefined;
      order?: number;
      disabled?: boolean;
    }
  }
}
