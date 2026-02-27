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
  console.log(data)
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
        Y: { tickFormatter: (value: number) => `${value} t/ha`, },
      }}
      cardClass="min-h-94 max-h-[25rem]"
    />
  );
});

