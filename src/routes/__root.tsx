import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { HumayLogo } from "@/core/components/HumayLogo";
import { Toaster } from "@/features/toast";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { RouterContext } from "@/core/tanstack/router";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" }
    ],
    links: [
      { rel: 'icon', href: 'favicon.ico' }
    ],
  }),
  component: RootComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
      {/* <ReactQueryDevtools /> */}
      <Toaster />
    </>
  );
}

function ErrorComponent({ error }: { error: Error }) {

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <div className="flex flex-col gap-2 max-w-prose w-full">
        <HumayLogo />
        <div className="flex flex-col">
          <h1 className="text-5xl font-semibold">Oh no!</h1>
          <h2 className="text-2xl text-muted-foreground">Something went wrong</h2>
        </div>
        <p className={
            `w-fit text-pretty border-2
            text-muted-foreground text-sm
            border-red-300 px-3 py-2 mt-2
            rounded-lg inline-flex bg-red-50`
          }>
          {error.message}
        </p>
      </div>
    </div>
  )
}
