import { memo, useState, useCallback, useMemo } from "react";
import { cn } from "@/core/utils/style";
import { getFormLabel } from "@/features/forms/utils";
import { TickProps } from "../types";
import { DefaultTicks } from "./DefaultTicks";
import { Sanitizer } from "@/core/utils/sanitizer";
import { GroupedBarChart } from "./GroupedBarChart/GroupedBarChart";

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

const header = {
  title: "Form Count Summary",
  description: "Number of forms collected for each type",
};

export const FormCountBarChart = memo(({ data }: { data: any }) => {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);

  const summaryData = useMemo(() => {
    return configKeyOrder.map(configKey => {
      const dbKey = Object.keys(dbKeyToConfigKey).find(key => dbKeyToConfigKey[key] === configKey);
      if (!dbKey || !(dbKey in data)) {
        return { form: configKey, count: 0 };
      }
      const counts = data[dbKey];
      return {
        form: configKey,
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

  const categoryKey = selectedFormData ? "status" : "form";
  const barKeys = [
    {
      key: "count",
      name: selectedFormData ? "Count" : "Form Count",
      color: "var(--color-humay)",
    },
  ];

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

  const xAxisTick = useCallback(
    ({ x, y, payload }: TickProps) => {
      const value = payload.value;
      const formatted = selectedFormData
        ? Sanitizer.key(value)
        : getFormLabel(value);
      return <DefaultTicks x={x} y={y} payload={{ ...payload, value: formatted }} />;
    },
    [selectedFormData]
  );

  const isEmpty = chartData.every(d => d.count === 0);

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

      <GroupedBarChart
        data={chartData as any[]}
        categoryKey={categoryKey as any}
        barKeys={barKeys as any}
        header={
          selectedFormData
            ? {
              title: `Form Counts for ${getFormLabel(selectedForm!)}`,
              description: "Breakdown by status",
            }
            : header
        }
        isEmpty={isEmpty}
        layout="horizontal"
        cardClass="min-h-120"
        getBarSize={() => 56}
        onBarClick={handleBarClick}
        labelFormatter={(value: any) => {
          if (value === 0 || value === "0") return "N/A";
          const num = typeof value === "number" ? value : parseFloat(value);
          if (!isNaN(num) && num !== 0) return Math.round(num).toString();
          return value;
        }}
        axisOptions={{
          X: {
            interval: 0,
            tick: xAxisTick,
          },
          Y: {
            tickFormatter: (value: number) => Math.round(value).toString(),
            allowDecimals: false,
          },
        }}
      />
    </div>
  );
});
