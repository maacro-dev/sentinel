import { Column } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { Input } from "@/core/components/ui/input";
import { Checkbox } from "@/core/components/ui/checkbox";
import { cn } from "@/core/utils/style";
import { ArrowDown, ArrowUp, ChevronDown, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Label } from "./ui/label";
import { Field, FieldContent, FieldLabel } from "./ui/field";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from "date-fns";
import { DatePicker } from "./DatePicker";

export interface FilterOption {
  label: string;
  value: string;
}

interface ColumnHeaderProps<T> {
  column: Column<T, unknown>;
  title: string;
  className?: string;
}

export function ColumnHeader<T>({ column, title, className }: ColumnHeaderProps<T>) {
  const [filterValue, setFilterValue] = useState("");

  const isSorted = column.getIsSorted();
  const isFiltered = column.getIsFiltered();
  const canSort = column.getCanSort();
  const canFilter = column.getCanFilter();
  const staticOptions = column.columnDef.meta?.filterOptions;
  const filterVariant = column.columnDef.meta?.filterVariant ?? 'none';

  const filterOptions = useMemo(() => {
    if (staticOptions) return staticOptions;
    if (filterVariant === 'options' || filterVariant === 'options-search') {
      return Array.from(column.getFacetedUniqueValues().keys())
        .filter(Boolean)
        .sort()
        .map((v) => ({ label: String(v), value: String(v) }));
    }
    return undefined;
  }, [staticOptions, filterVariant, column.getFacetedUniqueValues()]);

  const selectedValues: string[] = Array.isArray(column.getFilterValue())
    ? (column.getFilterValue() as string[])
    : [];

  if (!canSort && !canFilter) {
    return <span className={cn("truncate", className)}>{title}</span>;
  }

  const toggleCheckboxValue = (value: string) => {
    const next = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    column.setFilterValue(next.length ? next : undefined);
  };

  const clearFilter = () => {
    column.setFilterValue(undefined);
    setFilterValue("");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1 group w-full truncate -ml-0.5 px-0.5 rounded justify-between h-full",
            "hover:text-foreground transition-colors focus-visible:outline-none cursor-pointer",
            (isSorted || isFiltered) && "text-foreground",
            className,
          )}
        >
          <span className="truncate">{title}</span>
          <div className="flex gap-2 items-center">
            {isFiltered && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            )}
            <ChevronDown size={12} className="mr-2" />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 shadow-xs">
        {canSort && (
          <>
            <DropdownMenuItem
              className={cn("gap-1.5 text-3xs text-muted-foreground", isSorted === "asc" && "bg-accent")}
              onClick={() => column.toggleSorting(false)}
            >
              <ArrowUp className="size-3 text-muted-foreground" />
              Sort Ascending
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn("gap-1.5 text-3xs text-muted-foreground", isSorted === "desc" && "bg-accent")}
              onClick={() => column.toggleSorting(true)}
            >
              <ArrowDown className="size-3 text-muted-foreground" />
              Sort Descending
            </DropdownMenuItem>
            {isSorted && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-1.5 text-3xs text-muted-foreground"
                  onClick={() => column.clearSorting()}
                >
                  <X className="size-3 text-muted-foreground" />
                  Clear sort
                </DropdownMenuItem>
              </>
            )}
          </>
        )}

        {canFilter && filterVariant !== 'none' && (
          <div className="p-2 flex flex-col gap-2">
            <div className="flex items-center justify-between h-5">
              <Label className="text-xs font-normal text-muted-foreground">
                Filter
              </Label>
              {isFiltered && (
                <button
                  className="text-3xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  onClick={clearFilter}
                >
                  Clear
                </button>
              )}
            </div>

            {filterVariant === 'options-search' && filterOptions ? (
              <OptionsSearchFilter
                column={column}
                filterOptions={filterOptions}
                selectedValues={selectedValues}
                toggleCheckboxValue={toggleCheckboxValue}
              />
            ) : filterVariant === 'options' && filterOptions ? (
              <CheckboxList
                column={column}
                filterOptions={filterOptions}
                selectedValues={selectedValues}
                toggleCheckboxValue={toggleCheckboxValue}
              />
            ) : filterVariant === 'search' ? (
              <div className="relative">
                <Input
                  containerClassName="py-1 rounded-sm"
                  className="h-5 text-xs"
                  placeholder={`Filter ${title.toLowerCase()}…`}
                  value={filterValue}
                  onChange={(e) => {
                    setFilterValue(e.target.value);
                    column.setFilterValue(e.target.value || undefined);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                {filterValue && (
                  <button
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilter();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ) : filterVariant === 'boolean' ? (
              <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
                {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map((opt) => {
                  const currentValue = column.getFilterValue();
                  const isSelected = currentValue === opt.value;
                  return (
                    <Field
                      key={String(opt.value)}
                      orientation="horizontal"
                      className="rounded px-0.5 py-1 hover:bg-accent cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        column.setFilterValue(isSelected ? undefined : opt.value);
                      }}
                    >
                      <Checkbox
                        id={`filter-${column.id}-${opt.value}`}
                        checked={isSelected}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <FieldContent>
                        <FieldLabel
                          htmlFor={`filter-${column.id}-${opt.value}`}
                          className="text-3xs font-normal text-muted-foreground cursor-pointer"
                          onClick={(e) => e.preventDefault()}
                        >
                          {opt.label}
                        </FieldLabel>
                      </FieldContent>
                    </Field>
                  );
                })}
              </div>
            ) : filterVariant === 'date-range' ? (
              <DateRangeFilter column={column} />
            ) : filterVariant === 'date-preset' ? (
              <DatePresetFilter column={column} />
            ) : null}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


function DateRangeFilter<T>({ column }: { column: Column<T, unknown> }) {
  const filterValue = column.getFilterValue() as [Date | null, Date | null] | undefined;
  const [from, to] = filterValue ?? [null, null];

  const setFrom = (date: Date) => {
    const next: [Date | null, Date | null] = [date, to];
    column.setFilterValue(next);
  };

  const setTo = (date: Date) => {
    const next: [Date | null, Date | null] = [from, date];
    column.setFilterValue(next);
  };

  const clearFrom = () => {
    const next: [Date | null, Date | null] = [null, to];
    column.setFilterValue(next[1] ? next : undefined);
  };

  const clearTo = () => {
    const next: [Date | null, Date | null] = [from, null];
    column.setFilterValue(next[0] ? next : undefined);
  };

  return (
    <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-3xs text-muted-foreground/70">From</span>
          {from && (
            <button
              className="text-3xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={clearFrom}
            >
              <X className="size-2.5" />
            </button>
          )}
        </div>
        <DatePicker
          value={from ?? ""}
          onSelect={setFrom}
          maxDate={to ?? undefined}
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-3xs text-muted-foreground/70">To</span>
          {to && (
            <button
              className="text-3xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={clearTo}
            >
              <X className="size-2.5" />
            </button>
          )}
        </div>
        <DatePicker
          value={to ?? ""}
          onSelect={setTo}
          minDate={from ?? undefined}
        />
      </div>
    </div>
  );
}


type Preset = { label: string; range: () => [Date, Date] };

const DATE_PRESETS: Preset[] = [
  {
    label: 'Today',
    range: () => [startOfDay(new Date()), endOfDay(new Date())],
  },
  {
    label: 'Yesterday',
    range: () => {
      const d = subDays(new Date(), 1);
      return [startOfDay(d), endOfDay(d)];
    },
  },
  {
    label: 'Last 7 days',
    range: () => [startOfDay(subDays(new Date(), 6)), endOfDay(new Date())],
  },
  {
    label: 'Last 30 days',
    range: () => [startOfDay(subDays(new Date(), 29)), endOfDay(new Date())],
  },
  {
    label: 'This month',
    range: () => [startOfMonth(new Date()), endOfMonth(new Date())],
  },
];

function DatePresetFilter<T>({ column }: { column: Column<T, unknown> }) {
  const [showCustom, setShowCustom] = useState(false);
  const filterValue = column.getFilterValue() as [Date | null, Date | null] | undefined;

  const activePreset = filterValue
    ? DATE_PRESETS.find((p) => {
        const [pFrom, pTo] = p.range();
        const [fFrom, fTo] = filterValue;
        return (
          fFrom instanceof Date &&
          fTo instanceof Date &&
          fFrom.getTime() === pFrom.getTime() &&
          fTo.getTime() === pTo.getTime()
        );
      })
    : undefined;

  const selectPreset = (preset: Preset) => {
    const isActive = activePreset?.label === preset.label;
    column.setFilterValue(isActive ? undefined : preset.range());
    setShowCustom(false);
  };

  return (
    <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
      {DATE_PRESETS.map((preset) => {
        const isActive = activePreset?.label === preset.label;
        return (
          <button
            key={preset.label}
            className={cn(
              "text-left text-3xs px-2 py-1.5 rounded-sm transition-colors",
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            onClick={() => selectPreset(preset)}
          >
            {preset.label}
          </button>
        );
      })}

      <button
        className={cn(
          "text-left text-3xs px-2 py-1.5 rounded transition-colors mt-0.5 border-t pt-2",
          showCustom || (!activePreset && filterValue)
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => {
          setShowCustom((v) => !v);
          if (activePreset) column.setFilterValue(undefined);
        }}
      >
        Custom range…
      </button>

      {(showCustom || (!activePreset && filterValue)) && (
        <div className="mt-1 flex flex-col gap-2 pl-1">
          <DateRangeFilter column={column} />
        </div>
      )}
    </div>
  );
}


function CheckboxOption<T>({
  column,
  opt,
  checked,
  onToggle,
}: {
  column: Column<T, unknown>;
  opt: FilterOption;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Field
      key={opt.value}
      orientation="horizontal"
      className="rounded px-0.5 py-1 hover:bg-accent cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <Checkbox
        id={`filter-${column.id}-${opt.value}`}
        checked={checked}
        onClick={(e) => e.stopPropagation()}
      />
      <FieldContent>
        <FieldLabel
          htmlFor={`filter-${column.id}-${opt.value}`}
          className="text-3xs font-normal text-muted-foreground cursor-pointer"
          onClick={(e) => e.preventDefault()}
        >
          {opt.label}
        </FieldLabel>
      </FieldContent>
    </Field>
  );
}

function CheckboxList<T>({
  column,
  filterOptions,
  selectedValues,
  toggleCheckboxValue,
}: {
  column: Column<T, unknown>;
  filterOptions: FilterOption[];
  selectedValues: string[];
  toggleCheckboxValue: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {filterOptions.map((opt) => (
        <CheckboxOption
          key={opt.value}
          column={column}
          opt={opt}
          checked={selectedValues.includes(opt.value)}
          onToggle={() => toggleCheckboxValue(opt.value)}
        />
      ))}
    </div>
  );
}

function OptionsSearchFilter<T>({
  column,
  filterOptions,
  selectedValues,
  toggleCheckboxValue,
}: {
  column: Column<T, unknown>;
  filterOptions: FilterOption[];
  selectedValues: string[];
  toggleCheckboxValue: (value: string) => void;
}) {
  const [query, setQuery] = useState('');
  const visible = query
    ? filterOptions.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : filterOptions;

  return (
    <>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <Input
          containerClassName="py-1 rounded-sm"
          className="h-5 text-xs"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
        />
        {query && (
          <button
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setQuery('')}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-0.5 max-h-40 overflow-y-auto">
        {visible.length === 0 && (
          <span className="text-3xs text-muted-foreground px-1 py-1">No results</span>
        )}
        {visible.map((opt) => (
          <CheckboxOption
            key={opt.value}
            column={column}
            opt={opt}
            checked={selectedValues.includes(opt.value)}
            onToggle={() => toggleCheckboxValue(opt.value)}
          />
        ))}
      </div>
    </>
  );
}
