import { createRouter } from "@tanstack/react-router";
import { routeTree } from "@/app/routeTree.gen";
import { RouteMetadata } from "@/lib/types/route";
import { useAuth } from "@/context/auth-context";

export type RouterContext = {
  auth: ReturnType<typeof useAuth>;
};

export const router = createRouter({
  routeTree: routeTree,
  defaultPreload: "intent",
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
    metadata?: RouteMetadata;
  }
}
