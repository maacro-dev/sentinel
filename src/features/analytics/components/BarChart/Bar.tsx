import { memo } from "react";
import { LabelList, Bar as PrimitiveBar } from "recharts";
import { defineBarColors, renderBarCells } from "./BarGradients";

type BarProps = {
  axisKey: string
  onClick?: (item: any) => void
  activeBar?: any,
  dataLength: number | undefined
}

const clickableActiveBar = {
  stroke: "#000",
  strokeWidth: 2,
}


export const Bar = memo(
  ({ axisKey, onClick, activeBar, dataLength }: BarProps) => {
    const resolvedActiveBar = activeBar !== undefined ? activeBar : onClick ? clickableActiveBar : false;

    return (
      <PrimitiveBar
        dataKey={axisKey}
        onClick={onClick}
        cursor={onClick ? "pointer" : "default"}
        activeBar={resolvedActiveBar}
        radius={[8, 8, 4, 4]}
      >
        {defineBarColors(dataLength!)}
        {renderBarCells(dataLength!)}
        <LabelList
          position="top"
          offset={16}
          className="fill-foreground"
          fontSize={14}
          formatter={(label) => { if (label === 0) return "N/A"; else return label; }
          }
        />
      </PrimitiveBar>
    );
  }
);
