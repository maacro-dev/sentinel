import { CenteredLayout } from "@/components/layouts";
import HumayLogo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { protectRoute } from "@/features/auth/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/data_collector")({
  beforeLoad: ({ context }) => {
    protectRoute(context, { allowedRoles: "data_collector" });
  },
  component: RouteComponent
});

function RouteComponent() {

  const { handleSignOut } = useAuth();
  const navigate = useNavigate();

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
            onClick={ async () => {
              await handleSignOut();
              await navigate({ to: "/login", replace: true, reloadDocument: true });
            }}
            size="sm"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </CenteredLayout>
  );
}
