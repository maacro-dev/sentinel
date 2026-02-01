import { CenteredLayout } from "@/core/components/Centered";
import { HumayLogo } from "@/core/components/HumayLogo";
import { Motion } from "@/core/components/Motion";
import { DEFAULT_FADE_UP } from "@/core/utils/motions";
import { createFileRoute } from "@tanstack/react-router";
import { Hammer } from "lucide-react";

export const Route = createFileRoute('/reset-password')({
  component: RouteComponent,
  head: () => ({ meta: [{ title: "Reset Password | Humay" }] }),
})

function RouteComponent() {
  return (
    <CenteredLayout>
      <Motion motion={DEFAULT_FADE_UP} className="flex-center">
        <div className="flex flex-col gap-4 items-start">
          <HumayLogo className="" />

          <div className="flex flex-col gap-2 mb-4 pb-4">
            <span className="flex gap-2 bg-amber-100 text-amber-900 h-fit p-1 text-xs font-medium rounded-sm">
              <Hammer size={16} />
              Under Construction
            </span>
            <h1 className="text-4xl font-bold">Reset Password Page</h1>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-medium mb-1">This should:</p>
            <p className="text-sm">1. Ask the user for new password</p>
            <p className="text-sm">2. Confirm the password</p>
            <p className="text-sm">3. Update the password by <code className="bg-neutral-200 px-1 py-0.5 text-sm rounded-sm text-neutral-700">updateUser()</code></p>
            <p className="text-sm">4. Redirect to login page OR login directly</p>
          </div>
        </div>
      </Motion>
    </CenteredLayout>
  );
}
