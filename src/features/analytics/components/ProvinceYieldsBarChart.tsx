import { memo } from "react";
import { ChartConfig } from "@/core/components/ui/chart";
import { BarChart } from "./BarChart";
import { TickProps } from "../types";
import { ProvinceYield } from "../schemas/yieldByProvince";
import { DefaultTicks } from "./DefaultTicks";

const config = {
  Aklan: {
    label: "Aklan"
  },
  Antique: {
    label: "Antique"
  },
  Capiz: {
    label: "Capiz"
  },
  Iloilo: {
    label: "Iloilo"
  },
  Guimaras: {
    label: "Guimaras"
  },
  avg_yield_t_per_ha: {
    label: "Yield (t/ha)"
  }
} satisfies ChartConfig;

const header = {
  title: "Season Summary",
  description: "Average yield per province (Avg. Bag Weight (kg) × Number of Bags / Harvested Area (ha) × 1000)",
};

interface ProvinceYieldsBarChartProps {
  data: Array<ProvinceYield>;
}

export const ProvinceYieldsBarChart = memo(({ data }: ProvinceYieldsBarChartProps) => {
  const isEmpty = data.length === 0 || data.every(item => item.avg_yield_t_per_ha === 0);

  let domain: [number, number] | undefined;
  const yields = data.map(d => d.avg_yield_t_per_ha).filter(y => y > 0);

  if (yields.length > 0) {
    const minVal = Math.min(...yields);
    const maxVal = Math.max(...yields);
    const padding = (maxVal - minVal) * 0.1;
    domain = [Math.max(0, minVal - padding), maxVal + padding];
  }


  return (
    <BarChart
      config={config}
      data={data}
      header={header}
      axisKeys={{ X: "province", Y: "avg_yield_t_per_ha" }}
      isEmpty={isEmpty}
      axisOptions={{
        X: {
          interval: 0,
          tick: ({ x, y, payload }: TickProps) => <DefaultTicks x={x} y={y} payload={payload} />,
        },
        Y: {
          tickFormatter: (value: number) => `${value} t/ha`,
          domain,
        },
      }}
      cardClass="min-h-104"
    />
  );
});
