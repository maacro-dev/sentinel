import { createRouter } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";
import { QueryClient } from "@tanstack/react-query";
import { queryClient } from "@/core/tanstack/query/client";
import { Role } from "@/features/users";
import { routeTree } from "./routeTree.gen";
import { RouteGroup } from "./types";

export type RouterContext = {
  queryClient: QueryClient;
};

export const router = createRouter({
  routeTree: routeTree,
  defaultPreload: "intent",
  defaultPreloadDelay: 30,
  defaultPreloadStaleTime: 0,
  context: {
    queryClient: queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    routeFor?: Role;
    label?: string;
    icon?: LucideIcon;
    group?: RouteGroup;
    navItemOrder?: number;
    disabled?: boolean;
  }
}
