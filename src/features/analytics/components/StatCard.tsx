import { memo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/core/components/ui/card";
import { ChangeBadge } from "./ChangeBadge";
import { Stat } from "../types";

interface StatCardProps extends Omit<Stat, "percent_change"> {
  percent_change?: number;
}

export const StatCard = memo(({ title, subtitle, current_value, unit, percent_change }: StatCardProps) => {
  return (
    <Card
      role="stat-card"
      className="flex-1 h-full flex flex-col gap-2.5 justify-between hover:cursor-pointer rounded-container hover:shadow-sm transition-all"
    >
      <CardHeader className="flex flex-col gap-1 lt:gap-1.5 dt:gap-2">
        <CardTitle className="leading-none font-semibold text-primary" >
          {title}
        </CardTitle>
        <CardDescription className="text-left font-light text-muted-foreground">
          {subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-row items-center justify-between">
        <div className="space-x-1.5">
          <span className="space-x-2 font-semibold text-md lt:text-lg dt:text-xl">
            {current_value ?? "-"}
          </span>
          <span className="text-5xs lt:text-4xs dt:text-3xs font-light text-muted-foreground">
            {unit}
          </span>
        </div>
        {percent_change !== undefined && <ChangeBadge value={percent_change} />}
      </CardContent>
    </Card>
  );
});
