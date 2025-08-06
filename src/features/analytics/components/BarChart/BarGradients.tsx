import { ChartConfig } from "@/core/components/ui/chart";
import { Cell } from "recharts";
import { barColors } from "../../config";
import { useMemo } from "react";

//* Recharts does not render pure components

export const defineBarColors = () => {
  return useMemo(() => barColors.map((key, index) => (
    <linearGradient key={key} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={key} stopOpacity={0.8} />
      <stop offset="100%" stopColor={key} stopOpacity={0.2} />
    </linearGradient>
  )), []);
}

export const renderBarCells = (config: ChartConfig) => {
  if (!config) return null;
  return useMemo(() => Object.keys(config).map((key, index) => (
    <Cell key={key} fill={`url(#gradient-${index})`} opacity={0.65} />
  )), [config]);
}
