import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { RouterContext } from "@/app/router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/auth-store";
import { logPreload, logDebugCheck, logDebugOk, logDebugError, logRender } from "chronicle-log";

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    logPreload("Root Route");
    logDebugCheck("Check if session is already checked");
    const sessionChecked = useAuthStore.getState().sessionChecked;
    if (sessionChecked) {
      logDebugOk("Session is already checked");
      return;
    }
    logDebugError("Session is not checked");
    logDebugCheck("Checking session...");
    await useAuthStore.getState().handleSession();
    logDebugOk("Session checked");
  },
  head: () => ({
    meta: [
      {
        name: "meta",
        charSet: "UTF-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      }
    ],
    links: [
      {
        rel: 'icon',
        href: 'favicon.ico',
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  logRender("Root Route");
  return (
    <>
      <HeadContent />
      <Outlet />
      <Toaster />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
