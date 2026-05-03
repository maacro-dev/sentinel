import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/core/components/ui/card";
import { ChartConfig } from "@/core/components/ui/chart";
import { memo, ReactNode } from "react";
import { ChartHeader } from "../types";
import { cn } from "@/core/utils/style";

export interface ChartCardProps extends React.ComponentProps<typeof Card> {
  header: ChartHeader;
  options?: {
    enabled: boolean;
    component: ReactNode
  };
  config?: ChartConfig;
  contentClass?: string
}

export const ChartCard = memo(({
  header,
  options,
  children,
  config = {},
  className,
  contentClass = "",
  ...rest
}: ChartCardProps) => {
  return (
    <Card className={`${className} flex-1 relative`} {...rest}>
      <CardHeader className={options ? "flex items-center justify-between" : ""}>
        <div className={options ? "" : "content"}>
          {header.title && (
            <CardTitle className="font-medium">{header.title}</CardTitle>
          )}
          {header.description && (
            <CardDescription className="text-muted-foreground/75">
              {header.description}
            </CardDescription>
          )}
        </div>
        {options && options.enabled && options.component}
      </CardHeader>
      <CardContent className={cn("h-full", contentClass)}>
        {children}
      </CardContent>
    </Card>
  )
})
