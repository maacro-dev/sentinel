import { memo } from "react";
import { FormCount } from "../schemas/summary/formCount";
import { getFormLabel } from "@/features/forms/utils";
import { ChartConfig } from "@/core/components/ui/chart";
import { FormTicks } from "./FormTicks";
import { TickProps } from "../types";
import { BarChart } from "./BarChart";

const config = {
  field_plannings: {
    label: getFormLabel("field_plannings"),
  },
  crop_establishments: {
    label: getFormLabel("crop_establishments"),
  },
  fertilization_records: {
    label: getFormLabel("fertilization_records"),
  },
  harvest_records: {
    label: getFormLabel("harvest_records"),
  },
  monitoring_visits: {
    label: getFormLabel("monitoring_visits"),
  },
  damage_assessments: {
    label: getFormLabel("damage_assessments"),
  },
  count: {
    label: "Form Count",
  }
} satisfies ChartConfig;

const header = {
  title: "Form Count Summary",
  description: "Number of forms collected for each type"
}

export const FormCountBarChart = memo(({ data }: { data: Array<FormCount> }) => {
  return <BarChart
    config={config}
    data={data}
    header={header}
    axisKeys={{ X: "form", Y: "count" }}
    axisOptions={{
      X: {
        interval: 0,
        tickFormatter: (value: string) => getFormLabel(value),
        tick: ({ x, y, payload }: TickProps) => <FormTicks x={x} y={y} payload={payload} />,
      }
    }}
  />
})
