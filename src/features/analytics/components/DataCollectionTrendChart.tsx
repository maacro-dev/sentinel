import { memo } from "react"
import { TrendChart } from "./TrendChart"
import { DataCollectionPoint } from "../schemas/trends/dataCollectionTrend"

interface DataCollectionTrendChartProps {
  data: Array<DataCollectionPoint>;
}

export const DataCollectionTrendChart = memo(({ data  }: DataCollectionTrendChartProps) => {
  return (
    <TrendChart
      data={data}
      header={{
        title: "Data Collection Trend",
        description: "Tracking data collection trend by time window"
      }}
      isEmpty={data.length === 0}
      axisKeys={{ X: "date", Y: "data_collected" }}
      axisOptions={{ X: { interval: "equidistantPreserveStart" } }}
      config={{ data_collected: { label: "Data Collected" } }}
    />
  );
});
