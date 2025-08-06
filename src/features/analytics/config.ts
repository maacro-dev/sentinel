import { SummaryConfig } from "./types";

export const chartContainerDefaults = {
  className: "aspect-auto min-h-[280px] w-full h-56",
};

export const barColors = [
    "var(--color-humay)",
    "var(--color-humay-2)",
    "var(--color-humay-3)",
    "var(--color-humay-4)",
    "var(--color-humay-5)",
    "var(--color-humay-6)",
] as const

export const DASHBOARD_SUMMARY_CONFIG: SummaryConfig = {
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

export const FORM_PROGRESS_CONFIG: SummaryConfig = {
  "total_forms": {
    title: "Total Forms",
    subtitle: "Total number of forms submitted this season",
    unit: "forms"
  },
  "completed_forms": {
    title: "Completed Forms",
    subtitle: "Total number of forms completed this season",
    unit: "forms"
  },
  "pending_forms": {
    title: "Pending Forms",
    subtitle: "Total number of forms pending review",
    unit: "forms"
  },
  "rejected_forms": {
    title: "Rejected Forms",
    subtitle: "Total number of forms rejected this season",
    unit: "forms"
  }
}
