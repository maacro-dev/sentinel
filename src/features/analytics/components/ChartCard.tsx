import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/core/components/ui/card";
import { ChartConfig } from "@/core/components/ui/chart";
import { memo, ReactNode } from "react";
import { ChartHeader } from "../types";

interface ChartCardProps extends React.ComponentProps<typeof Card> {
  header: ChartHeader;
  options?: {
    enabled: boolean;
    component: ReactNode
  };
  config?: ChartConfig;
}

export const ChartCard = memo(({
  header,
  options,
  children,
  config = {},
  ...rest
}: ChartCardProps) => {
  return (
    <Card className="flex-1" {...rest}>
      <CardHeader className={options ? "flex items-center justify-between" : ""}>
        <div className={options ? "" : "content"}>
          {header.title && (
            <CardTitle>{header.title}</CardTitle>
          )}
          {header.description && (
            <CardDescription className="text-muted-foreground/75">
              {header.description}
            </CardDescription>
          )}
        </div>
        {options && options.enabled && options.component}
      </CardHeader>
      <CardContent className="h-full justify-center items-center">
        {children}
      </CardContent>
    </Card>
  )
})
