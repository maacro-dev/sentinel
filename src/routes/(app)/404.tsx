import CenteredLayout from "@/components/layouts/centered";
import HumayLogo from "@/components/logo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/404")({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <CenteredLayout>
      <div className="flex flex-col gap-4 items-start">
        <HumayLogo />
        <div>
          <h1 className="text-4xl font-semibold">404</h1>
          <p className="text-muted-foreground text-sm">Page not found.</p>
        </div>
      </div>
    </CenteredLayout>
  );
}
