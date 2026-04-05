import { memo } from "react";
import { LabelList, Bar as PrimitiveBar } from "recharts";
import { defineBarColors, renderBarCells } from "./BarGradients";

const clickableActiveBar = {
  stroke: "#000",
  strokeWidth: 2,
}


type BarProps = {
  axisKey: string
  onClick?: (item: any) => void
  name?: string
  activeBar?: any
  dataLength: number | undefined
  layout?: "vertical" | "horizontal"
}

export const Bar = memo(
  ({ axisKey, onClick, name, activeBar, dataLength, layout }: BarProps) => {
    const isVertical = layout === 'vertical';
    const resolvedActiveBar = activeBar !== undefined ? activeBar : onClick ? clickableActiveBar : false;

    const radius: [number, number, number, number] = isVertical
      ? [4, 8, 8, 4]
      : [8, 8, 4, 4];

    return (
      <PrimitiveBar
        dataKey={axisKey}
        name={name}
        onClick={onClick}
        cursor={onClick ? "pointer" : "default"}
        activeBar={resolvedActiveBar}
        radius={radius}
        isAnimationActive={true}
      >
        {defineBarColors(dataLength!, layout)}
        {renderBarCells(dataLength!)}
        <LabelList
          position={isVertical ? "right" : "top"}
          offset={16}
          className="fill-foreground"
          fontSize={14}
          formatter={(label) => { if (label === 0) return "N/A"; else return label; }}
        />
      </PrimitiveBar>
    );
  }
);
