import { CenteredLayout } from "@/core/components/Centered";
import { HumayLogo } from "@/core/components/HumayLogo";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/unauthorized")({
  component: RouteComponent
});

function RouteComponent() {

  const navigate = useNavigate({ from: "/unauthorized" });

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate({ to: "/login", replace: true });
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);


  return (
    <CenteredLayout>
      <div className="flex flex-col gap-4 items-start">
        <HumayLogo />
        <div>
          <h1 className="text-4xl font-semibold">Unauthorized</h1>
          <p className="text-muted-foreground text-sm">
            You do not have permission to access this page. Redirecting...
          </p>
        </div>
      </div>
    </CenteredLayout>
  );
}
