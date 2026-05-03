import { memo } from "react"
import { TrendChart } from "./TrendChart"
import { CollectionDataPoint } from "../schemas/trends/dataCollectionTrend";

interface DataCollectionTrendChartProps {
  data: Array<CollectionDataPoint>;
}

export const DataCollectionTrendChart = memo(({ data }: DataCollectionTrendChartProps) => {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }));

  return (
    <TrendChart
      data={formattedData}
      header={{
        title: "Data Collection Trend",
        description: "Tracking data collection trend by time window"
      }}
      isEmpty={formattedData.length === 0}
      axisKeys={{ X: "date", Y: "data_collected" }}
      axisOptions={{ X: { interval: "equidistantPreserveStart" } }}
      config={{ data_collected: { label: "Data Collected" } }}
    />
  );
});
