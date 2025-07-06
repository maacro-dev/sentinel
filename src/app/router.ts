import { createRouter } from "@tanstack/react-router";
import { RouteGroup } from "@/lib/types/route";
import { LucideIcon } from "lucide-react";
import { Role } from "@/lib/types/user";
import { QueryClient } from "@tanstack/react-query";
import { queryClient } from "@/app/query-client";
import { FileRoutesByTo, routeTree } from "@/app/routeTree.gen";

export type RouterContext = {
  queryClient: QueryClient;
};

// https://github.com/TanStack/router/discussions/824#discussioncomment-12342295
export type Path = keyof FileRoutesByTo;

export const router = createRouter({
  routeTree: routeTree,
  defaultPreload: "intent",
  defaultPreloadDelay: 100,
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
  }
}


