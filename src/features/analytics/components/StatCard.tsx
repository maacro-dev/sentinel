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
    <Card className="rounded-container flex flex-col justify-between py-0 p-6 gap-2 min-w-[200px] min-h-[180px] flex-1">
      <CardHeader className="flex flex-col gap-1">
        <CardTitle className="leading-none font-semibold text-primary text-sm">
          {title}
        </CardTitle>
        <CardDescription className="text-[0.665rem] font-light text-muted-foreground">
          {subtitle}
        </CardDescription>
        <CardTitle >
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="space-x-1.5">
          <span className="space-x-2 font-semibold text-2xl">
            {current_value ?? "-"}
          </span>
          <span className="text-[0.9rem] font-light text-muted-foreground">
            {unit}
          </span>
        </div>
        {percent_change !== undefined && <ChangeBadge value={percent_change}/>}
      </CardContent>
    </Card>
  );
});
