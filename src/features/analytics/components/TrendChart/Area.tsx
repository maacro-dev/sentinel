import { memo } from "react";
import { Area as PrimitiveArea } from "recharts";
import { TrendChartDefaults } from "./Defaults";

export const Area = memo(({ axisKey }: { axisKey: string }) => {
  return (
    <>
      <defs>
        <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="var(--color-humay-light)" stopOpacity={1} />
          <stop offset="100%" stopColor="var(--color-humay-light)" stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <PrimitiveArea
        {...TrendChartDefaults.area}
        dataKey={axisKey}
      />
    </>
  )
})
