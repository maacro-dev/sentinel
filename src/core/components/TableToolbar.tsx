import React, { memo } from "react"
import { SearchBar } from "./SearchBar"
import { cn } from "../utils/style"
import { X } from "lucide-react"
import { SentinelSelect } from "./forms/FormSelect";

interface FilterOption { label: string; value: string }

interface ColumnFilter {
  columnId: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface DefaultTableToolbarProps extends React.ComponentProps<"div"> {
  onSearchChange: React.ChangeEventHandler<HTMLInputElement>;
  defaultSearchPlaceholder?: string;
  actions?: React.ReactNode;
  columnFilters?: ColumnFilter[];
  onClearAll?: () => void;
}

export const DefaultTableToolbar = memo(({
  onSearchChange,
  defaultSearchPlaceholder = "Search something...",
  actions,
  columnFilters = [],
  onClearAll,
  className,
}: DefaultTableToolbarProps) => {
  const activeFilters = columnFilters.filter(f => f.value && f.value !== "all");

  return (
    <div className="flex flex-col gap-2">
      <div className={cn("flex items-center gap-2.5 flex-wrap", className)}>
        <SearchBar
          containerClassName="w-64"
          className="text-xs"
          placeholder={defaultSearchPlaceholder}
          onChange={onSearchChange}
        />

        {columnFilters.length > 0 && (
          <div className="w-px h-6 bg-border shrink-0" />
        )}

        {columnFilters.map((filter) => (
          <div key={filter.columnId} className="flex items-center gap-1.5">
            <div className="w-35">
              <SentinelSelect
                name={filter.columnId}
                label={filter.label}
                value={filter.value || "all"}
                onChange={(val) =>
                  filter.onChange(val === "all" ? "" : val)
                }
                options={[
                  { label: "All", value: "all" },
                  ...filter.options,
                ]}
                placeholder="All"
              />
            </div>
          </div>
        ))}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          {activeFilters.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 h-8 px-3 text-[11px] text-muted-foreground border border-border rounded-md hover:bg-secondary transition-colors"
            >
              <X size={12} /> Clear
            </button>
          )}
          {actions}
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {activeFilters.map((filter) => (
            <span
              key={filter.columnId}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] border border-border rounded-full bg-secondary text-muted-foreground"
            >
              {filter.label}: {filter.options.find(o => o.value === filter.value)?.label ?? filter.value}
              <button onClick={() => filter.onChange("")} className="hover:text-foreground transition-colors">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
});
