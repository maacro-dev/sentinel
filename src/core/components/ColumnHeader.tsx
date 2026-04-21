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
import { useState } from "react";
import { Label } from "./ui/label";

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
  const filterOptions = column.columnDef.meta?.filterOptions;
  const filterVariant = column.columnDef.meta?.filterVariant ?? 'none';

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
          <ChevronDown size={12} className="mr-2"/>
          {isFiltered && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40 shadow-xs">
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

        {/* {canSort && canFilter && <DropdownMenuSeparator />} */}

        {canFilter && filterVariant !== 'none' && (
          <div className="p-2 flex flex-col gap-2">
            <div className="flex items-center justify-between h-5">
              <Label className="text-xs font-normal text-muted-foreground">
                Filter
              </Label>
              {isFiltered && (
                <button
                  className="text-3xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => {
                    column.setFilterValue(undefined);
                    setFilterValue("");
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {filterOptions ? (
              <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
                {filterOptions.map((opt) => (
                  <label
                    className="flex items-center gap-2 rounded px-1 py-1 hover:bg-accent cursor-pointer"
                  >
                    <Checkbox
                      id={`filter-${column.id}-${opt.value}`}
                      checked={selectedValues.includes(opt.value)}
                      onCheckedChange={() => toggleCheckboxValue(opt.value)}
                    />
                    <span className="text-3xs font-normal text-muted-foreground">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
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
                      setFilterValue("");
                      column.setFilterValue(undefined);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
