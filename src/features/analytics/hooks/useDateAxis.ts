import { useMemo } from "react";
import { TimeRange } from "../types";

export const useDateAxis = ({ enabled, data, timeRange }: { enabled?: boolean, data?: any[], timeRange?: TimeRange }) => {

  if (!data || data.length === 0) {
    return { tickFormatter: () => "", ticks: undefined, tooltipFormatter: () => "" };
  }

  const tickFormatter = useMemo(() => {
    return (value: string | number) => {
      const date = new Date(value);
      if (timeRange === "7d" || timeRange === "30d") {
        return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      }
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    };
  }, [timeRange]);


  const ticks = useMemo<string[] | undefined>(() => {
    if (!enabled) return undefined;

    const len = data.length;
    const desiredCount = Math.min(len, 7);

    if (desiredCount === len) {
      return data.map((d) => d.date);
    }

    const step = (len - 1) / (desiredCount - 1);
    return Array.from({ length: desiredCount }, (_, i) => {
      const idx = Math.round(i * step);
      return data[idx].date;
    });
  }, [data, enabled]);


  const tooltipFormatter = useMemo(() => {
    return (value: string | number) => {
      const date = new Date(value);
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
  }, []);

  return { tickFormatter, ticks, tooltipFormatter };
}
