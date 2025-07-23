import { memo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/core/components/ui/card";
import { ChangeBadge } from "./ChangeBadge";
import { DashboardStat } from "../types";

export const StatCard = memo(({ title, subtitle, current_value, unit, percent_change }: DashboardStat) => {
  return (
    <Card className="flex flex-col justify-between py-0 p-4 gap-1.5 shadow-none">
      <CardHeader className="flex flex-col gap-1 p-0 m-0">
        <CardTitle className="leading-none text-primary text-sm">
          {title}
        </CardTitle>
        <CardDescription className="text-[0.665rem] font-light text-muted-foreground">
          {subtitle}
        </CardDescription>
        <CardTitle >
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col gap-2">
        <div className="space-x-1.5">
          <span className="space-x-2 font-semibold text-2xl">
            {current_value ?? "-"}
          </span>
          <span className="text-[0.9rem] font-light text-muted-foreground">
            {unit}
          </span>
        </div>
        <ChangeBadge value={percent_change}/>
      </CardContent>
    </Card>
  );
});
