import { HumayLogo } from "@/core/components/HumayLogo";
import { CenteredLayout } from "@/core/components/Centered";

export function NotFound() {
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
