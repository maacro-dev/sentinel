import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { RouterContext } from "@/app/router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/auth-store";
import { logPreload, logDebugCheck, logDebugOk, logDebugError, logRender } from "chronicle-log";
import HumayLogo from "@/components/logo";

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
  errorComponent: ({ error }) => (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <div className="flex flex-col gap-2 max-w-prose w-full">
        <HumayLogo />
        <div className="flex flex-col">
          <h1 className="text-5xl font-semibold">Oh no!</h1>
          <h2 className="text-2xl text-muted-foreground">Something went wrong</h2>
        </div>
        <p className="w-fit text-pretty border-2 text-muted-foreground text-sm border-red-300 px-3 py-2 mt-2 rounded-lg inline-flex bg-red-50">{error.message}</p>
      </div>
    </div>
  ),
  pendingComponent: () => (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <HumayLogo />
    </div>
  ),
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
