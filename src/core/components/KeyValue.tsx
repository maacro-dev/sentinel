import React from "react";
import { cn } from "../utils/style";

export type KVPair<Key = any, Value = React.ReactNode> = {
  key: Key;
  value: Value;
};

export interface KVListProps extends React.ComponentProps<"div"> {
  itemsPerColumn?: number;
  containerClassName?: string;
  children?: React.ReactNode;
}

export const KVList = ({
  containerClassName,
  className,
  itemsPerColumn = 6,
  children,
  ...props
}: KVListProps) => {
  const childArray = React.Children.toArray(children);

  const columns: React.ReactNode[][] = Array.from(
    { length: Math.ceil(childArray.length / itemsPerColumn) },
    (_, i) => childArray.slice(i * itemsPerColumn, i * itemsPerColumn + itemsPerColumn)
  );

  return (
    <div className={cn("flex", containerClassName)} {...props}>
      {columns.map((colItems, colIndex) => (
        <dl key={colIndex} className={cn("flex flex-col gap-4 flex-1", className)}>
          {colItems}
        </dl>
      ))}
    </div>
  );
};

export interface KVItemProps extends React.ComponentProps<"div"> {
  pair: KVPair<string, React.ReactNode>;
  variant?: "stacked" | "side";
  icon?: React.ReactNode;
  iconClassName?: string;
}

export const KVItem = ({
  pair: { key, value },
  variant = "stacked",
  icon,
  iconClassName,
  className,
  ...props
}: KVItemProps) => {
  if (variant === "side") {
    return (
      <div
        className={cn("w-full flex flex-row justify-between items-center py-0.5", className)}
        {...props}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon && <span className={cn("text-muted-foreground shrink-0", iconClassName)}>{icon}</span>}
          <dt className="text-xs text-muted-foreground font-medium truncate">{key}</dt>
        </div>
        <dd className="text-sm font-medium truncate max-w-[45%] text-right">{value}</dd>
      </div>
    );
  }

  // stacked (default) — icon on left, label above value
  return (
    <div className={cn("flex items-start gap-3 py-0.5", className)} {...props}>
      {icon && <span className={cn("text-muted-foreground shrink-0", iconClassName)}>{icon}</span>}
      <div className="flex flex-col gap-0.5 min-w-0">
        <dt className="text-3xs text-muted-foreground font-medium truncate">{key}</dt>
        <dd className="text-sm font-medium truncate">{value}</dd>
      </div>
    </div>
  );
};
