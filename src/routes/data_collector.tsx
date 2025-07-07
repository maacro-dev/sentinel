import { CenteredLayout } from "@/components/layouts";
import HumayLogo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { logDebugCheck, logDebugError } from "chronicle-log";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/data_collector")({
  beforeLoad: async () => {
    const user = useAuthStore.getState().user;
    logDebugCheck(`User: ${user ? "exists" : "does not exist"}`);
    if (!user) {
      logDebugError("User does not exist → redirecting to login");
      throw redirect({ to: "/login" });
    }
    if (user.role !== "data_collector") {
      logDebugError("User is not a data collector → redirecting to unauthorized");
      throw redirect({ to: "/unauthorized" });
    }
  },
  component: RouteComponent
});

function RouteComponent() {

  const handleSignOut = useAuthStore((state) => state.handleSignOut);
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
