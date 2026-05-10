import * as React from "react";
import { ChevronsUpDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { cn } from "../utils/style";
import { Checkbox } from "./ui/checkbox";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  className?: string;
  maxDisplay?: number;
  onPrefetch?: (value: string) => void;
}

export function MultiSelect({
  label,
  placeholder = "Select…",
  options,
  values,
  onChange,
  disabled = false,
  className,
  maxDisplay = 2,
  onPrefetch,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const removeOne = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    onChange(values.filter((v) => v !== value));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const selectedLabels = values.map(
    (v) => options.find((o) => o.value === v)?.label ?? v
  );

  const visibleLabels = selectedLabels.slice(0, maxDisplay);
  const overflowCount = selectedLabels.length - maxDisplay;

  return (
    <div className="space-y-1">
      {label && (
        <Label className="text-xs text-muted-foreground">{label}</Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "min-w-37.5 w-auto h-8 text-2xs justify-between font-normal px-2",
              className
            )}
          >
            <span className="flex items-center gap-1 truncate">
              {values.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                <>
                  {visibleLabels.map((lbl, i) => (
                    <Badge
                      key={values[i]}
                      variant="secondary"
                      className="text-3xs lt:text-2xs hd:text-xs px-1 py-0 h-5 gap-0.5"
                    >
                      {lbl}
                      <span
                        role="button"
                        tabIndex={0}
                        className="ml-0.5 rounded-full hover:bg-muted cursor-pointer"
                        onClick={(e) => removeOne(e, values[i])}
                        onKeyDown={(e) =>
                          e.key === "Enter" && removeOne(e as any, values[i])
                        }
                      >
                        <X className="h-2.5 w-2.5" />
                      </span>
                    </Badge>
                  ))}
                  {overflowCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-3xs lt:text-2xs hd:text-xs px-1 py-0 h-5"
                    >
                      +{overflowCount} more
                    </Badge>
                  )}
                </>
              )}
            </span>

            <span className="flex items-center gap-0.5 shrink-0 ml-1">
              {values.length > 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  className="rounded-full hover:bg-muted p-0.5 cursor-pointer"
                  onClick={clearAll}
                  onKeyDown={(e) => e.key === "Enter" && clearAll(e as any)}
                  aria-label="Clear all"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </span>
              )}
              <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-48 p-0 max-h-96"
          align="start"
          side="bottom"
        >
          <Command>
            <CommandInput
              placeholder="Search…"
              className="text-2xs h-8"
            />
            <CommandList className="max-h-80">
              <CommandEmpty className="text-2xs py-4 text-center text-muted-foreground">
                No results found.
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = values.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => toggle(option.value)}
                      onMouseEnter={() => onPrefetch?.(option.value)}
                      className="rounded-lg text-3xs lt:text-2xs hd:text-xs cursor-pointer"
                    >
                      <Checkbox
                        checked={isSelected}
                        className="pointer-events-none"
                      />
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default MultiSelect;
