import React from "react";
import { cn } from "../utils/style";

export type KVPair<Key = any, Value = any> = {
  key: Key;
  value: Value;
};

export interface KVListProps extends React.ComponentProps<"div"> {
  itemsPerColumn?: number;
  containerClassName?: string;
}

export const KVList = ({ containerClassName, className, itemsPerColumn = 6, children, ...props }: KVListProps) => {
  const childArray = React.Children.toArray(children);

  // refactor: don't use loops ples
  const columns: React.ReactNode[][] = [];
  for (let i = 0; i < childArray.length; i += itemsPerColumn) {
    columns.push(childArray.slice(i, i + itemsPerColumn));
  }

  return (
    <div className={cn(`flex`, containerClassName)} {...props}>
      {columns.map((colItems, colIndex) => (
        <dl key={colIndex} className={cn("flex flex-col gap-4 flex-1", className)}>
          {colItems}
        </dl>
      ))}
    </div>
  );
};

interface KVItemProps extends React.ComponentProps<"div"> {
  pair: KVPair<string, string>;
  variant?: "stacked" | "side";
}

export const KVItem = ({ pair: { key, value }, variant = "stacked" }: KVItemProps) => {
  return (
    <div
      className={cn(
        "flex break-inside-avoid",
        variant == "stacked" ? "flex-col gap-1.5" : "",
        variant == "side" ? "w-full flex-row justify-between" : "",
      )}
    >
      <dt className="font-semibold text-xs text-muted-foreground/60">{key}</dt>
      <dd className="text-xs text-foreground truncate max-w-[180px]">{value}</dd>
    </div>
  )
}
