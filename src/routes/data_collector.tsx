import { HumayLogo } from "@/core/components/HumayLogo";
import { Button } from "@/core/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { CenteredLayout } from "@/core/components/Centered";
import { Session, useSignOut } from "@/features/authentication";

export const Route = createFileRoute("/data_collector")({
  beforeLoad: async () => await Session.ensure({ role: "data_collector"}),
  component: RouteComponent
});

function RouteComponent() {

  const { signOut } = useSignOut();

  return (
    <CenteredLayout>
      <div className="flex flex-col gap-4 items-start">
        <HumayLogo />
        <div>
          <h1 className="text-4xl font-semibold">Data Collector</h1>
          <p className="text-muted-foreground text-sm">
            Use the mobile app to collect data. Hehehehe
          </p>
          <Button
            className="ml-0 pl-0 mt-2"
            variant="link"
            onClick={() => signOut()}
            size="sm"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </CenteredLayout>
  );
}
