import { ComponentProps, memo, useCallback, useEffect, useState } from "react";
import { Clickable, ClickableProps } from "./Clickable";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { cn } from "../utils/style";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

function Pagination({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-4 py-2.5 border-t",
        className
      )}
      {...props}
    />
  );
}

interface PaginationControlProps extends ClickableProps {
  controlIcon: React.ReactNode;
}

const PaginationControl = memo(({ controlIcon, ...props }: PaginationControlProps) => {
  return (
    <Clickable variant="outline" className="p-1.5" {...props}>
      {controlIcon}
    </Clickable>
  );
})

function PaginationPrevious(props: ComponentProps<typeof Clickable>) {
  return <PaginationControl controlIcon={<ArrowLeftIcon className="size-3" />} {...props} />;
}

function PaginationNext(props: ComponentProps<typeof Clickable>) {
  return <PaginationControl controlIcon={<ArrowRightIcon className="size-3" />} {...props} />;
}

interface PaginationInputProps {
  current?: number;
  total?: number;
  navigateFn?: (page: number) => void;
}

function PaginationInput({
  current = 1,
  total = 1,
  navigateFn
}: PaginationInputProps) {
  const [value, setValue] = useState(String(current));

  useEffect(() => { setValue(String(current)) }, [current]);

  const commit = useCallback(() => {
    const num = Number(value);
    if (!Number.isNaN(num)) {
      navigateFn?.(Math.min(Math.max(num, 1), total));
    } else {
      setValue(String(current));
    }
  }, [current, navigateFn, total, value]);

  return (
    <div className="flex items-center gap-1.5 text-3xs text-muted-foreground/75">
      <span>Page</span>
      <Input
        role="spinbutton"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commit();
          }
        }}
        className="text-3xs font-semibold text-accent-foreground/75"
        containerClassName="h-[32px] w-8 rounded-sm bg-accent/60 px-1.5 "
      />
      <span className="w-9">of {total}</span>
    </div>
  )
}

interface PaginationSizeSelectorProps extends ComponentProps<typeof SelectTrigger> {
  value: number;
  onValueChange: (value: number) => void;
}

const PaginationSizeSelector = memo(({
  className, value, onValueChange, ...props
}: PaginationSizeSelectorProps) => {

  return (
    <Select value={String(value)} defaultValue={String(value)} onValueChange={(val) => onValueChange(Number(val))}>
      <SelectTrigger
        className={cn(
          "focus-visible:ring-transparent focus-visible:border-border !h-[32px] rounded-sm px-2 py-0 text-3xs text-muted-foreground shadow-none",
          className
        )}
        size="sm" {...props}
      >
        <SelectValue placeholder="Items per page" />
      </SelectTrigger>
      <SelectContent className="shadow-none">
        <SelectGroup className="text-muted-foreground/75">
          <SelectItem className="text-3xs" value="10">10 per page</SelectItem>
          <SelectItem className="text-3xs" value="25">25 per page</SelectItem>
          <SelectItem className="text-3xs" value="50">50 per page</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
})

interface PaginationTotalRowsProps extends ComponentProps<"span"> {
  totalRows: number;
}

export const PaginationTotalRows = memo(({
  totalRows,
  className,
  ...props
}: PaginationTotalRowsProps) => {
  return (
    <span className={cn("text-3xs text-muted-foreground/75", className)} {...props}>
      {totalRows} records
    </span>
  );
})

Pagination.Previous = PaginationPrevious;
Pagination.Next = PaginationNext;
Pagination.Input = PaginationInput;
Pagination.SizeSelector = PaginationSizeSelector;
Pagination.TotalRows = PaginationTotalRows;

export { Pagination };
