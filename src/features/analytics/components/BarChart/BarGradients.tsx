import { Cell } from "recharts";
import { barColors } from "../../config";

//* Recharts does not render pure components

export const defineBarColors = (dataLength?: number) => {
  const length = dataLength ?? 0;
  return Array.from({ length }).map((_, index) => {
    const color = barColors[index % barColors.length];
    return (
      <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
        <stop offset="100%" stopColor={color} stopOpacity={0.2} />
      </linearGradient>
    );
  });
};

export const renderBarCells = (dataLength: number) => {
  return Array.from({ length: dataLength }).map((_, index) => (
    <Cell key={index} fill={`url(#gradient-${index})`} opacity={0.65} />
  ));
};
