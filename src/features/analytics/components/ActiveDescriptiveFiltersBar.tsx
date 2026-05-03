import { X } from "lucide-react";
import { DescriptiveFilters } from "@/features/analytics/types";
import { Label } from "@/core/components/ui/label";

interface ActiveDescriptiveFiltersBarProps {
  filters: DescriptiveFilters;
  onClear: (key: keyof DescriptiveFilters) => void;
  onClearAll: () => void;
}

const FILTER_LABELS: Record<keyof DescriptiveFilters, string> = {
  province: "Province",
  municipality: "Municipality",
  barangay: "Barangay",
  method: "Method",
  variety: "Variety",
  fertilizer: "Fertilizer",
};

export function ActiveDescriptiveFiltersBar({
  filters,
  onClear,
  onClearAll,
}: ActiveDescriptiveFiltersBarProps) {
  const activeEntries = Object.entries(filters).filter(
    ([_, value]) => value != null && value !== ""
  ) as [keyof DescriptiveFilters, string][];

  const hasFilters = activeEntries.length > 0;

  return (
    <div className="flex min-h-12 flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-4 py-1.5 text-sm">
      <Label className="text-muted-foreground">
        {hasFilters ? "Active filters:" : "No filters active"}
      </Label>

      {activeEntries.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 rounded-sm bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
        >
          <span className="text-muted-foreground">{FILTER_LABELS[key]}:</span> {value}
          <button
            onClick={() => onClear(key)}
            className="ml-1 rounded-sm p-0.5 hover:bg-accent transition-colors"
            aria-label={`Remove ${FILTER_LABELS[key]} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {activeEntries.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-muted-foreground underline hover:text-foreground transition-colors ml-2"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
