import { memo } from "react";
import { LabelList, Bar as PrimitiveBar } from "recharts";
import { defineBarColors, renderBarCells } from "./BarGradients";
import { BarChartDefaults } from "./Defaults";
import { ChartConfig } from "@/core/components/ui/chart";

export const Bar = memo(({ axisKey, config }: { axisKey: string, config: ChartConfig }) => {
  return (
    <>
      {defineBarColors()}
      <PrimitiveBar
        dataKey={axisKey} {...BarChartDefaults.bar}
      >
        {renderBarCells(config)}
        <LabelList
          position="top"
          offset={16}
          className="fill-foreground"
          fontSize={14}
        />
      </PrimitiveBar>
    </>
  )
})
