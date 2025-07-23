import { ChartConfig } from "@/core/components/ui/chart";
import { StatMetadata } from "./types";

export const YIELD_CHART_CONFIG = {
  avg_yield_t_ha: {
    label: "Yield (t/ha)",
    color: "var(--color-humay)",
  }
} satisfies ChartConfig;


export const DASHBOARD_STATS_CONFIG: Record<string, StatMetadata> = {
  field_count: {
    title: "Registered Fields",
    subtitle: "Fields registered this season",
    unit: "fields",
  },
  form_submission: {
    title: "Form Submissions",
    subtitle: "Forms submitted this season",
    unit: "forms",
  },
  harvested_area: {
    title: "Harvested Area",
    subtitle: "Area harvested this season",
    unit: "ha",
  },
  yield: {
    title: "Average Yield",
    subtitle: "Yield per hectare",
    unit: "kg/ha",
  },
  irrigation: {
    title: "Irrigation Issues",
    subtitle: "Fields requiring attention",
    unit: "fields",
  },
  data_completeness: {
    title: "Data Completeness",
    subtitle: "Percentage of fields with data",
    unit: "%",
  },
  damage_report: {
    title: "Damage Reports",
    subtitle: "Incidents reported this season",
    unit: "reports",
  },
  pest_report: {
    title: "Pest Reports",
    subtitle: "Incidents reported this season",
    unit: "reports",
  }
}
