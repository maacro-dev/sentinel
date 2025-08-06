import { memo } from "react"
import { TrendChart } from "./TrendChart"
import { DataCollectionPoint } from "../schemas/trends/dataCollectionTrend"

export const DataCollectionTrendChart = memo(({ data }: { data: Array<DataCollectionPoint> }) => {
  return (
    <TrendChart
      data={data}
      header={{
        title: "Data Collection Trend",
        description: "Tracking data collection trend by time window"
      }}
      axisKeys={{ X: "date", Y: "data_collected" }}
      axisOptions={{
        X: { interval: "equidistantPreserveStart" }
      }}
      config={{ data_collected: { label: "Data Collected" } }}
      enableTimeRange={true}
    />
  )
})
