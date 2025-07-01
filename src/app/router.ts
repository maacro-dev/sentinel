import { createRouter } from "@tanstack/react-router";
import { FileRoutesByTo, routeTree } from "@/app/routeTree.gen";
import { RouteGroup } from "@/lib/types/route";
import { useAuth } from "@/context/auth-context";
import { LucideIcon } from "lucide-react";
import { Role } from "@/lib/types/user";

export type RouterContext = {
  auth: ReturnType<typeof useAuth>;
};

// https://github.com/TanStack/router/discussions/824#discussioncomment-12342295
export type Path = keyof FileRoutesByTo;

export const router = createRouter({
  routeTree: routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultStructuralSharing: true,
  scrollRestoration: true,
  context: {
    auth: undefined!,
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


