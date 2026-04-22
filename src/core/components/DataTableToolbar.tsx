import React, { useState } from "react";
import { Table as TanstackTable } from "@tanstack/react-table";
import { SearchBar } from "./SearchBar";
import { cn } from "../utils/style";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Field, FieldContent, FieldLabel } from "./ui/field";
import { Button } from "./ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown, ListFilter, X } from "lucide-react";
import { Label } from "./ui/label";

interface TableToolbarProps<T> extends React.ComponentProps<"div"> {
  table: TanstackTable<T>;
  defaultSearchPlaceholder?: string;
  actions?: React.ReactNode;
}


export const TableToolbar = <T,>({
  table,
  defaultSearchPlaceholder = "Search any columns...",
  actions,
  className,
}: TableToolbarProps<T>) => {
  "use no memo";

  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      <SearchBar
        containerClassName="w-56"
        className="text-xs"
        placeholder={defaultSearchPlaceholder}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
      />
      <SortDropdown table={table} />
      <FilterDropdown table={table} />

      {actions && <div className="ml-auto shrink-0">{actions}</div>}
    </div>
  );
}


function SortDropdown<T>({ table }: { table: TanstackTable<T> }) {

  const sortableColumns = table.getAllColumns().filter((col) => col.getCanSort() && typeof col.columnDef.header === "string");
  const sorting = table.getState().sorting;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("text-xs gap-2 shrink-0 text-muted-foreground", sorting.length > 0 && "bg-accent text-foreground")}
        >
          <ArrowUpDown className="size-3" />
          {sorting.length > 0 ? `Sorted by ${sorting.length} rule${sorting.length !== 1 ? "s" : ""}` : "Sort"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52 shadow-xs p-2 flex flex-col gap-1">
        <Label className="text-3xs font-normal text-muted-foreground px-0.5">Sort by</Label>
        {sortableColumns.map((col) => {
          const isSorted = col.getIsSorted();
          return (
            <div key={col.id} className="flex items-center gap-1 rounded px-0.5 py-0.5 hover:bg-accent">
              <span className="text-3xs text-muted-foreground flex-1 truncate px-1">
                {col.columnDef.header as string}
              </span>
              <button
                onClick={() => col.toggleSorting(false)}
                className={cn("p-1 rounded transition-colors hover:text-foreground", isSorted === "asc" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
              >
                <ArrowUp className="size-3" />
              </button>
              <button
                onClick={() => col.toggleSorting(true)}
                className={cn(
                  "p-1 rounded transition-colors hover:text-foreground",
                  isSorted === "desc" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                <ArrowDown className="size-3" />
              </button>
              {isSorted && (
                <button
                  onClick={() => col.clearSorting()}
                  className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          );
        })}
        {sorting.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <button
              className="text-3xs text-muted-foreground hover:text-foreground transition-colors text-left px-1"
              onClick={() => table.resetSorting()}
            >
              Clear all sorts
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


function FilterDropdown<T>({ table }: { table: TanstackTable<T> }) {
  const [expandedCol, setExpandedCol] = useState<string | null>(null);

  const filterableColumns = table.getAllColumns().filter((col) => col.getCanFilter() &&
    (col.columnDef.meta?.filterVariant ?? "none") !== "none" &&
    typeof col.columnDef.header === "string"
  );
  const columnFilters = table.getState().columnFilters;

  return (
    <DropdownMenu onOpenChange={(open) => { if (!open) setExpandedCol(null); }}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("text-xs gap-2 shrink-0 text-muted-foreground", columnFilters.length > 0 && "bg-accent text-foreground")}
        >
          <ListFilter className="size-3" />
          {columnFilters.length > 0 ? `Filtered by ${columnFilters.length} rule${columnFilters.length !== 1 ? "s" : ""}` : "Filter"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 shadow-xs p-2 flex flex-col gap-1"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Label className="text-3xs font-normal text-muted-foreground px-0.5">Filter by</Label>
        {filterableColumns.map((col) => {
          const isExpanded = expandedCol === col.id;
          const isFiltered = col.getIsFiltered();
          const filterVariant = col.columnDef.meta?.filterVariant ?? "none";
          const staticOptions = col.columnDef.meta?.filterOptions;
          const facetOptions = Array.from(col.getFacetedUniqueValues().keys())
            .filter(Boolean).sort()
            .map((v) => ({ label: String(v), value: String(v) }));
          const filterOptions = staticOptions ?? facetOptions;
          const selectedValues: string[] = Array.isArray(col.getFilterValue())
            ? (col.getFilterValue() as string[])
            : [];

          const toggleValue = (value: string) => {
            const next = selectedValues.includes(value)
              ? selectedValues.filter((v) => v !== value)
              : [...selectedValues, value];
            col.setFilterValue(next.length ? next : undefined);
          };

          return (
            <div key={col.id} className="flex flex-col">
              <button
                className={cn(
                  "flex items-center gap-2 rounded px-1 py-1 hover:bg-accent text-left",
                  isExpanded && "bg-accent"
                )}
                onClick={() => setExpandedCol(isExpanded ? null : col.id)}
              >
                <span className="text-3xs text-muted-foreground flex-1 truncate">
                  {col.columnDef.header as string}
                </span>
                {isFiltered && (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <button
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      onClick={(e) => { e.stopPropagation(); col.setFilterValue(undefined); }}
                    >
                      <X className="size-3" />
                    </button>
                  </>
                )}
              </button>

              {isExpanded && (
                <div className="pl-2 pb-1 flex flex-col gap-1 mt-0.5">
                  {(filterVariant === "options" || filterVariant === "options-search") && (
                    <ColumnFilterOptions
                      colId={col.id}
                      filterOptions={filterOptions}
                      filterVariant={filterVariant}
                      selectedValues={selectedValues}
                      onToggle={toggleValue}
                    />
                  )}
                  {filterVariant === "search" && (
                    <ColumnFilterSearch col={col} />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {columnFilters.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <button
              className="text-3xs text-muted-foreground hover:text-foreground transition-colors text-left px-1"
              onClick={() => table.resetColumnFilters()}
            >
              Clear all filters
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


function ColumnFilterOptions({
  colId,
  filterOptions,
  filterVariant,
  selectedValues,
  onToggle,
}: {
  colId: string;
  filterOptions: { label: string; value: string }[];
  filterVariant: string;
  selectedValues: string[];
  onToggle: (v: string) => void;
}) {
  const [query, setQuery] = useState("");
  const visible = query
    ? filterOptions.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : filterOptions;

  return (
    <>
      {filterVariant === "options-search" && (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <Input
            containerClassName="py-0.5 rounded-sm"
            className="h-5 text-xs"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
          />
          {query && (
            <button
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setQuery("")}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col gap-0.5 max-h-36 overflow-y-auto">
        {visible.length === 0 && (
          <span className="text-3xs text-muted-foreground px-1 py-0.5">No results</span>
        )}
        {visible.map((opt) => (
          <Field
            key={opt.value}
            orientation="horizontal"
            className="rounded px-0.5 py-0.5 hover:bg-background cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onToggle(opt.value); }}
          >
            <Checkbox
              id={`toolbar-filter-${colId}-${opt.value}`}
              checked={selectedValues.includes(opt.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <FieldContent>
              <FieldLabel
                htmlFor={`toolbar-filter-${colId}-${opt.value}`}
                className="text-3xs font-normal text-muted-foreground cursor-pointer"
                onClick={(e) => e.preventDefault()}
              >
                {opt.label}
              </FieldLabel>
            </FieldContent>
          </Field>
        ))}
      </div>
    </>
  );
}

function ColumnFilterSearch<T>({ col }: { col: ReturnType<TanstackTable<T>["getAllColumns"]>[number] }) {
  const currentValue = (col.getFilterValue() as string) ?? "";
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <Input
        containerClassName="py-0.5 rounded-sm"
        className="h-5 text-xs"
        placeholder={`Filter ${(col.columnDef.header as string).toLowerCase()}…`}
        value={currentValue}
        onChange={(e) => col.setFilterValue(e.target.value || undefined)}
        onKeyDown={(e) => e.stopPropagation()}
      />
      {currentValue && (
        <button
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => col.setFilterValue(undefined)}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
