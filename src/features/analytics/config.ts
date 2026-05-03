import { SummaryConfig } from "./types";

export const chartContainerDefaults = {
  className: "w-full h-full dt:h-full hd:h-full",
};

export const barColors = [
  "var(--color-humay)",
  "var(--color-humay-2)",
  "var(--color-humay-3)",
  "var(--color-humay-4)",
  "var(--color-humay-5)",
  "var(--color-humay-6)",
] as const

export const INVERTED_METRIC_KEYS = new Set(["irrigation", "damage_report", "pest_report"]);

export const DASHBOARD_SUMMARY_CONFIG: SummaryConfig = {
  field_count: {
    key: "Registered Fields",
    title: "Registered Fields",
    subtitle: "Fields registered this season",
    unit: "fields",
  },
  form_submission: {
    key: "Form Submissions",
    title: "Form Submissions",
    subtitle: "Forms submitted this season",
    unit: "forms",
  },
  harvested_area: {
    key: "Harvested Area",
    title: "Harvested Area",
    subtitle: "Area harvested this season",
    unit: "ha",
  },
  yield: {
    key: "Average Yield",
    title: "Average Yield",
    subtitle: "Yield per hectare",
    unit: "t/ha",
  },
  irrigation: {
    key: "Irrigation Issues",
    title: "Irrigation Issues",
    subtitle: "Fields requiring attention",
    unit: "fields",
  },
  data_completeness: {
    key: "Approved Forms",
    title: "Approved Forms",
    subtitle: "Percentage of fields with data",
    unit: "%",
  },
  damage_report: {
    key: "Damage Reports",
    title: "Damage Reports",
    subtitle: "Incidents reported this season",
    unit: "reports",
  },
  pest_report: {
    key: "Pest Reports",
    title: "Pest Reports",
    subtitle: "Incidents reported this season",
    unit: "reports",
  }
}

export const FORM_PROGRESS_CONFIG: SummaryConfig = {
  "total_forms": {
    key: "Total Forms",
    title: "Total Forms",
    subtitle: "Total number of forms submitted this season",
    unit: "forms"
  },
  "completed_forms": {
    key: "Verified Forms",
    title: "Verified Forms",
    subtitle: "Total number of forms completed this season",
    unit: "forms"
  },
  "pending_forms": {
    key: "Pending Forms",
    title: "Pending Forms",
    subtitle: "Total number of forms pending review",
    unit: "forms"
  },
  "rejected_forms": {
    key: "Rejected Forms",
    title: "Rejected Forms",
    subtitle: "Total number of forms rejected this season",
    unit: "forms"
  },
  unknown_forms: {
    key: 'Imported',
    title: 'Imported',
    subtitle: "Total number of forms imported this season",
    unit: "forms"
  },
} as const


export const VARIETY_LIMIT_OPTIONS = [5, 8, 12, 20] as const;
