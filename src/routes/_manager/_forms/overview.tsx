import { createFileRoute } from "@tanstack/react-router";
import { FormInput } from "lucide-react";
import { Motion } from "@/core/components/Motion";
import { StatCard } from "@/features/analytics/components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";

export const Route = createFileRoute("/_manager/_forms/overview")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Overview | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Overview",
    icon: FormInput,
    group: "Forms",
    navItemOrder: 1,
  },
});

function RouteComponent() {
  return (
    <Motion>
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-4">
          <StatCard
            title="Completed Forms"
            subtitle="Total completed forms this season"
            unit="forms"
            current_value={0}
            percent_change={0}
          />
          <StatCard
            title="Pending Forms"
            subtitle="Total pending forms this season"
            unit="forms"
            current_value={0}
            percent_change={0}
          />
        </div>
        <Card className="flex-2 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-lg">Data Collection Rate</CardTitle>
            <CardDescription className="text-sm text-muted-foreground/75">
              Rate of data collection across all forms this season
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-red-50 border-3 flex-1 flex flex-col border-red-100 rounded-lg
                                    justify-center items-center gap-4">
            <p className="text-red-400 font-bold animate-bounce uppercase">Line chart</p>
          </CardContent>
        </Card>
      </div>
      <Card className="h-full">
        <CardContent className="bg-red-50 border-3 flex-1 flex flex-col border-red-100 rounded-lg
                                  justify-center items-center gap-4">
          <p className="text-red-400 font-bold animate-bounce uppercase">Overview</p>
        </CardContent>
      </Card>
    </Motion>
  );
}
