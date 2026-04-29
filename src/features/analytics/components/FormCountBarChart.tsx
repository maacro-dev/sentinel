import { memo, useState, useCallback, useMemo } from "react";
import { cn } from "@/core/utils/style";
import { getFormLabel } from "@/features/forms/utils";
import { ChartConfig } from "@/core/components/ui/chart";
import { TickProps } from "../types";
import { BarChart } from "./BarChart";
import { DefaultTicks } from "./DefaultTicks";
import { Sanitizer } from "@/core/utils/sanitizer";
import { FormCounts } from "../schemas/summary/formCount";

const dbKeyToConfigKey: Record<string, string> = {
  'field-data': 'field_plannings',
  'cultural-management': 'crop_establishments',
  'nutrient-management': 'fertilization_records',
  'production': 'harvest_records',
  'damage-assessment': 'damage_assessments',
};

const configKeyOrder = [
  'field_plannings',
  'crop_establishments',
  'fertilization_records',
  'harvest_records',
  'damage_assessments',
];

const baseConfig = {
  field_plannings: { label: getFormLabel("field_plannings") },
  crop_establishments: { label: getFormLabel("crop_establishments") },
  fertilization_records: { label: getFormLabel("fertilization_records") },
  harvest_records: { label: getFormLabel("harvest_records") },
  damage_assessments: { label: getFormLabel("damage_assessments") },
  count: { label: "Form Count" },
} satisfies ChartConfig;

const statusConfig: ChartConfig = {
  approved: { label: "Approved" },
  rejected: { label: "Rejected" },
  pending: { label: "Pending" },
  unknown: { label: "Imported" },
  count: { label: "Count" },
};

const header = {
  title: "Form Count Summary",
  description: "Number of forms collected for each type",
};

export const FormCountBarChart = memo(({ data }: { data: FormCounts }) => {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);

  const summaryData = useMemo(() => {
    return configKeyOrder
      .map(configKey => {
        const dbKey = Object.keys(dbKeyToConfigKey).find(key => dbKeyToConfigKey[key] === configKey);
        if (!dbKey || !(dbKey in data)) {
          return {
            form: configKey,
            configKey,
            count: 0,
          };
        }
        const counts = data[dbKey];
        return {
          form: configKey,
          configKey,
          count: counts.approved + counts.rejected + counts.pending + counts.unknown,
        };
      });
  }, [data]);

  const selectedFormData = useMemo(() => {
    if (!selectedForm) return null;
    const dbKey = Object.keys(dbKeyToConfigKey).find(key => dbKeyToConfigKey[key] === selectedForm);
    if (!dbKey || !(dbKey in data)) return null;
    return data[dbKey];
  }, [selectedForm, data]);

  const chartData = useMemo(() => {
    if (selectedFormData) {
      return [
        { status: 'approved', count: selectedFormData.approved },
        { status: 'rejected', count: selectedFormData.rejected },
        { status: 'pending', count: selectedFormData.pending },
        { status: 'unknown', count: selectedFormData.unknown },
      ];
    }
    return summaryData;
  }, [selectedFormData, summaryData]);

  const currentConfig = useMemo(() => {
    return selectedFormData ? statusConfig : baseConfig;
  }, [selectedFormData]);

  const axisKeys = useMemo(() => {
    return selectedFormData
      ? { X: "status", Y: "count" } as const
      : { X: "form", Y: "count" } as const;
  }, [selectedFormData]);

  const handleBarClick = useCallback((item: any) => {
    if (selectedForm) {
      setSelectedForm(null);
      return;
    }
    const configKey = item?.form ?? item?.payload?.form;
    if (configKey) {
      setSelectedForm(configKey);
    }
  }, [selectedForm]);

  return (
    <div className="flex flex-col gap-4 relative min-h-120">
      <div
        className={cn(
          "absolute left-1/2 transform -translate-x-1/2 top-8 z-10 transition-all duration-300 ease-in-out",
          selectedForm ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <span
          className="bg-muted text-foreground px-4 py-2 rounded-full text-xs shadow-sm cursor-pointer"
          onClick={() => setSelectedForm(null)}
        >
          Click any bar to return
        </span>
      </div>

      <BarChart
        data={chartData}
        config={currentConfig}
        header={
          selectedFormData
            ? {
              title: `Form Counts for ${getFormLabel(selectedForm!)}`,
              description: "Breakdown by status",
            }
            : header
        }
        axisKeys={axisKeys}
        isEmpty={chartData.every(d => d.count === 0)}
        onBarClick={handleBarClick}
        axisOptions={{
          X: {
            interval: 0,
            tick: ({ x, y, payload }: TickProps) => {
              const value = payload.value;
              const formatted = selectedFormData
                ? (statusConfig[value]?.label ?? Sanitizer.key(value))
                : getFormLabel(value);
              return <DefaultTicks x={x} y={y} payload={{ ...payload, value: formatted }} />;
            },
          },
          Y: {
            tickFormatter: (value: number) => value.toString(),
          },
        }}
      />
    </div>
  );
});
