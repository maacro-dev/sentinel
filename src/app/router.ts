import { createRouter } from "@tanstack/react-router";
import { routeTree } from "@/app/routeTree.gen";
import { RouteMetadata } from "@/lib/types";

export const router = createRouter({ routeTree: routeTree, defaultPreload: "intent" });

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
