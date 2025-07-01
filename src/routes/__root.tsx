import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { RouterContext } from "@/app/router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: ({ error }) => <div>{error.message}</div>
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
      <Toaster />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
