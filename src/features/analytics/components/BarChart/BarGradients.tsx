import { Cell } from "recharts";
import { barColors } from "../../config";

//* Recharts does not render pure components

export const defineBarColors = (dataLength?: number, layout: "vertical" | "horizontal" = "horizontal") => {
  const length = dataLength ?? 0;
  const isVertical = layout === 'vertical';

  const gradientProps = isVertical
    ? { x1: "1", y1: "0", x2: "0", y2: "0" }
    : { x1: "0", y1: "0", x2: "0", y2: "1" };

  return Array.from({ length }).map((_, index) => {
    const color = barColors[index % barColors.length];
    return (
      <linearGradient key={index} id={`gradient-${index}`} {...gradientProps}>
        <stop offset="20%" stopColor={color} stopOpacity={0.9} />
        <stop offset="100%" stopColor={color} stopOpacity={0.3} />
      </linearGradient>
    );
  });
};

export const renderBarCells = (dataLength: number) => {
  return Array.from({ length: dataLength }).map((_, index) => (
    <Cell key={index} fill={`url(#gradient-${index})`} opacity={0.65} />
  ));
};
